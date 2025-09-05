import { useForm } from 'react-hook-form';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useState, useEffect, useCallback } from 'react';
    import { MAX_BAGGAGE_WEIGHT_PER_BAG } from '@/config/constants';
    const getIata = (a) => (typeof a === 'string' ? a : a?.value ?? null);
    const MIN_PER_BAG_EARNINGS = 5; 
    export const useListBaggageForm = () => {
        const { session } = useAuth();
        const navigate = useNavigate();
        const { toast } = useToast();
        const [isLoading, setIsLoading] = useState(false);
        const [estimatedDistance, setEstimatedDistance] = useState(null);
        const [estimatedEarnings, setEstimatedEarnings] = useState(null);
        const [estimateAttempted, setEstimateAttempted] = useState(false);
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
            const o = getIata(origin);
            const d = getIata(destination);
          
            if (o && d) {
              setEstimateAttempted(true);               // <— mark we tried
              setIsLoading(true);
              setEstimatedDistance(null);
              setEstimatedEarnings(null);
          
              if (o === d) {
                form.setError("destination", { type: "manual", message: "Origin and destination airports cannot be the same." });
                setIsLoading(false);
                return;
              }
          
              try {
                const { data, error } = await supabase
                  .from('flight_routes_data')
                  .select('distance_km, yanker_earnings')
                  .eq('origin_iata', o)
                  .eq('destination_iata', d)
                  .maybeSingle();
          
                if (error || !data) {
                  setEstimatedDistance(null);
                  setEstimatedEarnings(null);
                } else {
                  setEstimatedDistance(Number(data.distance_km ?? 0) || null);
                  setEstimatedEarnings(Number(data.yanker_earnings ?? 0) || null);
                  form.clearErrors("destination");
                }
              } catch {
                setEstimatedDistance(null);
                setEstimatedEarnings(null);
              } finally {
                setIsLoading(false);
              }
            } else {
              setEstimateAttempted(false);              // <— reset if fields incomplete
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
              toast({ title: "Authentication Error", description: "You must be logged in to list your baggage.", variant: "destructive" });
              return;
            }
          
            const o = getIata(data.origin);
            const d = getIata(data.destination);
            if (o && d && o === d) {
              toast({ title: "Validation Error", description: "Origin and destination cannot be the same.", variant: "destructive" });
              return;
            }
          
            const bags = parseInt(data.number_of_bags, 10) || 1;
          
            // Use estimate if available and > 0; otherwise use a safe minimum per-bag earning (> 0)
            const perBagEarnings = (estimatedEarnings && Number(estimatedEarnings) > 0)
              ? Number(estimatedEarnings)
              : MIN_PER_BAG_EARNINGS;
          
            const perBagKg = Math.min(MAX_BAGGAGE_WEIGHT_PER_BAG, 20); // DB check requires ≤ 20
            const totalEarnings = perBagEarnings * bags;               // must be > 0 for DB check
          
            setIsLoading(true);
            try {
              const { error } = await supabase.from('listings').insert({
                user_id: session.user.id,
                origin: o,
                destination: d,
                departure_date: data.departure_date,
                available_space_kg: perBagKg,     // PER BAG, don’t multiply by bags
                number_of_bags: bags,             // 1..2
                total_potential_earnings: totalEarnings, // > 0 (passes listings_price_per_kg_check)
                status: 'active',
                listing_type: 'yanking',
              });
          
              if (error) throw error;
          
              toast({ title: "Success!", description: "Your baggage space has been listed." });
              navigate('/my-listings', { state: { activeTab: 'yanking' } });
            } catch (error) {
              console.error("Error creating listing:", error);
              toast({ title: "Error Creating Listing", description: error.message || 'An unexpected error occurred.', variant: "destructive" });
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
            estimateAttempted,         // <— new
          };
              };