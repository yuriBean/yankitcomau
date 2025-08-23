import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
    import { AnimatedButton } from "@/components/ui/animated-button";
    import { Briefcase, DollarSign, Sparkles } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const BaggageListingPromptModal = ({ isOpen, onOpenChange, flightDetails }) => {
      const navigate = useNavigate();

      if (!flightDetails) return null;

      const handleListSpace = () => {
        onOpenChange(false); 
        navigate('/list-package', { 
          state: { 
            prefillOrigin: flightDetails.from,
            prefillDestination: flightDetails.to,
            prefillDepartureDate: flightDetails.departureDate ? new Date(flightDetails.departureDate) : null,
            prefillBaggageAllowance: flightDetails.standardBaggage 
          } 
        });
      };

      const baggageInfo = flightDetails.standardBaggage || "Standard airline baggage allowance applies.";

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md md:max-w-lg glassmorphism-form dark:bg-slate-800/80 backdrop-blur-md border-primary/30">
            <DialogHeader className="text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary">
                Earn from Your Trip!
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-300 mt-2 text-sm">
                You've initiated a booking for {flightDetails.from} &rarr; {flightDetails.to}.
                <br />
                Your flight includes: <span className="font-semibold">{baggageInfo}</span>.
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-6 text-center">
              <p className="text-lg text-foreground dark:text-white">
                Got extra package space? Why not list it on TripOn24/7 and earn money by helping others send their items?
              </p>
            </div>

            <DialogFooter className="sm:justify-center gap-3">
              <DialogClose asChild>
                <AnimatedButton variant="outline" className="border-slate-400 text-slate-600 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-700" arrow={false}>
                  Maybe Later
                </AnimatedButton>
              </DialogClose>
              <AnimatedButton 
                onClick={handleListSpace} 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-95 text-white"
              >
                <DollarSign size={18} className="mr-2" /> Yes, List My Space!
              </AnimatedButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default BaggageListingPromptModal;