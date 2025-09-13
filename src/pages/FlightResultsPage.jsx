import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
// import BaggageListingPromptModal from '@/components/flight-search/BaggageListingPromptModal';
import FlightCard from '@/components/flight-search/FlightCard';
import SearchSummary from '@/components/flight-search/SearchSummary';
import LoadingState from '@/components/flight-search/LoadingState';
import NoResultsState from '@/components/flight-search/NoResultsState';
import NoSearchState from '@/components/flight-search/NoSearchState';
// import MainActionsBar from '@/components/flight-search/MainActionsBar';
import { supabase } from '@/lib/supabaseClient';

const transformDuffelOffersToFlights = (offers) => {
  if (!offers || offers.length === 0) return [];

  return offers.map((offer) => {
    const firstSlice = offer.slices[0];
    const lastSlice = offer.slices[offer.slices.length - 1];
    const firstSegment = firstSlice.segments[0];
    const lastSegment = lastSlice.segments[lastSlice.segments.length - 1];

    let totalDurationMinutes = 0;
    let totalStops = 0;

    offer.slices.forEach(slice => {
      slice.segments.forEach(segment => {
        const durationMatch = segment.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        const hours = parseInt(durationMatch?.[1] || 0);
        const minutes = parseInt(durationMatch?.[2] || 0);
        totalDurationMinutes += (hours * 60) + minutes;
      });
      totalStops += slice.segments.length - 1;
    });

    if (offer.slices.length > 1) {
      totalStops += (offer.slices.length - 1);
    }

    const totalDurationFormatted = `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`;
    const stopDescription = totalStops === 0 ? 'Direct' : `${totalStops} stop${totalStops > 1 ? 's' : ''}`;

    let standardBaggage = "Standard allowance";
    const baggage = offer.passengers?.[0]?.baggages?.[0];
    if (baggage?.quantity) {
      standardBaggage = `${baggage.quantity}pc`;
    }

    return {
      id: offer.id,
      airline: firstSegment.operating_carrier.name,
      airlineCode: firstSegment.operating_carrier.iata_code,
      from: firstSegment.origin.iata_code,
      to: lastSegment.destination.iata_code,
      departureTime: format(parseISO(firstSegment.departing_at), 'HH:mm'),
      arrivalTime: format(parseISO(lastSegment.arriving_at), 'HH:mm'),
      departureDate: format(parseISO(firstSegment.departing_at), 'yyyy-MM-dd'),
      duration: totalDurationFormatted,
      stops: stopDescription,
      price: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      standardBaggage,
      deeplink: null,
      rawOfferData: offer,
    };
  });
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const FlightResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState(location.state || null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptFlightDetails, setPromptFlightDetails] = useState(null);

  const fetchFlights = useCallback(async (criteria) => {
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.message || result.error || 'Duffel API error');
      }

      const transformed = transformDuffelOffersToFlights(result.data);
      setFlights(transformed);

      if (transformed.length === 0) {
        toast({
          title: "No Flights Found",
          description: "Try adjusting your search criteria or dates.",
        });
      }
    } catch (err) {
      console.error("Duffel fetch error:", err);
      toast({
        variant: "destructive",
        title: "Flight Search Error",
        description: err.message,
      });
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (searchCriteria) {
      fetchFlights(searchCriteria);
    } else {
      setIsLoading(false);
    }
  }, [searchCriteria, fetchFlights]);

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const handleBookFlight = async (flightOffer) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to book." });
      navigate("/signin", { state: { from: "/flights", searchState: searchCriteria } });
      return null;
    }
  
    const offerPassengerIds = flightOffer.rawOfferData?.passengers?.map(p => p.id) || [];
    const paxCount = Math.min(Math.max(1, Number(searchCriteria?.passengers ?? 1)), offerPassengerIds.length);
  
    const passengersPayload = Array.from({ length: paxCount }).map((_, i) => ({
      id: offerPassengerIds[i],
      type: "adult",
      title: "mr",
      given_name: "John",
      family_name: "Smith",
      born_on: "1990-01-01",
      gender: "m",
      email: session.user.email || "john.smith@example.com",
      phone_number: "+61400000000",
    }));
  
    const amountNum = Number(flightOffer?.price ?? flightOffer?.rawOfferData?.total_amount ?? 0);
    const amount = amountNum.toFixed(2);
    const currency = flightOffer?.currency || flightOffer?.rawOfferData?.total_currency || "AUD";
  
    const payload = {
      selectedOfferId: flightOffer.id,
      passengers: passengersPayload,
      orderType: "instant",
      payment: { type: "balance", amount, currency },
    };
  
    try {
      const resp = await fetch(`${API_BASE}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (resp.status === 402) {
        const bookingInsert = {
          user_id: session.user.id,
          flight_details: { ...flightOffer, duffel_order_id: null },
          total_amount: amountNum,
          total_currency: currency,
          payment_method: "bank_deposit_ssp",
          payment_status: "awaiting_bank_deposit",
          booking_status: "awaiting_payment",
        };
        const { data: newBooking, error: bookingError } = await supabase
          .from("flight_bookings")
          .insert(bookingInsert)
          .select()
          .single();
        if (bookingError) throw bookingError;
  
        toast({ title: "Bank Deposit Required", description: "Please complete your bank deposit to proceed." });
        navigate(`/payment/flight/${newBooking.id}`);
        return newBooking.id;
      }
  
      if (!resp.ok) {
        const errTxt = await resp.text();
        throw new Error(errTxt || "Booking request failed");
      }
  
      const booking = await resp.json();
      const duffelOrder = booking.data;
  
      const { data: newBooking, error: bookingError } = await supabase
        .from("flight_bookings")
        .insert({
          user_id: session.user.id,
          flight_details: { ...flightOffer, duffel_order_id: duffelOrder.id },
          total_amount: amountNum,
          total_currency: currency,
          payment_method: "bank_deposit_ssp",
          payment_status: "pending_deposit",
          booking_status: "initiated",
        })
        .select()
        .single();
      if (bookingError) throw bookingError;
  
      const payUrl = duffelOrder.actions?.pay?.url;
      if (payUrl) {
        toast({ title: "Redirecting to Payment", description: "Complete your booking.", duration: 7000 });
        navigate(`/payment/flight/${newBooking.id}`);
      } else {
        toast({ title: "Order Created", description: `Order ${duffelOrder.id} confirmed.` });
        navigate(`/tracking/flight/${newBooking.id}`);
      }
  
      return newBooking.id;
    } catch (err) {
      console.error("Duffel booking error:", err);
      toast({ variant: "destructive", title: "Booking Failed", description: String(err.message || err) });
      return null;
    }
  };
  
  


  

  const onPromptBaggageListing = (flight) => {
    setPromptFlightDetails(flight);
    setIsPromptOpen(true);
  };

  if (!searchCriteria && !isLoading) {
    return <NoSearchState onGoHome={() => navigate('/')} />;
  }

  return (
    <motion.div
      className="container mx-auto py-8 px-4 md:px-6 min-h-[calc(100vh-180px)]"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
    >
      <SearchSummary criteria={searchCriteria} />
      {/* <MainActionsBar /> */}

      {isLoading ? (
        <LoadingState />
      ) : flights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onBookDuffel={handleBookFlight}
              isLoading={isLoading}
              onPromptBaggageListing={onPromptBaggageListing}
              searchState={searchCriteria}
              isDuffelApi={true}
            />
          ))}
        </div>
      ) : (
        <NoResultsState onModifySearch={() => navigate('/')} />
      )}

      {/* <BaggageListingPromptModal
        isOpen={isPromptOpen}
        onOpenChange={setIsPromptOpen}
        flightDetails={promptFlightDetails}
      /> */}
    </motion.div>
  );
};

export default FlightResultsPage;
