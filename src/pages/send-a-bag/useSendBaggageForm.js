
import { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { MAX_BAGGAGE_WEIGHT_PER_BAG, MAX_BAGS_PER_LISTING } from '@/config/constants';
    import { useNavigate } from 'react-router-dom';

    export const useSendBaggageForm = (session) => {
      const [formData, setFormData] = useState({
        origin: null,
        destination: null,
        departureDate: null,
        numberOfBags: '1',
        itemDescription: '',
        termsAccepted: false,
      });
      const [errors, setErrors] = useState({});
      const [isLoading, setIsLoading] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [isCalculating, setIsCalculating] = useState(false);
      const [estimatedCost, setEstimatedCost] = useState(null);
      const { toast } = useToast();
      const navigate = useNavigate();

      const isCalculationPending = isCalculating;

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
        if (!formData.origin?.value) newErrors.origin = 'Origin airport is required.';
        if (!formData.destination?.value) newErrors.destination = 'Destination airport is required.';
        if (formData.origin?.value && formData.destination?.value && formData.origin.value === formData.destination.value) {
          newErrors.origin = 'Origin and destination cannot be the same.';
          newErrors.destination = 'Origin and destination cannot be the same.';
        }
        if (!formData.departureDate) newErrors.departureDate = 'Desired departure date is required.';
        if (!formData.numberOfBags || parseInt(formData.numberOfBags, 10) < 1) newErrors.numberOfBags = 'Number of bags must be at least 1.';
        if (parseInt(formData.numberOfBags, 10) > MAX_BAGS_PER_LISTING) newErrors.numberOfBags = `Maximum ${MAX_BAGS_PER_LISTING} bags allowed.`;
        if (!formData.itemDescription.trim()) newErrors.itemDescription = 'A description of the items is required.';
        if (formData.itemDescription.length < 10) newErrors.itemDescription = 'Description must be at least 10 characters long.';
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions.';
        
        if (estimatedCost === null && formData.origin?.value && formData.destination?.value && formData.numberOfBags) {
            newErrors.confirmation = 'Please wait for cost calculation to complete before submitting.';
        } else if (estimatedCost !== null && parseFloat(estimatedCost) <=0 && formData.origin?.value && formData.destination?.value && formData.numberOfBags) {
            newErrors.confirmation = 'Calculated cost is zero or invalid. Please check your route or contact support.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const resetForm = () => {
        setFormData({
          origin: null,
          destination: null,
          departureDate: null,
          numberOfBags: '1',
          itemDescription: '',
          termsAccepted: false,
        });
        setErrors({});
        setEstimatedCost(null);
        setIsSubmitting(false);
      };

      const fetchCost = useCallback(async () => {
        if (formData.origin?.value && formData.destination?.value) {
          setIsCalculating(true);
          setEstimatedCost(null);
          setErrors(prev => ({ ...prev, confirmation: null })); 

          try {
            const { data: routeData, error: routeError } = await supabase
              .from('flight_routes_data')
              .select('sender_shipping_cost')
              .eq('origin_iata', formData.origin.value)
              .eq('destination_iata', formData.destination.value)
              .maybeSingle();
              
            if (routeError || !routeData) {
              let msg = 'Cost data not found for this selection. Ensure it is a valid direct route.';
              if (routeError && routeError.code !== 'PGRST116') msg = routeError.message;
              
              toast({ variant: 'destructive', title: 'Calculation Error', description: msg });
              setEstimatedCost(0);
              setIsCalculating(false);
              setErrors(prev => ({ ...prev, confirmation: msg }));
              return;
            }

            const costPerBag = parseFloat(routeData.sender_shipping_cost);
            
            setEstimatedCost(parseFloat(costPerBag.toFixed(2)));
            
            if (parseFloat(costPerBag.toFixed(2)) <= 0) {
              setErrors(prev => ({ ...prev, confirmation: 'Calculated cost is zero for this route. Please select a different route or contact support.' }));
            } else {
              setErrors(prev => ({ ...prev, confirmation: null }));
            }

          } catch (error) {
            console.error('Error fetching cost:', error);
            toast({ variant: 'destructive', title: 'Calculation Error', description: error.message });
            setEstimatedCost(0);
            setErrors(prev => ({ ...prev, confirmation: 'Failed to calculate cost. Please try again.' }));
          } finally {
            setIsCalculating(false);
          }
        } else {
          setEstimatedCost(null);
        }
      }, [formData.origin, formData.destination, toast]);
      
      const submitShipmentRequest = async () => {
        if (!session?.user?.id) {
          toast({ variant: "destructive", title: "Authentication Error", description: "User not found. Please sign in again." });
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(true);
        const totalCost = estimatedCost * parseInt(formData.numberOfBags, 10);

        try {
          const { data: shipmentData, error } = await supabase
            .from('shipments')
            .insert({
              shipper_user_id: session.user.id,
              origin: formData.origin.value,
              destination: formData.destination.value,
              departure_date: formData.departureDate,
              agreed_weight_kg: MAX_BAGGAGE_WEIGHT_PER_BAG * parseInt(formData.numberOfBags, 10),
              agreed_price: totalCost,
              currency: 'USD',
              status: 'pending_payment',
              item_description: formData.itemDescription,
              is_paid: false,
            })
            .select()
            .single();

          if (error) throw error;
          
          toast({
            title: 'Shipment Request Created!',
            description: 'Next, please complete the payment to secure your request.',
            variant: 'default',
            className: "bg-green-500 dark:bg-green-600 text-white",
          });
          
          navigate(`/payment/shipment/${shipmentData.id}`);
          resetForm();

        } catch (error) {
          console.error('Error creating shipment request:', error);
          toast({
            variant: 'destructive',
            title: 'Error Creating Request',
            description: error.message || 'An unexpected error occurred. Please try again.',
          });
        } finally {
          setIsSubmitting(false);
        }
      };


      useEffect(() => {
        const timer = setTimeout(() => {
          fetchCost();
        }, 500); 
        return () => clearTimeout(timer);
      }, [fetchCost]);
      
      useEffect(() => {
        if (!session) {
          setIsLoading(false);
        }
      }, [session]);

      return {
        formData,
        errors,
        isLoading,
        isSubmitting,
        isCalculating,
        estimatedCost,
        handleInputChange,
        handleDateChange,
        handleAirportChange,
        handleNumberOfBagsChange,
        validateForm,
        resetForm,
        isCalculationPending,
        submitShipmentRequest,
      };
    };
