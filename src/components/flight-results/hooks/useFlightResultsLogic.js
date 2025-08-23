import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { format, isValid as isValidDate, parseISO } from 'date-fns';
    import { transformFlightDataFromDb } from '@/components/flight-results/flightDataTransformer';

    const useFlightResultsLogic = (location, toast) => {
      const [searchCriteria, setSearchCriteria] = useState(null);
      const [flights, setFlights] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [pageError, setPageError] = useState(null);

      const fetchFlights = useCallback(async (criteria) => {
        setIsLoading(true);
        setPageError(null);
        setFlights([]);
        
        if (!criteria?.legs?.[0]?.origin || !criteria?.legs?.[0]?.destination) {
          const errorMsg = "Invalid search: Origin and destination are required.";
          setPageError(errorMsg);
          setIsLoading(false);
          return;
        }
        const mainLeg = criteria.legs[0];
        
        const body = {
          origin: mainLeg.origin,
          destination: mainLeg.destination,
          departureDate: mainLeg.departureDate && isValidDate(parseISO(mainLeg.departureDate)) ? format(parseISO(mainLeg.departureDate), 'yyyy-MM-dd') : null,
        };

        if (criteria.flightPathType === 'layover' && mainLeg.layoverAirport) {
          body.layover = mainLeg.layoverAirport;
        }

        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            throw new Error(`Authentication session error: ${sessionError.message}`);
          }
          if (!sessionData?.session) {
            throw new Error("Authentication required. Please sign in.");
          }
          const token = sessionData.session.access_token;

          const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('fetch-flights', {
            body: JSON.stringify(body),
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          });

          if (edgeError) {
            throw new Error(`Flight data fetch failed: ${edgeError.message}`);
          }
          if (edgeResponse?.error) {
            throw new Error(`API Error from fetch-flights: ${edgeResponse.error}`);
          }
          
          const fetchedFlights = Array.isArray(edgeResponse) ? edgeResponse : [];
          const transformed = fetchedFlights.map(transformFlightDataFromDb);
          setFlights(transformed);

          if (transformed.length === 0) {
             toast({ title: "No Flights Found", description: "No flights matched your criteria for the selected route and date.", variant: "default" });
          }
        } catch (e) {
          setPageError(e.message || "Failed to fetch flights. Check console for details.");
          toast({ variant: "destructive", title: "Fetch Error", description: e.message || "Could not load flight data." });
        } finally {
          setIsLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        if (location.state?.tripType && location.state?.legs) {
          const criteriaToSet = JSON.parse(JSON.stringify(location.state));
          setSearchCriteria(criteriaToSet);
          fetchFlights(criteriaToSet);
        } else {
          const errorMsg = "No search criteria provided. Please start a new search.";
          setPageError(errorMsg);
          setSearchCriteria(null);
          setFlights([]);
        }
      }, [location.state, fetchFlights]);

      return { searchCriteria, flights, isLoading, pageError };
    };

    export default useFlightResultsLogic;