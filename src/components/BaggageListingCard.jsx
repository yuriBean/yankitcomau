import React, {useState} from 'react';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
    import { MapPin, CalendarDays, Package, Briefcase, MessageSquare, UserCircle, ArrowRight, DollarSign } from 'lucide-react';
    import { format } from 'date-fns';
    import { useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';

    const getInitials = (name) => {
      if (!name) return '?';
      const names = name.split(' ');
      if (names.length === 1) return names[0].charAt(0).toUpperCase();
      return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    };

    export const BaggageListingCard = ({ listing, currentUserId }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [loading, setLoading] = useState(false);
      const {
        id: listingId,
        user_id: travellerUserId,
        origin,
        destination,
        departure_date,
        available_space_kg: weightPerBag, // Renamed for clarity: this is weight per bag
        number_of_bags,
        total_potential_earnings: earningsPerBag, // Renamed for clarity: this is earnings per bag
        profiles: travellerProfile,
      } = listing;

      const travellerName = travellerProfile?.full_name || 'Yanker';
      const travellerAvatarUrl = travellerProfile?.avatar_url;

      const handlePayAndHire = async () => {
        if (!currentUserId) {
          toast({ title: "Please Sign In", description: "You need to be signed in to hire a yanker.", variant: "destructive" });
          navigate('/signin');
          return;
        }
        if (currentUserId === travellerUserId) {
          toast({ title: "Action Not Allowed", description: "You cannot hire your own yanking offer." });
          return;
        }
      
        const amountCents = Math.round(Number(earningsPerBag) * 100);
        if (!amountCents || Number.isNaN(amountCents)) {
          toast({ title: "Price unavailable", description: "This listing has no valid price.", variant: "destructive" });
          return;
        }
      
        try {
          setLoading(true);
      
          // Build the redirect URL you want Stripe to come back to
          const successRedirect = `${window.location.origin}/my-activity?chatOpen=true&listingId=${listingId}&recipientId=${travellerUserId}&recipientName=${encodeURIComponent(travellerName)}`;
      
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create-checkout-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: amountCents,
              currency: "usd",
              listingId,
              travelerUserId: travellerUserId,
              shipperUserId: currentUserId,
              successRedirect,   // send to backend
            }),
          });
      
          const data = await res.json();
          if (!data?.url) throw new Error("No checkout URL returned");
      
          window.location.href = data.url; // Stripe hosted page
        } catch (err) {
          console.error("Checkout error:", err);
          toast({ title: "Payment error", description: err.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      
      const displayPrice = earningsPerBag ? `A${Number(earningsPerBag).toFixed(2)} / bag` : 'Price N/A';

      return (
        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-slate-800 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={travellerAvatarUrl || undefined} alt={travellerName} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {travellerProfile ? getInitials(travellerName) : <UserCircle size={24} />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground dark:text-white">{travellerName}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground dark:text-slate-400">Yanker (Traveller)</CardDescription>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-700/30 dark:text-green-300 px-2 py-1 rounded-full flex items-center">
                <DollarSign size={12} className="mr-1" />
                {displayPrice}
              </span>
            </div>
             <div className="flex items-center text-sm text-muted-foreground dark:text-slate-300 mt-2">
              <MapPin size={16} className="mr-2 text-primary" /> 
              <span>{origin}</span>
              <ArrowRight size={16} className="mx-2 text-slate-400 dark:text-slate-500" />
              <span>{destination}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-3 text-sm">
            <div className="flex items-center text-muted-foreground dark:text-slate-300">
              <CalendarDays size={16} className="mr-2 text-primary" /> 
              <span>Departs: {departure_date ? format(new Date(departure_date), 'PPP') : 'N/A'}</span>
            </div>
            <div className="flex items-center text-muted-foreground dark:text-slate-300">
              <Briefcase size={16} className="mr-2 text-primary" /> 
              <span>Weight per Bag: {weightPerBag} kg</span>
            </div>
            <div className="flex items-center text-muted-foreground dark:text-slate-300">
              <Package size={16} className="mr-2 text-primary" /> 
              <span>Bags Offered: {number_of_bags}</span>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
             {currentUserId !== travellerUserId ? (
                <Button onClick={handlePayAndHire}
                disabled={loading || !Number(earningsPerBag)} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white">
                  <MessageSquare size={16} className="mr-2" /> {loading ? "Redirecting..." : "Pay & Hire"}
                </Button>
              ) : (
                <Button disabled className="w-full opacity-70 cursor-not-allowed">
                  This is Your Yanking Offer
                </Button>
              )
            }
          </CardFooter>
          <p className="text-xs text-center text-muted-foreground dark:text-slate-500 pt-2 pb-3 px-4">
             Reminder: Always adhere to safety guidelines and community rules when using <span className="font-vernaccia-bold">Yankit</span>.
          </p>
        </Card>
      );
    };

    export default BaggageListingCard;