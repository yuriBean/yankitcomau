import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Info, CreditCard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ShipmentPaymentPage = () => {
    const { shipmentId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { session } = useAuth();
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [paymentLink, setPaymentLink] = useState(null);

    const fetchShipmentDetails = useCallback(async () => {
        if (!shipmentId) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('shipments')
                .select(`
                    *,
                    listing:listings(origin, destination),
                    traveler:traveler_user_id(full_name, avatar_url),
                    shipper:shipper_user_id(full_name, avatar_url)
                `)
                .eq('id', shipmentId)
                .single();

            if (error || !data) throw error || new Error("Shipment not found");
            
            if (data.shipper_user_id !== session?.user?.id) {
                 toast({ variant: "destructive", title: "Unauthorized", description: "You are not authorized to pay for this shipment." });
                 navigate('/my-shipments');
                 return;
            }

            if (data.status !== 'pending_payment') {
                toast({ title: "Payment Not Required", description: "This shipment is not currently awaiting payment." });
                navigate(`/shipment-tracking/${shipmentId}`);
                return;
            }

            setShipmentDetails(data);
            
            // Check for existing payment link
            const { data: paymentData } = await supabase
                .from('shipment_payments')
                .select('revolut_payment_url')
                .eq('shipment_id', shipmentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if(paymentData?.revolut_payment_url) {
                setPaymentLink(paymentData.revolut_payment_url);
            }

        } catch (error) {
            console.error("Error fetching shipment details:", error);
            toast({ variant: "destructive", title: "Error", description: `Could not load shipment details: ${error.message}` });
            navigate('/my-shipments');
        } finally {
            setIsLoading(false);
        }
    }, [shipmentId, toast, navigate, session?.user?.id]);


    useEffect(() => {
        fetchShipmentDetails();
    }, [fetchShipmentDetails]);

    const handleGeneratePaymentLink = async () => {
        setIsGeneratingLink(true);
        try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('create-revolut-payment-link', {
                body: {
                    shipmentId: shipmentDetails.id,
                    amount: shipmentDetails.agreed_price * 100, // Convert to cents/minor units
                    currency: shipmentDetails.currency,
                },
            });
            
            if (functionError) throw functionError;
            
            if (functionData.error) throw new Error(functionData.error);

            if (functionData.paymentUrl) {
                setPaymentLink(functionData.paymentUrl);
                
                // Update shipment status to awaiting_yanker
                const { error: updateError } = await supabase
                    .from('shipments')
                    .update({ status: 'awaiting_yanker' })
                    .eq('id', shipmentId);

                if (updateError) {
                    toast({ variant: "destructive", title: "Status Update Failed", description: "Could not update shipment status, but your link is ready." });
                } else {
                    toast({ title: "Success!", description: "Revolut payment link generated. Redirecting..." });
                }

                window.location.href = functionData.paymentUrl; // Redirect to payment page
            } else {
                 throw new Error("Could not retrieve payment URL from response.");
            }

        } catch (error) {
            console.error("Error generating payment link:", error);
            toast({ variant: "destructive", title: "Link Generation Failed", description: error.message });
        } finally {
            setIsGeneratingLink(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!shipmentDetails) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <Info className="h-12 w-12 mx-auto text-destructive mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Shipment Not Found</h1>
                <p className="text-muted-foreground">We couldn't find the shipment you're looking for.</p>
                <Button onClick={() => navigate('/my-shipments')} className="mt-6">Go to My Shipments</Button>
            </div>
        );
    }

    const origin = shipmentDetails.listing?.origin || shipmentDetails.origin;
    const destination = shipmentDetails.listing?.destination || shipmentDetails.destination;
    const travelerName = shipmentDetails.traveler?.full_name || 'To be assigned';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="container mx-auto py-8 px-4 md:px-6"
        >
            <Card className="max-w-xl mx-auto shadow-2xl glassmorphism-form dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50">
                <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 rounded-t-lg">
                    <CardTitle className="text-2xl md:text-3xl">Complete Your Shipment Payment</CardTitle>
                    <CardDescription className="text-purple-200">Shipment ID: {shipmentDetails.id.substring(0,8)}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-white">Shipment Summary</h3>
                        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm space-y-1">
                            <p><strong>Route:</strong> {origin} to {destination}</p>
                            <p><strong>Traveler (Yanker):</strong> {travelerName}</p>
                            <p><strong>Agreed Weight:</strong> {shipmentDetails.agreed_weight_kg} kg</p>
                            <p className="text-xl font-bold text-primary dark:text-secondary mt-2">
                                Total Amount: {shipmentDetails.agreed_price} {shipmentDetails.currency}
                            </p>
                        </div>
                    </div>
                    
                     <div className="text-center">
                        {paymentLink ? (
                            <div className="space-y-4">
                                <p className="text-muted-foreground">You already have a payment link. Click to complete your payment.</p>
                                <Button onClick={() => window.location.href = paymentLink} className="w-full text-lg py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90">
                                    <CreditCard className="mr-2 h-5 w-5" /> Pay Now
                                </Button>
                                <Button onClick={handleGeneratePaymentLink} variant="outline" className="w-full" disabled={isGeneratingLink}>
                                    {isGeneratingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Generate New Link
                                </Button>
                            </div>
                        ) : (
                             <Button onClick={handleGeneratePaymentLink} className="w-full text-lg py-6 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90" disabled={isGeneratingLink}>
                                {isGeneratingLink ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                {isGeneratingLink ? 'Generating Link...' : 'Generate Revolut Payment Link'}
                            </Button>
                        )}
                    </div>

                </CardContent>
                 <CardFooter className="p-6 border-t dark:border-slate-700/50">
                    <p className="text-xs text-muted-foreground dark:text-slate-400">
                        You will be redirected to Revolut's secure payment page to complete your transaction. Yankit holds the funds until a traveler is found and the shipment is completed.
                    </p>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default ShipmentPaymentPage;