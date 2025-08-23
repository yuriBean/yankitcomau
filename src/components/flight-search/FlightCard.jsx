import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Plane, Loader2, CalendarDays, Briefcase, ExternalLink, ShoppingCart } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { format, parseISO } from 'date-fns';
    import { useNavigate } from 'react-router-dom';

    const customAirlineLogos = {
      'KP': 'https://storage.googleapis.com/hostinger-horizons-assets-prod/20c410d0-2559-4d30-9f5b-7fa1415da06e/695c042e354e08d5e86e42e176ec9ea4.png', // ASKY Airlines
      'P4': 'https://storage.googleapis.com/hostinger-horizons-assets-prod/20c410d0-2559-4d30-9f5b-7fa1415da06e/12cce542b7463c556e50c8fb5f8d7640.png', // Air Peace
      'TM': 'https://storage.googleapis.com/hostinger-horizons-assets-prod/20c410d0-2559-4d30-9f5b-7fa1415da06e/e9c6c654b633d02ce6d961bfd5e7d758.png', // LAM Mozambique Airlines UPDATED
    };

    const FlightCard = ({ flight, onBook, onBookDuffel, isLoading, onPromptBaggageListing, searchState, isDuffelApi = false }) => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [isBooking, setIsBooking] = useState(false);

      const handleBookFlightInternal = async () => {
        setIsBooking(true);
        
        if (isDuffelApi && onBookDuffel) {
          const bookingId = await onBookDuffel(flight);
        } else if (!isDuffelApi && onBook) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session || !session.user) {
            toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in." });
            navigate('/signin', { state: { from: `/flights`, searchState: searchState } });
            setIsBooking(false);
            return;
          }
          const userId = session.user.id;

          const bookingData = {
            user_id: userId,
            flight_details: { 
              id: flight.id, airline: flight.airline, airlineCode: flight.airlineCode,
              from: flight.from, to: flight.to, departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime, departureDate: flight.departureDate,
              duration: flight.duration, stops: flight.stops, price: flight.price, currency: flight.currency,
            }, 
            total_price_ssp: flight.price, payment_method: 'api_provider', 
            payment_status: 'pending_provider', booking_status: 'initiated_api', 
            api_deeplink: flight.deeplink, baggage_allowance_info: flight.standardBaggage
          };

          try {
            const { data: newBooking, error } = await supabase.from('flight_bookings').insert(bookingData).select().single();
            if (error) throw error;
            
            if (flight.deeplink) {
               window.open(flight.deeplink, '_blank', 'noopener,noreferrer');
               onBook(newBooking.id, true); 
            } else {
              toast({ title: "Booking Initiated", description: `Booking ${newBooking.id} processing.` });
              onBook(newBooking.id, false); 
            }
            onPromptBaggageListing(flight);
          } catch (error) {
            console.error("Error creating booking:", error);
            toast({ variant: "destructive", title: "Booking Failed", description: "Could not initiate booking." });
          }
        } else {
          toast({ variant: "destructive", title: "Configuration Error", description: "Booking handler not defined." });
        }
        setIsBooking(false);
      };

      const getLogoSrc = () => {
        if (customAirlineLogos[flight.airlineCode]) {
          return customAirlineLogos[flight.airlineCode];
        }
        if (isDuffelApi) {
          return `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${flight.airlineCode}.svg`;
        }
        return `https://logos.skyscnr.com/images/airlines/favicon/${flight.airlineCode.toLowerCase()}.png`;
      };

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
                  <img 
                    src={getLogoSrc()} 
                    alt={`${flight.airline} logo`} 
                    className="h-8 w-8 rounded-sm bg-white p-0.5 shadow-sm object-contain" 
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=random&size=32`;
                     }}
                  />
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
              <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                <CalendarDays size={14} className="mr-1" />
                <span>{format(parseISO(flight.departureDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="text-xs text-muted-foreground dark:text-slate-400 flex items-center justify-center">
                <Briefcase size={14} className="mr-1" />
                <span>{flight.standardBaggage}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xl font-bold text-primary dark:text-secondary">
                  {flight.currency} {flight.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground dark:text-slate-400">per passenger</p>
              </div>
              <Button 
                onClick={handleBookFlightInternal} 
                disabled={isBooking || isLoading}
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isDuffelApi ? <ShoppingCart className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />)}
                {isBooking ? 'Processing...' : (isDuffelApi ? 'Select Offer' : (flight.deeplink ? 'Book on Provider' : 'Book Now'))}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };
    FlightCard.displayName = 'FlightCard';

    export default FlightCard;