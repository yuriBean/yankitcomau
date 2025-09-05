
import { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { MAX_BAGGAGE_WEIGHT_PER_BAG, MAX_BAGS_PER_LISTING, BASE_EARNING, PER_KM_RATE } from '@/config/constants';

    export const useYankABagNowForm = (userId) => {
      const [formData, setFormData] = useState({
        origin: null,
        destination: null,
        departureDate: null,
        numberOfBags: '1',
        availableWeight: MAX_BAGGAGE_WEIGHT_PER_BAG.toString(), 
        termsAccepted: false,
      });
      const [errors, setErrors] = useState({});
      const [isLoading, setIsLoading] = useState(false);
      const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
      const [isCalculatingEarnings, setIsCalculatingEarnings] = useState(false);
      const [estimatedDistance, setEstimatedDistance] = useState(null);
      const [estimatedEarnings, setEstimatedEarnings] = useState(null);
      const { toast } = useToast();
      const MIN_PER_BAG_EARNINGS = 5; // > 0 to satisfy DB check
      const getIata = (a) => {
        const v = (typeof a === 'string' ? a : a?.value ?? '').toString().trim();
        return v ? v.toUpperCase() : null;
      };
            const isCalculationPending = isCalculatingDistance || isCalculatingEarnings;

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      };

      const handleDateChange = (date) => {
        setFormData((prev) => ({ ...prev, departureDate: date }));
        if (errors.departureDate) {
          setErrors(prev => ({ ...prev, departureDate: null }));
        }
      };

      const handleAirportChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      };
      
      const handleNumberOfBagsChange = (value) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) {
          setFormData(prev => ({ ...prev, numberOfBags: '1' }));
        } else if (numValue > MAX_BAGS_PER_LISTING) {
          setFormData(prev => ({ ...prev, numberOfBags: MAX_BAGS_PER_LISTING.toString() }));
          toast({
            variant: "default",
            title: "Max Bags Reached",
            description: `You can list a maximum of ${MAX_BAGS_PER_LISTING} bags.`,
          });
        } else {
          setFormData(prev => ({ ...prev, numberOfBags: value }));
        }
        if (errors.numberOfBags) {
            setErrors(prev => ({ ...prev, numberOfBags: null }));
        }
      };

      const validateForm = () => {
        const newErrors = {};
        const originCode = getIata(formData.origin);
        const destinationCode = getIata(formData.destination);
      
        if (!originCode) newErrors.origin = 'Origin airport is required.';
        if (!destinationCode) newErrors.destination = 'Destination airport is required.';
        if (!formData.departureDate) newErrors.departureDate = 'Departure date is required.';
        if (!formData.numberOfBags || parseInt(formData.numberOfBags, 10) < 1) newErrors.numberOfBags = 'Number of bags must be at least 1.';
        if (parseInt(formData.numberOfBags, 10) > MAX_BAGS_PER_LISTING) newErrors.numberOfBags = `Maximum ${MAX_BAGS_PER_LISTING} bags allowed.`;
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions.';
      
        // Do NOT block submit on earnings; show warning UI instead.
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
      

      const resetForm = () => {
        setFormData({
          origin: null,
          destination: null,
          departureDate: null,
          numberOfBags: '1',
          availableWeight: MAX_BAGGAGE_WEIGHT_PER_BAG.toString(),
          termsAccepted: false,
        });
        setErrors({});
        setEstimatedDistance(null);
        setEstimatedEarnings(null);
        setIsLoading(false);
      };

      const fetchDistanceAndEarnings = useCallback(async () => {
        const originCode = getIata(formData.origin);
        const destinationCode = getIata(formData.destination);
        if (originCode && destinationCode && formData.numberOfBags) {
          setIsCalculatingDistance(true);
          setIsCalculatingEarnings(true);
          setEstimatedDistance(null);
          setEstimatedEarnings(null);
          setErrors(prev => ({ ...prev, confirmation: null }));
      
          try {
            // attempt direct
            let { data: routeData, error: routeError } = await supabase
              .from('flight_routes_data')
              .select('distance_km, base_cost_per_km, service_fee_percentage')
              .eq('origin_iata', originCode)
              .eq('destination_iata', destinationCode)
              .maybeSingle();
      
            // if missing, attempt reverse
            if ((!routeData && !routeError) || routeError?.code === 'PGRST116') {
              const rev = await supabase
                .from('flight_routes_data')
                .select('distance_km, base_cost_per_km, service_fee_percentage')
                .eq('origin_iata', destinationCode)
                .eq('destination_iata', originCode)
                .maybeSingle();
              if (rev.data) routeData = rev.data;
            }
      
            const numBags = parseInt(formData.numberOfBags, 10) || 1;
      
            if (!routeData) {
              // No route in table: allow listing with a floor earnings (per bag)
              setEstimatedDistance(null);
              setEstimatedEarnings(Number((MIN_PER_BAG_EARNINGS * numBags).toFixed(2)));
              setIsCalculatingDistance(false);
              setIsCalculatingEarnings(false);
              // Optional: set a non-blocking warning message in your UI (not a destructive toast)
              return;
            }
      
            // we have a route: compute using your constants
            const distance = Number(routeData.distance_km) || 0;
            setEstimatedDistance(distance);
            setIsCalculatingDistance(false);
      
            const earnings = (BASE_EARNING + (distance * PER_KM_RATE)) * numBags;
            const rounded = Number(earnings.toFixed(2));
            setEstimatedEarnings(rounded > 0 ? rounded : MIN_PER_BAG_EARNINGS * numBags);
            setIsCalculatingEarnings(false);
            setErrors(prev => ({ ...prev, confirmation: null }));
          } catch (error) {
            console.error('Error fetching distance/earnings:', error);
            // fall back to floor, still allow submit
            const numBags = parseInt(formData.numberOfBags, 10) || 1;
            setEstimatedDistance(null);
            setEstimatedEarnings(MIN_PER_BAG_EARNINGS * numBags);
            setIsCalculatingDistance(false);
            setIsCalculatingEarnings(false);
          }
        } else {
          setEstimatedDistance(null);
          setEstimatedEarnings(null);
          setIsCalculatingDistance(false);
          setIsCalculatingEarnings(false);
        }
      }, [formData.origin, formData.destination, formData.numberOfBags]);
      

      useEffect(() => {
        const timer = setTimeout(() => {
          fetchDistanceAndEarnings();
        }, 500); 
        return () => clearTimeout(timer);
      }, [fetchDistanceAndEarnings]);
      
      useEffect(() => {
        if (!userId) {
          setIsLoading(false);
        }
      }, [userId]);

      return {
        formData,
        errors,
        isLoading,
        isCalculatingDistance,
        isCalculatingEarnings,
        estimatedDistance,
        estimatedEarnings,
        handleInputChange,
        handleDateChange,
        handleAirportChange,
        handleNumberOfBagsChange,
        validateForm,
        resetForm,
        isCalculationPending,
      };
    };
