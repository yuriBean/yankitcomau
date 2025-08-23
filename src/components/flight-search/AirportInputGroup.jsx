import React, { useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Calendar as CalendarIcon, Repeat, CornerDownRight } from 'lucide-react';
    import { format } from "date-fns";
    import { cn } from "@/lib/utils";
    import { AirportSelect } from '@/components/AirportSelect';
    import FlightPathTypeSelector from '@/components/flight-search/FlightPathTypeSelector'; 
    import { motion, AnimatePresence } from 'framer-motion';

    const AirportInputGroup = ({ 
      leg, 
      onLegChange, 
      returnDate, 
      onReturnDateChange, 
      tripType, 
      isLoading,
      flightPathType,
      onFlightPathTypeChange,
      departurePopoverOpen,
      setDeparturePopoverOpen,
      returnPopoverOpen,
      setReturnPopoverOpen
    }) => {
      const returnDateButtonRef = useRef(null);

      const handleFlightPathTypeInternalChange = (type) => {
        onFlightPathTypeChange(type);
        if (type === 'direct') {
          onLegChange('layoverAirport', ''); 
        }
      };

      const handleDepartureDateSelect = (date) => {
        onLegChange('departureDate', date);
        setDeparturePopoverOpen(false);
        if (tripType === 'round-trip' && returnDateButtonRef.current) {
          setTimeout(() => {
            setReturnPopoverOpen(true);
          }, 100);
        }
      };

      const handleReturnDateSelect = (date) => {
        onReturnDateChange(date);
        setReturnPopoverOpen(false);
      };
      
      const handleSwapAirports = () => {
        const tempOrigin = leg.origin;
        onLegChange('origin', leg.destination);
        onLegChange('destination', tempOrigin);
      };

      const isReturnCalendarDisabled = tripType === 'one-way' ? true : (d) => leg?.departureDate && d < new Date(leg.departureDate).setDate(new Date(leg.departureDate).getDate() + 0) && d < leg.departureDate;

      return (
        <div className="space-y-3">
          {tripType !== 'multi-city' && (
            <FlightPathTypeSelector
              flightPathType={flightPathType}
              onFlightPathTypeChange={handleFlightPathTypeInternalChange}
              isLoading={isLoading}
            />
          )}

          <div className="md:flex md:flex-wrap md:items-end md:gap-2 space-y-3 md:space-y-0">
            <div className="flex-grow min-w-[150px] md:flex-1">
              <AirportSelect
                value={leg?.origin || ""}
                onChange={(value) => onLegChange('origin', value)}
                placeholder="Origin"
                disabled={isLoading}
                type="origin"
              />
            </div>
           
            {tripType !== 'multi-city' && flightPathType === 'direct' && (
                 <Button
                    type="button" variant="ghost" size="icon"
                    className="mx-auto md:mx-0 self-center text-primary hover:bg-primary/10 disabled:opacity-50"
                    onClick={handleSwapAirports}
                    disabled={isLoading || !leg?.origin || !leg?.destination}
                    aria-label="Swap origin and destination"
                  ><Repeat className="h-5 w-5" />
                  </Button>
            )}

            {tripType !== 'multi-city' && flightPathType === 'layover' && (
              <div className="flex items-center md:mx-1 self-center">
                  <CornerDownRight className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            
            <AnimatePresence>
              {tripType !== 'multi-city' && flightPathType === 'layover' && (
                <motion.div
                  className="flex-grow min-w-[150px] md:flex-1"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AirportSelect
                    id="layover-airport-selector"
                    value={leg?.layoverAirport || ""}
                    onChange={(value) => onLegChange('layoverAirport', value)}
                    placeholder="Layover City"
                    disabled={isLoading}
                    type="all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
             {tripType !== 'multi-city' && flightPathType === 'layover' && (
                 <div className="flex items-center md:mx-1 self-center">
                    <CornerDownRight className="h-5 w-5 text-muted-foreground" />
                </div>
            )}


            <div className="flex-grow min-w-[150px] md:flex-1">
              <AirportSelect
                value={leg?.destination || ""}
                onChange={(value) => onLegChange('destination', value)}
                placeholder="Destination"
                disabled={isLoading}
                type="destination"
              />
            </div>

            <div className="flex-grow min-w-[130px] md:w-auto">
              <Popover open={departurePopoverOpen} onOpenChange={setDeparturePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white", !leg?.departureDate && "text-muted-foreground", "md:rounded-r-none")}
                    disabled={isLoading}
                  ><CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {leg?.departureDate ? format(leg.departureDate, "dd MMM") : <span>Depart</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                  <Calendar mode="single" selected={leg?.departureDate} onSelect={handleDepartureDateSelect}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isLoading} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className={`flex-grow min-w-[130px] md:w-auto ${tripType === 'one-way' ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button ref={returnDateButtonRef} variant={"outline"} disabled={isLoading || tripType === 'one-way'}
                    className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white",!returnDate && tripType === 'round-trip' && "text-muted-foreground", "md:rounded-l-none md:border-l-0")}
                  ><CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {returnDate && tripType === 'round-trip' ? format(returnDate, "dd MMM") : <span>Return</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                  <Calendar mode="single" selected={returnDate} onSelect={handleReturnDateSelect}
                    disabled={isReturnCalendarDisabled || isLoading} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      );
    };

    export default AirportInputGroup;