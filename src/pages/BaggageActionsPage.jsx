
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send as SendIconLucide, Briefcase, Loader2, Info, AlertTriangle, Search, PlusCircle, ArrowRight, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BaggageSearchForm from '@/components/BaggageSearchForm';
import BaggageSearchResults from '@/components/BaggageSearchResults';
import AuthModal from '@/components/auth/AuthModal';
import { supabase } from '@/lib/customSupabaseClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { MAX_BAGGAGE_WEIGHT_PER_BAG, MAX_BAGS_PER_LISTING } from '@/config/constants';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import YankABagNowPageHeader from '@/pages/yank-a-bag-now/YankABagNowPageHeader';
import YankABagNowFormFields from '@/pages/yank-a-bag-now/YankABagNowFormFields';
import { useYankABagNowForm } from '@/pages/yank-a-bag-now/useYankABagNowForm';

const SendBaggagePageHeader = React.memo(() => (
  <motion.div 
    className="text-center mb-12"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <SendIconLucide className="w-16 h-16 text-primary mx-auto mb-4" />
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 mb-4 leading-tight md:leading-snug">
      Send a Bag
    </h1>
    <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-xl mx-auto">
      Find travellers (Yankers) heading your way who can carry your bags. Search for available bag yanking offers below.
    </p>
  </motion.div>
));
SendBaggagePageHeader.displayName = "SendBaggagePageHeader";

const LoadingIndicator = React.memo(({ message }) => (
  <div className="text-center py-10">
    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
    <p className="text-lg text-muted-foreground dark:text-slate-300">{message}</p>
  </div>
));
LoadingIndicator.displayName = "LoadingIndicator";

