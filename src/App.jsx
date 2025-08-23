import React, { Suspense } from 'react';
    import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { motion } from 'framer-motion';
    import { Loader2 } from 'lucide-react';

    import PageLayout from '@/components/layouts/PageLayout';
    import ScrollToTop from '@/components/ScrollToTop';
    import { AuthProvider as SupabaseAuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
    import { AppStateProvider } from '@/contexts/AppStateContext';
    import ProtectedRoute from '@/components/ProtectedRoute'; 

    // Page Imports
    const HomePage = React.lazy(() => import('@/pages/HomePage'));
    const SupportPage = React.lazy(() => import('@/pages/SupportPage'));
    const MyBookingsPage = React.lazy(() => import('@/pages/MyBookingsPage'));
    const SignInPage = React.lazy(() => import('@/pages/SignInPage'));
    const SignUpPage = React.lazy(() => import('@/pages/SignUpPage'));
    const HowItWorksPage = React.lazy(() => import('@/pages/HowItWorksPage')); 
    const YankABagNowPage = React.lazy(() => import('@/pages/yank-a-bag-now/YankABagNowPage')); 
    const SendBaggagePage = React.lazy(() => import('@/pages/SendBaggagePage'));
    const ListYourBagPage = React.lazy(() => import('@/pages/list-your-bag/ListYourBagPage'));
    const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
    const EmailConfirmationPage = React.lazy(() => import('@/pages/EmailConfirmationPage'));
    const FlightResultsPage = React.lazy(() => import('@/pages/FlightResultsPage'));
    const MyShipmentsPage = React.lazy(() => import('@/pages/MyShipmentsPage'));
    const AfricanAnecdotesPage = React.lazy(() => import('@/pages/AfricanAnecdotesPage'));
    const FlightBookingPaymentPage = React.lazy(() => import('@/pages/FlightBookingPaymentPage'));
    const FlightBookingTrackingPage = React.lazy(() => import('@/pages/FlightBookingTrackingPage'));
    
    // Static Page Imports
    const AboutPage = React.lazy(() => import('@/pages/static/AboutPage'));
    const CareersPage = React.lazy(() => import('@/pages/static/CareersPage'));
    const PressPage = React.lazy(() => import('@/pages/static/PressPage'));
    const TrustSafetyPage = React.lazy(() => import('@/pages/static/TrustSafetyPage'));
    const TermsOfServicePage = React.lazy(() => import('@/pages/static/TermsOfServicePage'));
    const PrivacyPolicyPage = React.lazy(() => import('@/pages/static/PrivacyPolicyPage'));
    const CookiePolicyPage = React.lazy(() => import('@/pages/static/CookiePolicyPage'));

    const AppLoadingScreen = () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
        <Loader2 className="w-16 h-16 text-primary dark:text-secondary animate-spin" />
      </div>
    );
    AppLoadingScreen.displayName = 'AppLoadingScreen';
    
    const routesConfig = [
      { path: "/", element: <HomePage />, name: "Home" },
      { path: "/flights", element: <FlightResultsPage />, name: "Flight Results" },
      { path: "/support", element: <SupportPage />, name: "Support" },
      { path: "/signin", element: <SignInPage />, name: "Sign In" },
      { path: "/signup", element: <SignUpPage />, name: "Sign Up" },
      { path: "/how-it-works", element: <HowItWorksPage />, name: "How It Works" }, 
      { path: "/confirm-email", element: <EmailConfirmationPage />, name: "Confirm Email" },
      { path: "/my-activity", element: <MyBookingsPage />, isProtected: true, name: "My Activity" },
      { path: "/my-bookings", element: <MyBookingsPage />, isProtected: true, name: "My Bookings" },
      { path: "/yank-a-bag-now", element: <YankABagNowPage />, name: "Yank a Bag Now" },
      { path: "/send-a-bag", element: <SendBaggagePage />, name: "Send a Bag" },
      { path: "/list-your-bag", element: <ListYourBagPage />, isProtected: true, name: "List Your Bag" },
      { path: "/dashboard", element: <DashboardPage />, isProtected: true, name: "Dashboard" },
      { path: "/my-shipments", element: <MyShipmentsPage />, isProtected: true, name: "My Shipments" },
      { path: "/african-anecdotes", element: <AfricanAnecdotesPage />, name: "African Anecdotes" },
      { path: "/payment/:bookingId", element: <FlightBookingPaymentPage />, isProtected: true, name: "Payment" },
      { path: "/tracking/:bookingId", element: <FlightBookingTrackingPage />, isProtected: true, name: "Tracking" },
      { path: "/about", element: <AboutPage />, name: "About Us" },
      { path: "/careers", element: <CareersPage />, name: "Careers" },
      { path: "/press", element: <PressPage />, name: "Press" },
      { path: "/trust-safety", element: <TrustSafetyPage />, name: "Trust & Safety" },
      { path: "/terms", element: <TermsOfServicePage />, name: "Terms of Service" },
      { path: "/privacy", element: <PrivacyPolicyPage />, name: "Privacy Policy" },
      { path: "/cookies", element: <CookiePolicyPage />, name: "Cookie Policy" },
    ];

    const AppRoutes = () => {
      const location = useLocation();
      const { session } = useAuth();
    
      return (
        <Suspense fallback={<AppLoadingScreen />}>
          <motion.div
            key={location.pathname} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-grow" 
          >
            <Routes>
              {routesConfig.map(({ path, element, isProtected, name }) => {
                const pageElement = React.cloneElement(element, { session });
                return (
                  <Route 
                    key={name || path} 
                    path={path} 
                    element={isProtected ? <ProtectedRoute>{pageElement}</ProtectedRoute> : pageElement} 
                  />
                );
              })}
            </Routes>
          </motion.div>
        </Suspense>
      );
    };
    AppRoutes.displayName = 'AppRoutes';

    function AppContent() {
      const { session, loading: authLoading } = useAuth();
      const location = useLocation();
      
      if (authLoading && session === undefined) { 
        return <AppLoadingScreen />;
      }
      
      const showChatbotOnRoutes = ['/', '/support', '/how-it-works', '/flights', '/send-a-bag', '/yank-a-bag-now'];
      const shouldShowChatbot = showChatbotOnRoutes.includes(location.pathname);

      return (
        <PageLayout session={session} showChatbot={shouldShowChatbot}>
          <AppRoutes />
        </PageLayout>
      );
    }
    AppContent.displayName = 'AppContent';
    
    function App() {
      return (
        <Router>
          <ScrollToTop />
          <AppStateProvider>
            <SupabaseAuthProvider>
              <AppContent />
            </SupabaseAuthProvider>
          </AppStateProvider>
          <Toaster />
        </Router>
      );
    }

    export default App;