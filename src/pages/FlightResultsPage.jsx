import React, { useState, useCallback } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    
    import PageLayout from '@/components/layouts/PageLayout'; 
    import useFlightResultsLogic from '@/components/flight-results/hooks/useFlightResultsLogic';
    import FlightResultsErrorDisplay from '@/components/flight-results/FlightResultsErrorDisplay';
    import FlightResultsNoSearchDisplay from '@/components/flight-results/FlightResultsNoSearchDisplay';
    import FlightResultsLoadingDisplay from '@/components/flight-results/FlightResultsLoadingDisplay';
    import FlightResultsNoFlightsDisplay from '@/components/flight-results/FlightResultsNoFlightsDisplay';
    import FlightResultsListDisplay from '@/components/flight-results/FlightResultsListDisplay';
    import SearchSummary from '@/components/flight-results/SearchSummary';

    const FlightResultsPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { searchCriteria, flights, isLoading, pageError } = useFlightResultsLogic(location, toast);
      const [bookingFlightId, setBookingFlightId] = useState(null);

      const handleBookFlight = useCallback(async (flightId, openedDeeplink) => {
        setBookingFlightId(flightId);
        console.log(`Attempting to book flight: ${flightId}, Deeplink opened: ${openedDeeplink}`);
        try {
          if (openedDeeplink) {
             toast({ title: "Redirecting to Provider", description: `Booking ID ${flightId}. Complete your booking on the provider's site.`, duration: 10000 });
          } else {
            toast({ title: "Booking Confirmed", description: `Flight booking ID ${flightId} has been confirmed. You can find details in 'My Bookings'.`, duration: 7000 });
          }
          navigate('/my-bookings');
        } catch (e) {
          toast({ variant: "destructive", title: "Booking Error", description: "An unexpected error occurred while attempting to book the flight." });
          console.error("Error during booking callback:", e, { flightId });
        } finally {
          setBookingFlightId(null);
          console.log("Booking process finished for flight:", flightId);
        }
      }, [toast, navigate]);

      const pageTitle = "Flight Search Results";
      const pageDescription = "Review and select your flights from the available options based on your search criteria.";

      const renderMainContent = () => {
        if (pageError) return <FlightResultsErrorDisplay error={pageError} navigate={navigate} />;
        if (!searchCriteria && !isLoading) return <FlightResultsNoSearchDisplay navigate={navigate} />;
        if (isLoading) return <FlightResultsLoadingDisplay />;
        if (flights.length === 0 && searchCriteria) return <FlightResultsNoFlightsDisplay navigate={navigate} searchCriteria={searchCriteria} />;
        if (flights.length > 0) return <FlightResultsListDisplay flights={flights} onBook={handleBookFlight} bookingFlightId={bookingFlightId} />;
        return null; 
      };

      return (
        <PageLayout title={pageTitle} description={pageDescription}>
          <div className="container mx-auto px-2 sm:px-4 py-6">
            {searchCriteria && <SearchSummary criteria={searchCriteria} flightCount={flights.length} isLoading={isLoading} />}
            <div className="mt-6">
              {renderMainContent()}
            </div>
          </div>
        </PageLayout>
      );
    };
    FlightResultsPage.displayName = 'FlightResultsPage';
    export default FlightResultsPage;