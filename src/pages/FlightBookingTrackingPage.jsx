import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate, Link } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Loader2, Info, Plane, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';
    import { Progress } from '@/components/ui/progress';
    import { motion } from 'framer-motion';

    const stageDetails = {
      initiated: { 
        label: "Booking Initiated", 
        description: "Your flight booking request has been received. Please complete payment.", 
        progress: 10, 
        icon: <Info className="h-6 w-6 text-blue-500" />,
        nextStep: "Complete payment via Bank Deposit and send receipt to WhatsApp."
      },
      pending_deposit: { 
        label: "Awaiting Deposit", 
        description: "Waiting for you to make the bank deposit and provide reference.", 
        progress: 20, 
        icon: <Clock className="h-6 w-6 text-orange-500" />,
        nextStep: "Make bank deposit and submit reference on payment page."
      },
      pending_whatsapp_confirmation: { 
        label: "Awaiting WhatsApp Confirmation", 
        description: "We've received your payment reference. Please send your deposit receipt screenshot to our WhatsApp for verification.", 
        progress: 40, 
        icon: <MessageSquare className="h-6 w-6 text-yellow-500" />,
        nextStep: "Our team will verify your WhatsApp submission shortly."
      },
      payment_confirmed: { 
        label: "Payment Confirmed", 
        description: "Your payment has been successfully confirmed. We are now processing your booking with the airline.", 
        progress: 70, 
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        nextStep: "Airline is confirming your seat. Ticket will be issued soon."
      },
      booking_confirmed: { 
        label: "Booking Confirmed with Airline", 
        description: "Your booking is confirmed with the airline. Your e-ticket is being generated.", 
        progress: 85, 
        icon: <Plane className="h-6 w-6 text-teal-500" />,
        nextStep: "E-ticket will be available shortly."
      },
      ticket_issued: { 
        label: "Ticket Issued", 
        description: "Your e-ticket has been issued! Check your email or download it from here (feature coming soon).", 
        progress: 100, 
        icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
        nextStep: "Your booking is complete. Have a safe trip!"
      },
      cancelled: { 
        label: "Booking Cancelled", 
        description: "This booking has been cancelled.", 
        progress: 0, 
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        nextStep: "Contact support if you have questions."
      },
      failed: {
        label: "Payment Failed",
        description: "There was an issue with your payment. Please try again or contact support.",
        progress: 10,
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        nextStep: "Retry payment or contact support."
      }
    };
    
    const getStageInfo = (status) => {
        return stageDetails[status] || { label: "Unknown Status", description: "Please contact support.", progress: 0, icon: <Info className="h-6 w-6 text-gray-500" />, nextStep: "Contact support." };
    };


    const FlightBookingTrackingPage = () => {
      const { bookingId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [bookingDetails, setBookingDetails] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [currentStageInfo, setCurrentStageInfo] = useState(getStageInfo('initiated'));


      const fetchBookingDetails = useCallback(async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

          if (error) throw error;
          if (!data) throw new Error("Booking not found");
          
          setBookingDetails(data);
          setCurrentStageInfo(getStageInfo(data.booking_status));

        } catch (error) {
          console.error("Error fetching booking details:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not load booking details. " + error.message });
          navigate('/bookings');
        } finally {
          setIsLoading(false);
        }
      }, [bookingId, toast, navigate]);

      useEffect(() => {
        if (bookingId) {
          fetchBookingDetails();
        }
      }, [bookingId, fetchBookingDetails]);

      useEffect(() => {
        if (!bookingId) return;

        const channel = supabase
          .channel(`flight_booking_updates_${bookingId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'flight_bookings', filter: `id=eq.${bookingId}` },
            (payload) => {
              setBookingDetails(payload.new);
              setCurrentStageInfo(getStageInfo(payload.new.booking_status));
              toast({ title: "Booking Updated!", description: `Status changed to: ${getStageInfo(payload.new.booking_status).label}` });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }, [bookingId, toast]);
      
      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }

      if (!bookingDetails) {
        return (
          <div className="container mx-auto py-12 px-4 text-center">
            <Info className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground">We couldn't find the booking you're looking for.</p>
            <Button asChild className="mt-6"><Link to="/bookings">Go to My Bookings</Link></Button>
          </div>
        );
      }

      const flight = bookingDetails.flight_details;

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="container mx-auto py-8 px-4 md:px-6"
        >
          <Card className="max-w-3xl mx-auto shadow-2xl glassmorphism-form dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50">
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 rounded-t-lg">
              <CardTitle className="text-2xl md:text-3xl">Flight Booking Status</CardTitle>
              <CardDescription className="text-purple-200">Booking ID: {bookingDetails.id}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-700/50 text-sm space-y-1">
                <p><strong>Route:</strong> {flight.from} to {flight.to}</p>
                <p><strong>Airline:</strong> {flight.airline}</p>
                <p><strong>Departure:</strong> {new Date(flight.departureDate).toLocaleDateString()} at {flight.departureTime}</p>
                <p className="text-lg font-bold text-primary dark:text-secondary mt-2">Total Amount: {flight.price} {flight.currency}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground dark:text-white">Tracking Progress</h3>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-100 dark:bg-slate-700/60">
                  {currentStageInfo.icon}
                  <div>
                    <p className="font-semibold text-lg text-foreground dark:text-white">{currentStageInfo.label}</p>
                    <p className="text-sm text-muted-foreground dark:text-slate-300">{currentStageInfo.description}</p>
                  </div>
                </div>
                <Progress value={currentStageInfo.progress} className="w-full h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500" />
                {currentStageInfo.progress < 100 && bookingDetails.booking_status !== 'cancelled' && bookingDetails.booking_status !== 'failed' && (
                  <div className="p-3 mt-2 rounded-md bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700">
                    <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Next Step:</p>
                    <p className="text-sm text-sky-600 dark:text-sky-400">{currentStageInfo.nextStep}</p>
                  </div>
                )}
                 {bookingDetails.booking_status === 'pending_whatsapp_confirmation' && (
                    <div className="p-3 mt-2 rounded-md bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Action Required:</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            Please send your payment receipt to our WhatsApp number. 
                            <Link to={`/payment/flight/${bookingId}`} className="ml-1 font-semibold text-yellow-700 dark:text-yellow-200 hover:underline">View Payment Instructions</Link>
                        </p>
                    </div>
                )}
              </div>
              
              {bookingDetails.payment_reference_id && (
                <p className="text-xs text-muted-foreground dark:text-slate-400">Your Payment Reference: {bookingDetails.payment_reference_id}</p>
              )}

            </CardContent>
            <CardFooter className="p-6 border-t dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-muted-foreground dark:text-slate-400 text-center sm:text-left">
                    We will notify you of status changes. You can also refresh this page.
                </p>
                <Button onClick={fetchBookingDetails} variant="outline" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Refresh Status
                </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default FlightBookingTrackingPage;