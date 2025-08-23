
import React, { useState, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Calendar as CalendarIcon, Repeat } from 'lucide-react';
    import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
    import { cn } from "@/lib/utils";
    import { DuffelAirportSelect } from '@/components/DuffelAirportSelect';

    const AirportInputGroup = ({ 
      leg, 
      onLegChange, 
      returnDate, 
      onReturnDateChange, 
      returnDateMode,
      onReturnDateModeChange,
      tripType, 
      isLoading 
    }) => {
      const [departurePopoverOpen, setDeparturePopoverOpen] = useState(false);
      const [returnPopoverOpen, setReturnPopoverOpen] = useState(false);
      const returnDateButtonRef = useRef(null);

      const departureDateValue = leg?.departureDate;
      const departureDateModeValue = leg?.departureDateMode || 'date';
      
      const today = new Date();
      const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const toDate = addMonths(today, 12);

      const handleSwapAirports = () => {
        const tempOrigin = leg.origin;
        onLegChange('origin', leg.destination);
        onLegChange('destination', tempOrigin);
      };

      const handleDepartureDateSelect = (dateOrMonth) => {
        let newDate = dateOrMonth;
        if (departureDateModeValue === 'month' && dateOrMonth) {
           newDate = startOfMonth(dateOrMonth);
        }
        onLegChange('departureDate', newDate);
        if (departureDateModeValue === 'date' || (departureDateModeValue === 'month' && newDate)) {
          setDeparturePopoverOpen(false);
        }
        
        if (tripType === 'round-trip' && returnDateButtonRef.current && newDate && (departureDateModeValue === 'date' || (departureDateModeValue === 'month' && newDate))) {
          setTimeout(() => {
             setReturnPopoverOpen(true);
          }, 100);
        }
      };

      const handleReturnDateSelect = (dateOrMonth) => {
        let newDate = dateOrMonth;
        if (returnDateMode === 'month' && dateOrMonth) {
          newDate = startOfMonth(dateOrMonth);
        }
        onReturnDateChange(newDate);
         if (returnDateMode === 'date' || (returnDateMode === 'month' && newDate)) {
          setReturnPopoverOpen(false);
        }
      };
      
      const getDisabledCalendarDatesForReturn = (calendarDate) => {
        if (!departureDateValue) return false;
        
        const departureStart = departureDateModeValue === 'month' ? startOfMonth(departureDateValue) : departureDateValue;
        
        if (returnDateMode === 'month') {
          return startOfMonth(calendarDate) <= startOfMonth(departureStart);
        }
        if (departureDateModeValue === 'month') {
          return calendarDate <= endOfMonth(departureStart);
        }
        return calendarDate <= departureStart;
      };

      const returnCalendarDisabled = tripType === 'one-way' ? (d) => d < fromDate : getDisabledCalendarDatesForReturn;


      return (
        <div className="md:flex md:flex-wrap md:items-end md:gap-2 space-y-3 md:space-y-0">
          <div className="flex-grow min-w-[150px] md:flex-1">
            <DuffelAirportSelect
              value={leg?.origin || ""}
              onChange={(value) => onLegChange('origin', value)}
              placeholder="Origin"
              disabled={isLoading}
            />
          </div>
          <Button
            type="button" variant="ghost" size="icon"
            className="mx-auto md:mx-0 self-center text-primary hover:bg-primary/10 disabled:opacity-50"
            onClick={handleSwapAirports}
            disabled={isLoading || !leg?.origin || !leg?.destination}
            aria-label="Swap origin and destination"
          ><Repeat className="h-5 w-5" />
          </Button>
          <div className="flex-grow min-w-[150px] md:flex-1">
            <DuffelAirportSelect
              value={leg?.destination || ""}
              onChange={(value) => onLegChange('destination', value)}
              placeholder="Destination"
              disabled={isLoading}
            />
          </div>
          <div className="flex-grow min-w-[150px] md:w-auto">
            <Popover open={departurePopoverOpen} onOpenChange={setDeparturePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white", !departureDateValue && "text-muted-foreground", "md:rounded-r-none")}
                  disabled={isLoading}
                ><CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {departureDateValue ? format(departureDateValue, departureDateModeValue === 'month' ? "MMMM yyyy" : "dd MMM yyyy") : <span>Depart</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-background dark:bg-slate-800 border-border">
                <Calendar 
                  mode={departureDateModeValue === 'month' ? 'month' : 'single'} 
                  selected={departureDateValue} 
                  onSelect={departureDateModeValue === 'month' ? undefined : handleDepartureDateSelect}
                  onMonthChange={departureDateModeValue === 'month' ? handleDepartureDateSelect : undefined}
                  month={departureDateValue ? startOfMonth(departureDateValue) : undefined}
                  disabled={(date) => date < fromDate || isLoading} 
                  initialFocus={departureDateModeValue === 'single'}
                  showOutsideDays={departureDateModeValue === 'single'}
                  fromDate={fromDate}
                  toDate={toDate}
                  numberOfMonths={1}
                />
                <div className="flex justify-center mt-3">
                  {departureDateModeValue === 'date' ? (
                    <Button variant="link" onClick={() => onLegChange('departureDateMode', 'month')} className="text-primary text-sm">
                      Select entire month
                    </Button>
                  ) : (
                    <Button variant="link" onClick={() => onLegChange('departureDateMode', 'date')} className="text-primary text-sm">
                      Select specific date
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className={`flex-grow min-w-[150px] md:w-auto ${tripType === 'one-way' ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <Popover open={returnPopoverOpen} onOpenChange={setReturnPopoverOpen}>
              <PopoverTrigger asChild>
                <Button ref={returnDateButtonRef} variant={"outline"} disabled={isLoading || tripType === 'one-way'}
                  className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white",!returnDate && tripType === 'round-trip' && "text-muted-foreground", "md:rounded-l-none md:border-l-0")}
                ><CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {returnDate && tripType === 'round-trip' ? format(returnDate, returnDateMode === 'month' ? "MMMM yyyy" : "dd MMM yyyy") : <span>Return</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-background dark:bg-slate-800 border-border">
                <Calendar 
                  mode={returnDateMode === 'month' ? 'month' : 'single'} 
                  selected={returnDate} 
                  onSelect={returnDateMode === 'month' ? undefined : handleReturnDateSelect}
                  onMonthChange={returnDateMode === 'month' ? handleReturnDateSelect : undefined}
                  month={returnDate ? startOfMonth(returnDate) : (departureDateValue ? startOfMonth(departureDateValue) : undefined)}
                  disabled={returnCalendarDisabled || isLoading} 
                  initialFocus={returnDateMode === 'single'}
                  showOutsideDays={returnDateMode === 'single'}
                  fromDate={departureDateValue || fromDate}
                  toDate={toDate}
                  numberOfMonths={1}
                />
                <div className="flex justify-center mt-3">
                  {returnDateMode === 'date' ? (
                    <Button variant="link" onClick={() => onReturnDateModeChange('month')} className="text-primary text-sm">
                      Select entire month
                    </Button>
                  ) : (
                    <Button variant="link" onClick={() => onReturnDateModeChange('date')} className="text-primary text-sm">
                      Select specific date
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      );
    };

    export default AirportInputGroup;