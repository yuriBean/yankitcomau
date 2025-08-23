import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Plane, Loader2, CalendarDays, Briefcase, ExternalLink, MapPin, RadioTower } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { format, parseISO } from 'date-fns';

    const FlightCard = ({ flight, onBook, isLoading: cardIsLoading }) => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const currentLocation = useLocation(); 
      const [isBookingThisCard, setIsBookingThisCard] = useState(false);

      const handleBookFlight = async () => {
        setIsBookingThisCard(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please sign in to book a flight.",
          });
          navigate('/signin', { state: { from: currentLocation.pathname, searchCriteria: flight } });
          setIsBookingThisCard(false);
          return;
        }
        const userId = session.user.id;

        const bookingData = {
          user_id: userId,
          flight_details: flight, 
          total_price_ssp: flight.price, 
          payment_method: 'pending_api_booking', 
          payment_status: 'pending_confirmation', 
          booking_status: 'initiated_api', 
          departure_airport: flight.from,
          arrival_airport: flight.to,
          layover_airports: flight.layovers || null, 
          flight_number: flight.id, 
          departure_time: flight.departureDate + 'T' + flight.departureTime + ':00Z', 
          arrival_time: flight.departureDate + 'T' + flight.arrivalTime + ':00Z', 
          distance: flight.distance || 0, 
        };

        try {
          const { data: newBooking, error } = await supabase
            .from('flight_bookings') 
            .insert(bookingData)
            .select()
            .single();

          if (error) throw error;

          toast({
            title: "Booking Initiated",
            description: `Your booking for Flight ${flight.airlineCode} ${flight.id} is being processed.`,
          });
          
          if (flight.deeplink) {
             window.open(flight.deeplink, '_blank', 'noopener,noreferrer');
             onBook(newBooking.id, true); 
          } else {
            onBook(newBooking.id, false); 
          }

        } catch (error) {
          console.error("Error creating booking:", error);
          toast({
            variant: "destructive",
            title: "Booking Failed",
            description: "Could not initiate your flight booking. Please try again.",
          });
        } finally {
          setIsBookingThisCard(false);
        }
      };

      const displayLayovers = flight.layovers && flight.layovers.length > 0 
        ? flight.layovers.join(' → ') 
        : 'None';

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden glassmorphism-alt dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50">
            <CardHeader className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={`https://logos.skyscnr.com/images/airlines/favicon/${flight.airlineCode?.toLowerCase()}.png`} alt={`${flight.airline} logo`} className="h-8 w-8 rounded-sm bg-white p-0.5 shadow-sm" onError={(e) => e.target.src = '/logos/default.png'} />
                  <CardTitle className="text-lg font-semibold text-primary dark:text-secondary">{flight.airline}</CardTitle>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary">
                  {flight.stops}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground dark:text-white">{flight.departureTime}</p>
                  <p className="text-muted-foreground dark:text-slate-400">{flight.from}</p>
                </div>
                <div className="flex items-center text-muted-foreground dark:text-slate-500">
                  <Plane size={18} className="mx-2" />
                  <span className="text-xs">{flight.duration}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground dark:text-white">{flight.arrivalTime}</p>
                  <p className="text-muted-foreground dark:text-slate-400">{flight.to}</p>
                </div>
              </div>
              { (flight.layovers && flight.layovers.length > 0) && (
                <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                  <RadioTower size={14} className="mr-1 text-amber-500" />
                  <span>Layovers: {displayLayovers}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                <CalendarDays size={14} className="mr-1" />
                <span>{flight.departureDate ? format(parseISO(flight.departureDate), 'dd MMM yyyy') : 'N/A'}</span>
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                <Briefcase size={14} className="mr-1" />
                <span>{flight.standardBaggage || 'Info unavailable'}</span>
              </div>
               {flight.distance && (
                  <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                    <MapPin size={14} className="mr-1 text-green-500" />
                    <span>Distance: {flight.distance.toFixed(0)} km</span>
                  </div>
                )}
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xl font-bold text-primary dark:text-secondary">
                  {flight.currency} {flight.price ? flight.price.toFixed(2) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">per passenger</p>
              </div>
              <Button 
                onClick={handleBookFlight} 
                disabled={isBookingThisCard || cardIsLoading}
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isBookingThisCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                {isBookingThisCard ? 'Processing...' : (flight.deeplink ? 'Book on Provider' : 'Book Now')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };
    FlightCard.displayName = 'FlightCard';
    export default FlightCard;