
import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Calendar as CalendarIcon, PlusCircle, XCircle, Repeat } from 'lucide-react';
    import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
    import { cn } from "@/lib/utils";
    import { DuffelAirportSelect } from '@/components/DuffelAirportSelect';

    const MultiCityLegs = ({ legs, onLegChange, addLeg, removeLeg, isLoading, maxLegs }) => {
      const [openDatePopovers, setOpenDatePopovers] = useState(Array(legs.length).fill(false));
      
      const today = new Date();
      const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const toDate = addMonths(today, 12);

      const handleDateSelect = (index, dateOrMonth) => {
        let newDate = dateOrMonth;
        const currentLeg = legs[index];
        if (currentLeg.departureDateMode === 'month' && dateOrMonth) {
          newDate = startOfMonth(dateOrMonth);
        }
        onLegChange(index, 'departureDate', newDate);
        
        const newPopoversState = [...openDatePopovers];
        if(currentLeg.departureDateMode === 'date' || (currentLeg.departureDateMode === 'month' && newDate)) {
            newPopoversState[index] = false;
        }
        setOpenDatePopovers(newPopoversState);
      };

      const toggleDatePopover = (index) => {
        const newPopoversState = openDatePopovers.map((state, i) => i === index ? !state : false);
        setOpenDatePopovers(newPopoversState);
      };
      
      const handleSwapAirports = (index) => {
        const leg = legs[index];
        const tempOrigin = leg.origin;
        onLegChange(index, 'origin', leg.destination);
        onLegChange(index, 'destination', tempOrigin);
      };

      const getDisabledCalendarDatesForLeg = (legIndex, calendarDate) => {
        const currentLeg = legs[legIndex];

        if (legIndex > 0) {
          const prevLeg = legs[legIndex - 1];
          if (prevLeg.departureDate) {
            const prevLegDepartureStart = prevLeg.departureDateMode === 'month' ? startOfMonth(prevLeg.departureDate) : prevLeg.departureDate;
            
            if (currentLeg.departureDateMode === 'month') {
               if (prevLeg.departureDateMode === 'month') {
                    return startOfMonth(calendarDate) <= startOfMonth(prevLegDepartureStart);
               } else { 
                    return startOfMonth(calendarDate) <= startOfMonth(prevLegDepartureStart); 
               }
            } else { 
              if (prevLeg.departureDateMode === 'month') {
                return calendarDate <= endOfMonth(prevLegDepartureStart);
              } else {
                return calendarDate <= prevLegDepartureStart;
              }
            }
          }
        }
        return false;
      };


      return (
        <div className="space-y-3">
          {legs.map((leg, index) => (
            <div key={index} className="md:flex md:flex-wrap md:items-center md:gap-2 space-y-3 md:space-y-0 mb-2 relative">
              <span className="absolute -left-4 top-2.5 text-xs font-bold text-primary hidden md:inline">{index + 1}</span>
              <div className="flex-grow min-w-[150px] md:flex-1">
                <DuffelAirportSelect value={leg.origin} onChange={(value) => onLegChange(index, 'origin', value)} placeholder={`Origin ${index + 1}`} disabled={isLoading}/>
              </div>
              <Button
                type="button" variant="ghost" size="icon"
                className="mx-auto md:mx-0 self-center text-primary hover:bg-primary/10 disabled:opacity-50"
                onClick={() => handleSwapAirports(index)}
                disabled={isLoading || !leg.origin || !leg.destination}
                aria-label="Swap origin and destination for this leg"
                ><Repeat className="h-5 w-5" />
              </Button>
              <div className="flex-grow min-w-[150px] md:flex-1">
                <DuffelAirportSelect value={leg.destination} onChange={(value) => onLegChange(index, 'destination', value)} placeholder={`Destination ${index + 1}`} disabled={isLoading}/>
              </div>
              <div className="flex-grow min-w-[150px] md:w-auto">
                <Popover open={openDatePopovers[index]} onOpenChange={() => toggleDatePopover(index)}>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white", !leg.departureDate && "text-muted-foreground")} disabled={isLoading}>
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {leg.departureDate ? format(leg.departureDate, (leg.departureDateMode || 'date') === 'month' ? "MMMM yyyy" : "dd MMM yyyy") : <span>Date {index+1}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 bg-background dark:bg-slate-800 border-border">
                    <Calendar 
                      mode={(leg.departureDateMode || 'date') === 'month' ? 'month' : 'single'} 
                      selected={leg.departureDate} 
                      onSelect={(leg.departureDateMode || 'date') === 'month' ? undefined : (date) => handleDateSelect(index,date)}
                      onMonthChange={(leg.departureDateMode || 'date') === 'month' ? (month) => handleDateSelect(index, month) : undefined}
                      month={leg.departureDate ? startOfMonth(leg.departureDate) : (index > 0 && legs[index-1].departureDate ? startOfMonth(legs[index-1].departureDate) : undefined)}
                      disabled={(date) => getDisabledCalendarDatesForLeg(index, date) || isLoading} 
                      initialFocus={(leg.departureDateMode || 'date') === 'single'}
                      showOutsideDays={(leg.departureDateMode || 'date') === 'single'}
                      fromDate={index > 0 && legs[index-1].departureDate ? legs[index-1].departureDate : fromDate}
                      toDate={toDate}
                      numberOfMonths={1}
                    />
                    <div className="flex justify-center mt-3">
                      {(leg.departureDateMode || 'date') === 'date' ? (
                        <Button variant="link" onClick={() => onLegChange(index, 'departureDateMode', 'month')} className="text-primary text-sm">
                          Select entire month
                        </Button>
                      ) : (
                        <Button variant="link" onClick={() => onLegChange(index, 'departureDateMode', 'date')} className="text-primary text-sm">
                          Select specific date
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {legs.length > 2 && (
                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 md:absolute md:-right-8 md:top-1/2 md:-translate-y-1/2" onClick={() => removeLeg(index)} disabled={isLoading}>
                  <XCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
          {legs.length < maxLegs && (
            <Button type="button" variant="outline" className="w-full md:w-auto mt-2 text-primary border-primary hover:bg-primary/10" onClick={addLeg} disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Flight
            </Button>
          )}
        </div>
      );
    };

    export default MultiCityLegs;