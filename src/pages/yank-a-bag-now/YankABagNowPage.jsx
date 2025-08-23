
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, AlertTriangle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import YankABagNowPageHeader from '@/pages/yank-a-bag-now/YankABagNowPageHeader';
import YankABagNowFormFields from '@/pages/yank-a-bag-now/YankABagNowFormFields';
import { useYankABagNowForm } from '@/pages/yank-a-bag-now/useYankABagNowForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthModal from '@/components/auth/AuthModal';

const YankABagNowPage = () => {
  const auth = useAuth();
  const { session, loading: authLoading } = auth || {};
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [pageLoading, setPageLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('signin');
  const [stagedFormData, setStagedFormData] = useState(null);


  const {
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
  } = useYankABagNowForm(session?.user?.id);

  useEffect(() => {
    if (!authLoading) {
        setPageLoading(false);
        if (location.state?.formData) {
            const { origin, destination, departureDate, numberOfBags, availableWeight } = location.state.formData;
            if (origin) handleAirportChange('origin', origin);
            if (destination) handleAirportChange('destination', destination);
            if (departureDate) handleDateChange(new Date(departureDate));
            if (numberOfBags) handleNumberOfBagsChange(numberOfBags.toString());
            
            navigate(location.pathname, { replace: true, state: {} }); 
        }
    }
  }, [authLoading, location.state, handleAirportChange, handleDateChange, handleNumberOfBagsChange, navigate, location.pathname]);
  
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please correct the errors in the form." });
      return;
    }

    if (!session?.user) {
      setStagedFormData(formData);
      setShowAuthModal(true);
      return;
    }
    
    submitListing(formData);
  };

  const submitListing = async (dataToSubmit) => {
    if (!session?.user?.id) {
      toast({ variant: "destructive", title: "Authentication Error", description: "User not found. Please sign in again." });
      return;
    }

    try {
      const { error } = await supabase.from('listings').insert({
        user_id: session.user.id,
        origin: dataToSubmit.origin.value,
        destination: dataToSubmit.destination.value,
        departure_date: dataToSubmit.departureDate,
        available_space_kg: dataToSubmit.availableWeight,
        number_of_bags: parseInt(dataToSubmit.numberOfBags, 10),
        total_potential_earnings: estimatedEarnings, 
        status: 'active',
        listing_type: 'yanker'
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Yanking Offer Listed!',
        description: 'Your baggage yanking offer has been successfully listed.',
        variant: 'default',
        className: "bg-green-500 dark:bg-green-600 text-white",
      });
      resetForm();
      navigate('/dashboard?tab=listings'); 
    } catch (error) {
      console.error('Error listing baggage:', error);
      toast({
        variant: 'destructive',
        title: 'Error Listing Offer',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
    }
  };
  
  const handleSignInRedirect = (tab = 'signin') => {
    setStagedFormData(formData);
    setAuthModalInitialTab(tab);
    setShowAuthModal(true);
  };

  const handleAuthenticationSuccess = () => {
    setShowAuthModal(false);
    if (stagedFormData) {
      submitListing(stagedFormData);
    }
    setStagedFormData(null);
  };


  if (pageLoading || authLoading || !auth) {
    return <LoadingSpinner fullScreen={true} />;
  }
  
  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 min-h-[calc(100vh-180px)]">
        <YankABagNowPageHeader />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="max-w-3xl mx-auto shadow-2xl glassmorphism border-primary/10 dark:bg-slate-900/70 dark:border-slate-700/50">
            <CardHeader className="p-6 md:p-8 border-b border-border/30 dark:border-slate-800">
              <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground dark:text-white flex items-center mb-1">
                <Briefcase size={28} className="mr-3 text-primary dark:text-sky-400"/>
                List Your Extra Space
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground dark:text-slate-400">
                Fill in your flight details to start earning from your unused luggage space.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleFormSubmit}>
              <CardContent className="p-6 md:p-8">
                <YankABagNowFormFields 
                  formData={formData} 
                  handleInputChange={handleInputChange} 
                  handleDateChange={handleDateChange}
                  handleAirportChange={handleAirportChange}
                  handleNumberOfBagsChange={handleNumberOfBagsChange}
                  errors={errors}
                  isLoading={isLoading || pageLoading} 
                  estimatedDistance={estimatedDistance}
                  estimatedEarnings={estimatedEarnings}
                  isCalculationPending={isCalculationPending}
                />
                <div className="min-h-[60px] mt-6">
                  {errors.confirmation && (
                    <motion.div initial={{opacity:0 }} animate={{opacity:1}} transition={{duration:0.2, delay: 0.45 }}>
                      <Alert variant="destructive" className="mt-4 border-destructive/50 dark:border-destructive text-destructive dark:text-red-300 bg-destructive/10 dark:bg-destructive/20">
                          <AlertTriangle className="h-5 w-5" />
                          <AlertTitle className="font-semibold">Heads up!</AlertTitle>
                          <AlertDescription>{errors.confirmation}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-4 p-6 md:p-8 pt-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg">
                <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white text-lg font-bold py-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl" 
                    disabled={isLoading || pageLoading || isCalculationPending}
                >
                  {isLoading || pageLoading || isCalculationPending ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <DollarSign className="mr-2 h-6 w-6" />}
                  {isLoading || pageLoading ? 'Processing...' : (isCalculationPending ? 'Calculating...' : 'List Your Space & Earn')}
                </Button>
                {!session && !pageLoading && (
                    <p className="text-sm text-center text-muted-foreground dark:text-slate-400 mt-3">
                      Ready to list? You'll be asked to {" "}
                      <Button variant="link" size="sm" className="p-0 h-auto text-sm text-primary hover:underline dark:text-sky-400" onClick={() => handleSignInRedirect('signin')}>sign in</Button> or {" "}
                      <Button variant="link" size="sm" className="p-0 h-auto text-sm text-primary hover:underline dark:text-sky-400" onClick={() => handleSignInRedirect('signup')}>sign up</Button> to complete your offer.
                    </p>
                  )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => { setShowAuthModal(false); if (!session) setStagedFormData(null);}}
        onAuthSuccess={handleAuthenticationSuccess}
        initialTab={authModalInitialTab}
        formData={stagedFormData} 
      />
    </>
  );
};

export default YankABagNowPage;
