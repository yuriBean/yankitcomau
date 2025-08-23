import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { PackagePlus, Loader2, AlertTriangle, Send } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useLocation } from 'react-router-dom';
    import SendABagPageHeader from '@/pages/send-a-bag/SendABagPageHeader';
    import SendABagFormFields from '@/pages/send-a-bag/SendABagFormFields';
    import { useSendBaggageForm } from '@/pages/send-a-bag/useSendBaggageForm';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';
    import AuthModal from '@/components/auth/AuthModal';

    const SendABagPage = () => {
      const { session, loading: authLoading } = useAuth();
      const { toast } = useToast();
      const location = useLocation();

      const [pageLoading, setPageLoading] = useState(true);
      const [showAuthModal, setShowAuthModal] = useState(false);
      const [authModalInitialTab, setAuthModalInitialTab] = useState('signin');
      const [isFormSubmissionAttempted, setIsFormSubmissionAttempted] = useState(false);

      const {
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
        isCalculationPending,
        submitShipmentRequest,
      } = useSendBaggageForm(session);

      useEffect(() => {
        if (!authLoading) {
          setPageLoading(false);
        }
      }, [authLoading]);

      const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
          toast({ variant: "destructive", title: "Validation Error", description: "Please correct the errors in the form." });
          return;
        }

        if (!session?.user) {
          setIsFormSubmissionAttempted(true);
          setShowAuthModal(true);
          return;
        }
        
        await submitShipmentRequest();
      };
      
      const handleSignInRedirect = (tab = 'signin') => {
        setIsFormSubmissionAttempted(false); // Reset attempt state
        setAuthModalInitialTab(tab);
        setShowAuthModal(true);
      };

      const handleAuthenticationSuccess = () => {
        setShowAuthModal(false);
        if (isFormSubmissionAttempted && validateForm()) {
            submitShipmentRequest();
        }
        setIsFormSubmissionAttempted(false);
      };


      if (pageLoading || authLoading) {
        return <LoadingSpinner fullScreen={true} />;
      }
      
      return (
        <>
          <div className="container mx-auto py-12 px-4 md:px-6 min-h-[calc(100vh-180px)]">
            <SendABagPageHeader />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className="max-w-3xl mx-auto shadow-xl glassmorphism border-none dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground dark:text-white flex items-center">
                    <PackagePlus size={20} className="mr-3 text-primary"/>
                    Create Your Shipment Request
                  </CardTitle>
                  <CardDescription className="dark:text-slate-300">
                    Tell us what you want to send, and we'll start finding a Yanker for you. Payment is required upfront to secure your request.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleFormSubmit}>
                  <CardContent>
                    <SendABagFormFields 
                      formData={formData} 
                      handleInputChange={handleInputChange} 
                      handleDateChange={handleDateChange}
                      handleAirportChange={handleAirportChange}
                      handleNumberOfBagsChange={handleNumberOfBagsChange}
                      errors={errors}
                      isLoading={isLoading || pageLoading || isSubmitting} 
                      estimatedCost={estimatedCost}
                    />
                     <div className="min-h-[60px] mt-4">
                      {errors.confirmation && (
                        <motion.div initial={{opacity:0 }} animate={{opacity:1}} transition={{duration:0.2, delay: 0.45 }}>
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
                        disabled={isLoading || pageLoading || isSubmitting || isCalculationPending}
                      >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                      {isSubmitting ? 'Processing...' : (isCalculationPending ? 'Calculating...' : 'Create Request & Pay')}
                    </Button>
                    {!session && !pageLoading && (
                        <p className="text-xs text-center text-muted-foreground dark:text-slate-400 mt-2">
                          You will be asked to <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary hover:underline dark:text-secondary" onClick={() => handleSignInRedirect('signin')}>sign in</Button> or <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary hover:underline dark:text-secondary" onClick={() => handleSignInRedirect('signup')}>sign up</Button> to complete your request.
                        </p>
                      )}
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </div>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => { setShowAuthModal(false); setIsFormSubmissionAttempted(false); }}
            onAuthSuccess={handleAuthenticationSuccess}
            initialTab={authModalInitialTab}
            formData={formData} 
          />
        </>
      );
    };

    export default SendABagPage;