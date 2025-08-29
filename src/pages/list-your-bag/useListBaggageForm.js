import { useForm } from 'react-hook-form';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useState, useEffect, useCallback } from 'react';
    import { MAX_BAGGAGE_WEIGHT_PER_BAG } from '@/config/constants';

    export const useListBaggageForm = () => {
        const { session } = useAuth();
        const navigate = useNavigate();
        const { toast } = useToast();
        const [isLoading, setIsLoading] = useState(false);
        const [estimatedDistance, setEstimatedDistance] = useState(null);
        const [estimatedEarnings, setEstimatedEarnings] = useState(null);

        const form = useForm({
            defaultValues: {
                origin: null,
                destination: null,
                departure_date: null,
                number_of_bags: '1',
            },
        });

        const { watch } = form;
        const origin = watch('origin');
        const destination = watch('destination');
        
        const calculateEstimates = useCallback(async () => {
            if (origin && destination) {
                setIsLoading(true);
                setEstimatedDistance(null);
                setEstimatedEarnings(null);
                
                if (origin?.value === destination?.value) {
                    form.setError("destination", { type: "manual", message: "Origin and destination airports cannot be the same." });
                    setIsLoading(false);
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('flight_routes_data')
                        .select('distance_km, yanker_earnings')
                        .eq('origin_iata', origin.value)
                        .eq('destination_iata', destination.value)
                        .maybeSingle();

                    if (error || !data) {
                        setEstimatedDistance(null);
                        setEstimatedEarnings(null);
                    } else {
                        setEstimatedDistance(data.distance_km);
                        setEstimatedEarnings(data.yanker_earnings);
                        form.clearErrors("destination");
                    }
                } catch (e) {
                    setEstimatedDistance(null);
                    setEstimatedEarnings(null);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setEstimatedDistance(null);
                setEstimatedEarnings(null);
            }
        }, [origin, destination, form]);
        
        useEffect(() => {
            const debounceTimer = setTimeout(() => {
                calculateEstimates();
            }, 500); 
            
            return () => clearTimeout(debounceTimer);
        }, [origin, destination, calculateEstimates]);

        const onSubmit = async (data) => {
            if (!session?.user) {
                toast({
                    title: "Authentication Error",
                    description: "You must be logged in to list your baggage.",
                    variant: "destructive",
                });
                return;
            }
            
            if (data.origin?.value === data.destination?.value) {
                 toast({
                    title: "Validation Error",
                    description: "Origin and destination cannot be the same.",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);

            try {
                const totalEarnings = estimatedEarnings ? (estimatedEarnings * parseInt(data.number_of_bags, 10)) : 0;
                
                const { error } = await supabase.from('listings').insert({
                    user_id: session.user.id,
                    origin: data.origin.label,
                    destination: data.destination.label,
                    departure_date: data.departure_date,
                    available_space_kg: MAX_BAGGAGE_WEIGHT_PER_BAG * parseInt(data.number_of_bags, 10),
                    number_of_bags: data.number_of_bags,
                    total_potential_earnings: totalEarnings,
                    status: 'active',
                    listing_type: 'yanking',
                });

                if (error) {
                    throw error;
                }

                toast({
                    title: "Success!",
                    description: "Your baggage space has been listed.",
                });
                navigate('/my-listings', { state: { activeTab: 'yanking' } });
            } catch (error) {
                console.error("Error creating listing:", error);
                toast({
                    title: "Error Creating Listing",
                    description: error.message || 'An unexpected error occurred.',
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        return {
            form,
            isLoading,
            estimatedDistance,
            estimatedEarnings,
            onSubmit: form.handleSubmit(onSubmit),
        };
    };