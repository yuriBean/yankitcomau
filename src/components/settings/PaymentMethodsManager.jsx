import React, { useEffect, useState, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { PlusCircle, Trash2 } from 'lucide-react';

    const PaymentMethodsManager = () => {
        const { session } = useAuth();
        const { toast } = useToast();
        const [paymentMethods, setPaymentMethods] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const fetchPaymentMethods = useCallback(async () => {
            if (!session?.user?.id) return;
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('user_payment_methods')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching payment methods:', error);
                setError('Could not load your payment methods. Please try again.');
                toast({ title: 'Error', description: 'Failed to fetch payment methods.', variant: 'destructive' });
            } else {
                setPaymentMethods(data);
            }
            setLoading(false);
        }, [session?.user?.id, toast]);

        useEffect(() => {
            fetchPaymentMethods();
        }, [fetchPaymentMethods]);

        const handleAddPaymentMethod = () => {
            toast({
                title: "🚧 Feature In Development",
                description: "Adding new payment methods via Stripe is coming soon! You can request this in your next prompt.",
                className: "bg-sky-500 dark:bg-sky-600 text-white"
            });
        };
        
        const handleRemovePaymentMethod = (methodId) => {
             toast({
                title: "🚧 Feature In Development",
                description: "Removing payment methods is coming soon!",
                className: "bg-sky-500 dark:bg-sky-600 text-white"
            });
        };

        if (loading) {
            return <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>;
        }

        if (error) {
            return <p className="text-destructive text-center">{error}</p>;
        }

        return (
            <div className="space-y-4">
                {paymentMethods.length > 0 ? (
                    <ul className="space-y-3">
                        {paymentMethods.map(method => (
                            <li key={method.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 dark:bg-slate-700/30">
                                <div>
                                    <p className="font-medium text-foreground dark:text-slate-200">
                                        <span className="capitalize">{method.card_brand}</span> ending in {method.last4}
                                    </p>
                                    {method.is_default && <span className="text-xs text-primary dark:text-purple-400 font-semibold">Default</span>}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemovePaymentMethod(method.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted-foreground dark:text-slate-400 py-4">You have no saved payment methods.</p>
                )}
                <Button onClick={handleAddPaymentMethod} variant="outline" className="w-full dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Payment Method
                </Button>
            </div>
        );
    };

    export default PaymentMethodsManager;