const NoListingsMessage = React.memo(({ title, description, variant = "default", icon: Icon = Info }) => (
  <Alert variant={variant} className={`max-w-xl mx-auto mt-12 ${variant === 'default' ? 'bg-blue-500/10 dark:bg-blue-400/20 border-blue-500/30' : 'bg-yellow-500/10 dark:bg-yellow-400/20 border-yellow-500/30'}`}>
    <Icon className={`h-5 w-5 ${variant === 'default' ? 'text-blue-500 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
    <AlertTitle className={`font-semibold ${variant === 'default' ? 'text-blue-600 dark:text-blue-300' : 'text-yellow-700 dark:text-yellow-300'}`}>{title}</AlertTitle>
    <AlertDescription className={`${variant === 'default' ? 'text-blue-600/80 dark:text-blue-300/80' : 'text-yellow-700/80 dark:text-yellow-300/80'}`}>
      {description}
    </AlertDescription>
  </Alert>
));
NoListingsMessage.displayName = "NoListingsMessage";

const InitialPromptMessage = React.memo(() => (
    <Alert variant="default" className="max-w-xl mx-auto mt-12 bg-sky-500/10 dark:bg-sky-400/20 border-sky-500/30">
        <Search className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        <AlertTitle className="font-semibold text-sky-700 dark:text-sky-300">Ready to Send Your Bag?</AlertTitle>
        <AlertDescription className="text-sky-700/80 dark:text-sky-300/80">
            Use the search form above to find travellers (Yankers) heading to your destination. Enter your origin, destination, travel date, and number of bags to see available offers.
        </AlertDescription>
    </Alert>
));
InitialPromptMessage.displayName = "InitialPromptMessage";

const ListYourBagCallout = React.memo(() => {
    const navigate = useNavigate();
    return (
        <Card className="max-w-3xl mx-auto my-12 shadow-lg hover:shadow-xl transition-shadow duration-300 glassmorphism border-none dark:bg-slate-800/50 bg-gradient-to-tr from-blue-50 via-sky-50 to-white dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <PlusCircle size={28} className="text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg md:text-xl font-bold text-foreground dark:text-white">Can't Find a Match?</CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-slate-300">
                            Let Yankers find you! List your bag and get offers from travellers.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex justify-center items-center pt-4">
                <Button 
                    onClick={() => navigate('/list-your-bag')} 
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-3 px-8 text-white"
                >
                    List Your Bag for Yankers <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
    );
});
ListYourBagCallout.displayName = "ListYourBagCallout";

const useSendBaggageLogic = (session, authLoading) => {
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [pageLoading, setPageLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stagedSearchCriteria, setStagedSearchCriteria] = useState(null);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('signin');
  
  const { toast } = useToast();
  const navigate = useNavigate(); 
  const location = useLocation(); 

  useEffect(() => {
    setCurrentUserId(session?.user?.id || null);
    if (!authLoading) {
      setPageLoading(false);
    }
  }, [session, authLoading]);

  const performSearchFilter = useCallback((searchCriteria, allFetchedListings) => {
    let results = allFetchedListings;
    if (searchCriteria.origin) results = results.filter(l => l.origin === searchCriteria.origin);
    if (searchCriteria.destination) results = results.filter(l => l.destination === searchCriteria.destination);
    if (searchCriteria.travelDate) {
      const searchDate = new Date(searchCriteria.travelDate).toISOString().split('T')[0];
      results = results.filter(l => l.departure_date && new Date(l.departure_date).toISOString().split('T')[0] === searchDate);
    }
    if (searchCriteria.numberOfBags) {
      const neededBags = parseInt(searchCriteria.numberOfBags, 10);
      if (!isNaN(neededBags) && neededBags > 0) results = results.filter(l => l.number_of_bags >= neededBags);
    }
    
    results = results.filter(l => l.available_space_kg === MAX_BAGGAGE_WEIGHT_PER_BAG);
    return results;
  }, []);

  const fetchAndFilterListings = useCallback(async (searchCriteria = null) => {
    if (!searchCriteria) {
        setFilteredListings([]);
        setSearchedOnce(false); 
        setIsLoading(false);
        setIsSearching(false);
        return;
    }
    
    setIsLoading(true);
    setIsSearching(true);
    setSearchedOnce(true);

    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id, user_id, origin, destination, departure_date, available_space_kg,
          number_of_bags, total_potential_earnings, status, created_at,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('status', 'active')
        .eq('listing_type', 'yanker') 
        .gte('number_of_bags', searchCriteria.numberOfBags ? parseInt(searchCriteria.numberOfBags, 10) : 1)
        .lte('number_of_bags', MAX_BAGS_PER_LISTING)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const fetchedData = data || [];
      const results = performSearchFilter(searchCriteria, fetchedData);
      setFilteredListings(results);
      
      if (results.length === 0) {
        toast({ variant: "default", title: "No Matches Found", description: "Try broadening your search criteria." });
      }

    } catch (error) {
      console.error("Error fetching yanking offers:", error);
      toast({ title: "Error Fetching Offers", description: error.message || "Could not load offers.", variant: "destructive" });
      setFilteredListings([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false); 
    }
  }, [toast, performSearchFilter]);

  useEffect(() => {
      const criteriaFromState = location.state?.searchCriteria || stagedSearchCriteria;
      if (criteriaFromState && !authLoading) {
        fetchAndFilterListings(criteriaFromState); 
        if (location.state?.searchCriteria) {
            navigate(location.pathname, { replace: true, state: {} });
        }
        setStagedSearchCriteria(null); 
      } else if (!authLoading) {
        setPageLoading(false);
      }
  }, [authLoading, session, fetchAndFilterListings, location.state, stagedSearchCriteria, navigate, location.pathname]);


  const handleSearchSubmit = (searchCriteria) => {
    setStagedSearchCriteria(null);
    fetchAndFilterListings(searchCriteria);
  };
  
  const handleAuthenticationSuccess = () => {
    setShowAuthModal(false);
    if (stagedSearchCriteria) {
      handleSearchSubmit(stagedSearchCriteria);
    }
    setStagedSearchCriteria(null);
  };

  const triggerAuthModal = (criteria, tab = 'signin') => {
    setStagedSearchCriteria(criteria);
    setAuthModalInitialTab(tab);
    setShowAuthModal(true);
  };

  return {
    filteredListings, isLoading, pageLoading, isSearching, searchedOnce, currentUserId,
    showAuthModal, stagedSearchCriteria, authModalInitialTab,
    setShowAuthModal, setStagedSearchCriteria, 
    handleSearchSubmit, handleAuthenticationSuccess, triggerAuthModal,
  };
};

const SendBaggageContent = () => {
  const auth = useAuth();
  const location = useLocation(); 
  
  const {
    filteredListings, isLoading, pageLoading, isSearching, searchedOnce, currentUserId,
    showAuthModal, stagedSearchCriteria, authModalInitialTab,
    setShowAuthModal, setStagedSearchCriteria,
    handleSearchSubmit, handleAuthenticationSuccess, triggerAuthModal,
  } = useSendBaggageLogic(auth?.session, auth?.loading);
  
  const renderPageContent = () => {
    if (isLoading || isSearching) return <LoadingIndicator message={isSearching ? "Searching for Yankers..." : "Loading available bag yanking offers..."} />;
    
    if (searchedOnce) {
      if (filteredListings.length > 0) return <BaggageSearchResults listings={filteredListings} currentUserId={currentUserId} pageType="send-a-bag" onAuthRequired={triggerAuthModal} />;
      return <NoListingsMessage title="No Yanking Offers Match Your Search" description="We couldn't find any bag yanking offers matching your criteria. Try adjusting your search or check back later." variant="destructive" icon={AlertTriangle} />;
    }
    
    return <InitialPromptMessage />;
  };

  if (pageLoading || auth?.loading || !auth) return <LoadingSpinner fullScreen={true} />;

  return (
    <>
      <div className="mt-8">
        <SendBaggagePageHeader />
        <BaggageSearchForm 
          onSearch={handleSearchSubmit} 
          isLoading={isSearching || isLoading} 
          initialCriteria={location.state?.searchCriteria || stagedSearchCriteria}
          pageType="send-a-bag"
        />
        {renderPageContent()}
        <ListYourBagCallout />
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => { setShowAuthModal(false); if (!auth?.session) setStagedSearchCriteria(null); }}
        onAuthSuccess={handleAuthenticationSuccess}
        initialTab={authModalInitialTab}
        searchCriteria={stagedSearchCriteria}
      />
    </>
  );
};


const YankABagContent = () => {
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
    formData, errors, isLoading, isCalculatingDistance, isCalculatingEarnings,
    estimatedDistance, estimatedEarnings, handleInputChange, handleDateChange,
    handleAirportChange, handleNumberOfBagsChange, validateForm, resetForm, isCalculationPending,
  } = useYankABagNowForm(session?.user?.id);

  useEffect(() => {
    if (!authLoading) {
        setPageLoading(false);
        if (location.state?.formData) {
            const { origin, destination, departureDate, numberOfBags } = location.state.formData;
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

      if (error) throw error;
      toast({
        title: 'Yanking Offer Listed!', description: 'Your baggage yanking offer has been successfully listed.',
        variant: 'default', className: "bg-green-500 dark:bg-green-600 text-white",
      });
      resetForm();
      navigate('/dashboard?tab=listings'); 
    } catch (error) {
      console.error('Error listing baggage:', error);
      toast({ variant: 'destructive', title: 'Error Listing Offer', description: error.message || 'An unexpected error occurred. Please try again.' });
    }
  };
  
  const handleSignInRedirect = (tab = 'signin') => {
    setStagedFormData(formData);
    setAuthModalInitialTab(tab);
    setShowAuthModal(true);
  };

  const handleAuthenticationSuccess = () => {
    setShowAuthModal(false);
    if (stagedFormData) submitListing(stagedFormData);
    setStagedFormData(null);
  };

  if (pageLoading || authLoading || !auth) return <LoadingSpinner fullScreen={true} />;
  
  return (
    <>
      <div className="mt-8">
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
                  formData={formData} handleInputChange={handleInputChange} handleDateChange={handleDateChange}
                  handleAirportChange={handleAirportChange} handleNumberOfBagsChange={handleNumberOfBagsChange}
                  errors={errors} isLoading={isLoading || pageLoading} estimatedDistance={estimatedDistance}
                  estimatedEarnings={estimatedEarnings} isCalculationPending={isCalculationPending}
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
                    type="submit" size="lg"
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


const BaggageActionsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('send');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/yank-a-bag-now')) {
      setActiveTab('yank');
    } else {
      setActiveTab('send');
    }
  }, [location.pathname]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const newPath = value === 'send' ? '/send-a-bag' : '/yank-a-bag-now';
    navigate(newPath, { replace: true });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 min-h-[calc(100vh-180px)]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 p-2">
          <TabsTrigger value="send" className="text-base h-full flex items-center justify-center gap-2">
            <SendIconLucide className="h-5 w-5" /> Send a Bag
          </TabsTrigger>
          <TabsTrigger value="yank" className="text-base h-full flex items-center justify-center gap-2">
            <Briefcase className="h-5 w-5" /> Yank a Bag
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="send">
              <SendBaggageContent />
            </TabsContent>
            <TabsContent value="yank">
              <YankABagContent />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default BaggageActionsPage;
  