import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Briefcase, CalendarPlus as CalendarIcon, PackagePlus, Info, AlertTriangle, Loader2, TrendingUp, DollarSign } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { format, parseISO } from "date-fns";
    import { cn } from "@/lib/utils";
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { AirportSelect } from '@/components/AirportSelect';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import { MAX_BAGGAGE_WEIGHT_PER_BAG, MAX_BAGS_PER_LISTING, BASE_EARNING, PER_KM_RATE } from '@/config/constants';
    import { haversineDistance, placeholderAirportCoords } from '@/lib/distanceUtils';
    import { useAuth } from '@/contexts/AuthContext';

    // const pageVariants = {
    //   initial: { opacity: 0, y: 20 },
    //   in: { opacity: 1, y: 0 },
    //   out: { opacity: 0, y: -20 }
    // };

    const ListBaggagePageHeader = React.memo(() => (
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Briefcase className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 mb-4 leading-tight md:leading-snug">
          Yank a Bag
        </h1>
        <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-xl mx-auto">
          Travelling soon? Earn money by offering your unused baggage allowance. Fill out the form below to connect with people who want to send their bags.
        </p>
      </motion.div>
    ));
    ListBaggagePageHeader.displayName = "ListBaggagePageHeader";

    const EstimatedEarningsCard = React.memo(({ origin, destination, numberOfBags, estimatedDistance, estimatedEarnings }) => {
      const showCalculating = (origin && destination) && (estimatedDistance === null || estimatedEarnings === null);
      const canDisplay = origin && destination && estimatedDistance !== null && estimatedEarnings !== null;

      return (
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg shadow">
          <CardHeader className="p-0 pb-2">
             <CardTitle className="text-md font-semibold text-primary dark:text-sky-300 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Estimated Earnings & Distance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-slate-400">Flight Distance:</span>
              <span className="font-medium text-foreground dark:text-white">
                {canDisplay ? `${estimatedDistance} km` : (showCalculating ? 'Calculating...' : 'Select airports')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-slate-400">Potential Earnings (per bag):</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                {canDisplay ? `A${estimatedEarnings.toFixed(2)}` : (showCalculating ? 'Calculating...' : 'Select airports')}
              </span>
            </div>
             {canDisplay && numberOfBags && parseInt(numberOfBags, 10) > 0 && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-300 dark:border-slate-600">
                  <span className="text-muted-foreground dark:text-slate-400 font-semibold">Total Potential Earnings:</span>
                  <span className="font-extrabold text-green-600 dark:text-green-300 text-xl">
                      A{(estimatedEarnings * parseInt(numberOfBags, 10)).toFixed(2)}
                  </span>
              </div>
            )}
          </CardContent>
        </Card>
      );
    });
    EstimatedEarningsCard.displayName = "EstimatedEarningsCard";

    const ListBaggageFormFields = React.memo(({ formData, handleDateChange, handleAirportChange, handleNumberOfBagsChange, errors, isLoading, estimatedDistance, estimatedEarnings }) => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="origin" className="font-semibold dark:text-slate-200">Origin Airport</Label>
            <AirportSelect 
              value={formData.origin} 
              onChange={(value) => handleAirportChange('origin', value)} 
              placeholder="Select Origin Airport" 
              disabled={isLoading}
            />
            {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
          </div>
          <div>
            <Label htmlFor="destination" className="font-semibold dark:text-slate-200">Destination Airport</Label>
            <AirportSelect 
              value={formData.destination} 
              onChange={(value) => handleAirportChange('destination', value)} 
              placeholder="Select Destination Airport" 
              disabled={isLoading}
            />
            {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="departureDate" className="font-semibold dark:text-slate-200">Departure Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal dark:bg-slate-700 dark:text-white", !formData.departureDate && "text-muted-foreground")}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {formData.departureDate ? format(formData.departureDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
              <Calendar
                mode="single"
                selected={formData.departureDate}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isLoading }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.departureDate && <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>}
        </div>

        <div>
          <Label htmlFor="numberOfBags" className="font-semibold dark:text-slate-200">Number of Bags You Can Carry</Label>
           <div className="relative">
            <PackagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Select
              value={formData.numberOfBags}
              onValueChange={(value) => handleNumberOfBagsChange(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                <SelectValue placeholder="Select number of bags" />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:text-white">
                <SelectItem value="1">1 Bag</SelectItem>
                <SelectItem value="2">2 Bags</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.numberOfBags && (
            <p className="text-xs text-muted-foreground mt-1 dark:text-slate-400">
              <Info className="inline-block h-3 w-3 mr-1" />
              Maximum weight is {MAX_BAGGAGE_WEIGHT_PER_BAG}kg/bag.
            </p>
          )}
          {errors.numberOfBags && <p className="text-xs text-red-500 mt-1">{errors.numberOfBags}</p>}
        </div>
        
        <EstimatedEarningsCard 
          origin={formData.origin}
          destination={formData.destination}
          numberOfBags={formData.numberOfBags}
          estimatedDistance={estimatedDistance}
          estimatedEarnings={estimatedEarnings}
        />
      </div>
    ));
    ListBaggageFormFields.displayName = "ListBaggageFormFields";
    
    const useListBaggageForm = (initialFormState) => {
      const [formData, setFormData] = useState(initialFormState);
      const [errors, setErrors] = useState({});
      const [estimatedDistance, setEstimatedDistance] = useState(null);
      const [estimatedEarnings, setEstimatedEarnings] = useState(null);
      const location = useLocation();
      const navigate = useNavigate();

      useEffect(() => {
        if (location.state?.formData) {
          const { origin, destination, departureDate, numberOfBags } = location.state.formData;
          setFormData({
            origin: origin || '',
            destination: destination || '',
            departureDate: departureDate ? parseISO(departureDate) : null,
            numberOfBags: numberOfBags || '',
          });
          navigate(location.pathname, { replace: true, state: {} }); 
        } else if (location.search) {
            const queryParams = new URLSearchParams(location.search);
            setFormData(prev => ({
                ...prev,
                origin: queryParams.get('origin') || prev.origin,
                destination: queryParams.get('destination') || prev.destination,
                departureDate: queryParams.get('departureDate') ? parseISO(queryParams.get('departureDate')) : prev.departureDate,
            }));
            navigate(location.pathname, { replace: true }); 
        }
      }, [location.state, location.search, navigate]);

      useEffect(() => {
        if (formData.origin && formData.destination) {
          setEstimatedDistance(null); 
          setEstimatedEarnings(null); 
          const originCoords = placeholderAirportCoords[formData.origin];
          const destCoords = placeholderAirportCoords[formData.destination];
          
          if (originCoords && destCoords) {
            if (formData.origin === formData.destination) {
                 setEstimatedDistance(null); 
                 setEstimatedEarnings(null);
                 setErrors(prev => ({...prev, destination: "Origin and destination airports cannot be the same."}));
            } else {
                const distance = Math.round(haversineDistance(originCoords, destCoords));
                setEstimatedDistance(distance);
                setEstimatedEarnings(BASE_EARNING + (distance * PER_KM_RATE));
                 if (errors.destination === "Origin and destination airports cannot be the same.") {
                    setErrors(prev => ({...prev, destination: null}));
                 }
            }
          } else {
            setEstimatedDistance(null); 
            setEstimatedEarnings(null);
          }
        } else {
          setEstimatedDistance(null);
          setEstimatedEarnings(null);
        }
      }, [formData.origin, formData.destination, errors.destination]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      };
      
      const handleNumberOfBagsChange = (value) => {
        setFormData(prev => ({ ...prev, numberOfBags: value }));
        if (errors.numberOfBags) {
          setErrors(prev => ({ ...prev, numberOfBags: null }));
        }
      };

      const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, departureDate: date }));
        if (errors.departureDate) {
          setErrors(prev => ({ ...prev, departureDate: null }));
        }
      };
      
      const handleAirportChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
         if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
      };

      const validateForm = () => {
        const newErrors = {};
        if (!formData.origin) newErrors.origin = "Origin airport is required.";
        if (!formData.destination) newErrors.destination = "Destination airport is required.";
        if (formData.origin && formData.destination && formData.origin === formData.destination) {
          newErrors.destination = "Origin and destination airports cannot be the same.";
        }
        if (!formData.departureDate) newErrors.departureDate = "Departure date is required.";
        else if (new Date(formData.departureDate) < new Date(new Date().toDateString())) { 
            newErrors.departureDate = "Departure date cannot be in the past.";
        }

        const bags = parseInt(formData.numberOfBags, 10);
        if (!formData.numberOfBags) newErrors.numberOfBags = "Number of bags is required.";
        else if (isNaN(bags) || bags <= 0 || bags > MAX_BAGS_PER_LISTING) {
          newErrors.numberOfBags = `Number of bags must be between 1 and ${MAX_BAGS_PER_LISTING}.`;
        }
        
        if (formData.origin && formData.destination && (estimatedDistance === null || estimatedEarnings === null) && formData.origin !== formData.destination) {
             newErrors.confirmation = "Could not calculate distance or earnings. Please check selected airports. They might not be in our current database.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
      
      return { formData, errors, estimatedDistance, estimatedEarnings, handleInputChange, handleDateChange, handleAirportChange, handleNumberOfBagsChange, validateForm, setFormData };
    };

    const ListBaggagePage = () => {
      const { session, loading: authLoading } = useAuth(); 
      const { toast } = useToast();
      const navigate = useNavigate();
      const [isLoading, setIsLoading] = useState(false);
      const [pageLoading, setPageLoading] = useState(true);
      
      const initialFormState = {
        origin: '',
        destination: '',
        departureDate: null,
        numberOfBags: '',
      };

      const { formData, errors, estimatedDistance, estimatedEarnings, handleInputChange, handleDateChange, handleAirportChange, handleNumberOfBagsChange, validateForm, setFormData } = useListBaggageForm(initialFormState);

      useEffect(() => {
        setPageLoading(authLoading);
      }, [authLoading]);
      
      const isCalculationPending = formData.origin && formData.destination && (estimatedDistance === null || estimatedEarnings === null) && formData.origin !== formData.destination;


      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session) {
          handleSignInRedirect();
          return;
        }
        if (!validateForm()) {
          toast({
            title: "Validation Error",
            description: errors.confirmation || "Please correct the errors in the form.",
            variant: "destructive",
          });
          return;
        }
         if (isCalculationPending) {
            toast({
                title: "Calculation In Progress",
                description: "Please wait for distance and earnings to be calculated or verify airport selections.",
                variant: "destructive",
            });
            return;
        }


        setIsLoading(true);
        try {
          const listingPayload = {
            user_id: session.user.id,
            origin: formData.origin,
            destination: formData.destination,
            departure_date: formData.departureDate ? format(formData.departureDate, "yyyy-MM-dd HH:mm:ssXXX") : null,
            available_space_kg: MAX_BAGGAGE_WEIGHT_PER_BAG, 
            number_of_bags: parseInt(formData.numberOfBags, 10),
            status: 'active',
            total_potential_earnings: estimatedEarnings, 
          };

          const { error } = await supabase
            .from('listings')
            .insert([listingPayload])
            .select();

          if (error) throw error;

          toast({
            title: "Baggage Offer Listed!",
            description: "You can now earn money on your baggage allocation.",
            variant: "default",
            className: "bg-green-500 dark:bg-green-700 text-white"
          });
          setFormData(initialFormState);
          navigate('/my-activity');

        } catch (error) {
          console.error("Error creating listing:", error);
          toast({
            title: "Error Listing Offer",
            description: error.message || "Could not list your offer. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      const handleSignInRedirect = () => {
        const preservedFormData = {
          ...formData,
          departureDate: formData.departureDate ? format(formData.departureDate, 'yyyy-MM-dd') : null,
        };
        toast({ 
          title: "Authentication Required", 
          description: "Please sign in or create an account to list your baggage allocation.",
          variant: "default",
          className: "bg-primary text-white dark:bg-secondary dark:text-black",
        });
        navigate('/signin', { state: { from: '/yank-a-bag', formData: preservedFormData } });
      };

      if (pageLoading) {
        return <LoadingSpinner fullScreen={true} />;
      }

      return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-[calc(100vh-180px)]">
          <ListBaggagePageHeader />
          
          <motion.div 
            initial={{ opacity: 0 }} // Simplified initial animation, y is handled by App.jsx
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }} // Slightly increased delay
          >
            <Card className="max-w-3xl mx-auto shadow-xl glassmorphism border-none dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-xl text-foreground dark:text-white">Enter Your Trip and Bag Details</CardTitle>
                <CardDescription className="dark:text-slate-300">
                  Provide accurate information to connect with those who want to send bags. You'll be charged a small service fee by <span className="font-vernaccia-bold">Yankit</span> from your earnings.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <ListBaggageFormFields 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleDateChange={handleDateChange}
                    handleAirportChange={handleAirportChange}
                    handleNumberOfBagsChange={handleNumberOfBagsChange}
                    errors={errors}
                    isLoading={isLoading || pageLoading} 
                    estimatedDistance={estimatedDistance}
                    estimatedEarnings={estimatedEarnings}
                  />
                  <div className="min-h-[60px] mt-4"> {/* Placeholder for error alert to stabilize layout */}
                    {errors.confirmation && (
                      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.2}}>
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errors.confirmation}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-4">
                  <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-3" 
                      disabled={isLoading || pageLoading || isCalculationPending}
                  >
                    {isLoading || pageLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <DollarSign className="mr-2 h-5 w-5" />}
                    {isLoading || pageLoading ? 'Processing...' : (isCalculationPending ? 'Calculating Earnings...' : 'Earn Money on Your Baggage Allocation')}
                  </Button>
                  {!session && !pageLoading && (
                      <p className="text-xs text-center text-muted-foreground dark:text-slate-400 mt-2">
                        You will be asked to <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary hover:underline dark:text-secondary" onClick={handleSignInRedirect}>sign in or sign up</Button> to complete your offer.
                      </p>
                    )}
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default ListBaggagePage;