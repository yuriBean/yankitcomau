import React, { useState, useEffect } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Loader2, CreditCard, Banknote, Info, Copy, CheckCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const FlightBookingPaymentPage = () => {
      const { bookingId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [bookingDetails, setBookingDetails] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [paymentMethod, setPaymentMethod] = useState('bank_deposit_ssp');
      const [paymentReference, setPaymentReference] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [copiedItem, setCopiedItem] = useState('');

      const placeholderBankDetails = {
        accountName: "TripOn24/7 Flights LTD",
        accountNumber: "001234567890 (SSP Account)",
        bankName: "Nile Commercial Bank (NCB)",
        branch: "Juba Main Branch",
        swiftCode: "NCBJSSJBXXX", 
      };
      const placeholderWhatsAppNumber = "+211 9XX XXX XXX (TripOn24/7 Flights)";

      useEffect(() => {
        const fetchBookingDetails = async () => {
          setIsLoading(true);
          try {
            const { data, error } = await supabase
              .from('flight_bookings')
              .select('*')
              .eq('id', bookingId)
              .single();

            if (error) throw error;
            if (!data) throw new Error("Booking not found");
            
            setBookingDetails(data);
            if (data.payment_status === 'payment_confirmed' || data.booking_status === 'ticket_issued') {
                toast({ title: "Payment Already Made", description: "This booking's payment is already confirmed or ticket issued."});
                navigate(`/tracking/flight/${bookingId}`);
            }

          } catch (error) {
            console.error("Error fetching booking details:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load booking details. " + error.message });
            navigate('/bookings');
          } finally {
            setIsLoading(false);
          }
        };

        if (bookingId) {
          fetchBookingDetails();
        }
      }, [bookingId, toast, navigate]);

      const handleCopy = (text, itemName) => {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedItem(itemName);
          toast({ title: "Copied!", description: `${itemName} copied to clipboard.` });
          setTimeout(() => setCopiedItem(''), 2000);
        }).catch(err => {
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text." });
        });
      };

      const handleSubmitPaymentInfo = async (e) => {
        e.preventDefault();
        if (paymentMethod === 'bank_deposit_ssp' && !paymentReference) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please enter your bank payment reference ID." });
          return;
        }
        setIsSubmitting(true);
        try {
          const updates = {
            payment_method: paymentMethod,
            payment_reference_id: paymentReference,
            payment_status: 'pending_whatsapp_confirmation', // User has submitted reference, waiting for WhatsApp proof
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('flight_bookings')
            .update(updates)
            .eq('id', bookingId)
            .select()
            .single();
          
          if (error) throw error;

          toast({ title: "Payment Information Submitted", description: "Please send your payment receipt screenshot to our WhatsApp number." });
          navigate(`/tracking/flight/${bookingId}`);

        } catch (error) {
          console.error("Error submitting payment info:", error);
          toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit payment information. " + error.message });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }

      if (!bookingDetails) {
        return (
          <div className="container mx-auto py-12 px-4 text-center">
            <Info className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground">We couldn't find the booking you're looking for.</p>
            <Button onClick={() => navigate('/bookings')} className="mt-6">Go to My Bookings</Button>
          </div>
        );
      }

      const flight = bookingDetails.flight_details;

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="container mx-auto py-8 px-4 md:px-6"
        >
          <Card className="max-w-2xl mx-auto shadow-2xl glassmorphism-form dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50">
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 rounded-t-lg">
              <CardTitle className="text-2xl md:text-3xl">Complete Your Flight Payment</CardTitle>
              <CardDescription className="text-purple-200">Booking ID: {bookingDetails.id}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-foreground dark:text-white">Flight Summary</h3>
                <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm space-y-1">
                  <p><strong>Route:</strong> {flight.from} to {flight.to}</p>
                  <p><strong>Airline:</strong> {flight.airline}</p>
                  <p><strong>Departure:</strong> {new Date(flight.departureDate).toLocaleDateString()} at {flight.departureTime}</p>
                  <p className="text-xl font-bold text-primary dark:text-secondary mt-2">Total Amount: {bookingDetails.total_price_ssp} SSP</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground dark:text-white">Select Payment Method</h3>
                {/* For now, only Bank Deposit is shown as per requirements */}
                <div className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'bank_deposit_ssp' ? 'border-primary ring-2 ring-primary bg-primary/5 dark:bg-secondary/10' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                  <div className="flex items-center">
                    <Banknote className={`mr-3 h-6 w-6 ${paymentMethod === 'bank_deposit_ssp' ? 'text-primary dark:text-secondary' : 'text-muted-foreground'}`} />
                    <div>
                      <h4 className="font-medium text-foreground dark:text-white">Bank Deposit (SSP)</h4>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Pay in South Sudanese Pounds via direct bank transfer.</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'bank_deposit_ssp' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="space-y-4 overflow-hidden">
                  <h4 className="text-md font-semibold text-foreground dark:text-white">Bank Deposit Instructions:</h4>
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-sm space-y-2">
                    <p>Please deposit <strong>{bookingDetails.total_price_ssp} SSP</strong> to the following account:</p>
                    {Object.entries(placeholderBankDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                         <span className="capitalize font-medium text-blue-800 dark:text-blue-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                         <div className="flex items-center">
                            <span className="text-blue-700 dark:text-blue-200 mr-2">{value}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(value, key)} className="h-6 w-6 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700">
                                {copiedItem === key ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                         </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-sm space-y-2">
                    <p>After payment, send a clear screenshot of your deposit receipt to our WhatsApp number:</p>
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-green-800 dark:text-green-300">WhatsApp:</span>
                        <div className="flex items-center">
                            <span className="text-green-700 dark:text-green-200 mr-2">{placeholderWhatsAppNumber}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(placeholderWhatsAppNumber, "WhatsApp Number")} className="h-6 w-6 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-700">
                                {copiedItem === "WhatsApp Number" ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                            </Button>
                        </div>
                    </div>
                    <p className="mt-1"><strong>Important:</strong> Include your Booking ID <strong className="text-green-700 dark:text-green-200">{bookingDetails.id}</strong> in your WhatsApp message.</p>
                  </div>
                  <form onSubmit={handleSubmitPaymentInfo} className="space-y-4">
                    <div>
                      <Label htmlFor="paymentReference" className="text-foreground dark:text-white">Bank Payment Reference ID</Label>
                      <Input 
                        id="paymentReference" 
                        type="text" 
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Enter your bank's transaction/reference ID"
                        required 
                        className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirm Payment Information Sent
                    </Button>
                  </form>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="p-6 border-t dark:border-slate-700/50">
                <p className="text-xs text-muted-foreground dark:text-slate-400">
                    Your booking will be confirmed once payment is verified. Ticket issuance follows payment confirmation. You can track your booking status on the "My Bookings" page.
                </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default FlightBookingPaymentPage;