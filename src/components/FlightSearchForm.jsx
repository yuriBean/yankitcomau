import React, { useState, useRef, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent } from '@/components/ui/card';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Calendar as CalendarIcon, Users, Briefcase, Search, Loader2, Repeat, PlusCircle, XCircle } from 'lucide-react';
    import { format } from "date-fns";
    import { cn } from "@/lib/utils";
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { AirportSelect } from '@/components/AirportSelect';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

    const MAX_LEGS = 5;

    const FlightSearchForm = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      
      const initialLegState = { origin: "", destination: "", departureDate: null };
      const [legs, setLegs] = useState([initialLegState]);
      const [tripType, setTripType] = useState('round-trip'); 
      const [returnDate, setReturnDate] = useState(null);
      const [passengers, setPassengers] = useState(1);
      const [cabinClass, setCabinClass] = useState('economy');
      const [isLoading, setIsLoading] = useState(false);

      const [departurePopoverOpen, setDeparturePopoverOpen] = useState(false);
      const [returnPopoverOpen, setReturnPopoverOpen] = useState(false);
      const [multiCityDatePopoverOpen, setMultiCityDatePopoverOpen] = useState(Array(MAX_LEGS).fill(false));

      const returnDateButtonRef = useRef(null);

      const handleTripTypeChange = (type) => {
        setTripType(type);
        if (type === 'one-way') {
          setReturnDate(null);
          setLegs([{ origin: legs[0]?.origin || "", destination: legs[0]?.destination || "", departureDate: legs[0]?.departureDate || null }]);
        } else if (type === 'round-trip') {
          setLegs([{ origin: legs[0]?.origin || "", destination: legs[0]?.destination || "", departureDate: legs[0]?.departureDate || null }]);
        } else if (type === 'multi-city') {
          setReturnDate(null);
          if (legs.length === 1 && !legs[0].origin && !legs[0].destination && !legs[0].departureDate) {
            setLegs([
              initialLegState,
              initialLegState
            ]);
          } else if (legs.length < 2) {
             setLegs(prevLegs => [
              ...prevLegs,
              initialLegState
            ]);
          }
        }
      };

      const handleLegChange = (index, field, value) => {
        const newLegs = [...legs];
        newLegs[index][field] = value;
        setLegs(newLegs);
      };
      
      const handleMultiCityDateSelect = (index, date) => {
        handleLegChange(index, 'departureDate', date);
        const newPopoversState = [...multiCityDatePopoverOpen];
        newPopoversState[index] = false;
        setMultiCityDatePopoverOpen(newPopoversState);
      };
      
      const toggleMultiCityDatePopover = (index) => {
        const newPopoversState = multiCityDatePopoverOpen.map((state, i) => i === index ? !state : false);
        setMultiCityDatePopoverOpen(newPopoversState);
      };

      const addLeg = () => {
        if (legs.length < MAX_LEGS) {
          setLegs([...legs, initialLegState]);
        }
      };

      const removeLeg = (index) => {
        if (legs.length > 2) { 
          const newLegs = legs.filter((_, i) => i !== index);
          setLegs(newLegs);
        }
      };

      const handleSwapAirports = (index = 0) => {
        if (tripType === 'multi-city') {
            const newLegs = [...legs];
            const temp = newLegs[index].origin;
            newLegs[index].origin = newLegs[index].destination;
            newLegs[index].destination = temp;
            setLegs(newLegs);
        } else {
            const temp = legs[0].origin;
            handleLegChange(0, 'origin', legs[0].destination);
            handleLegChange(0, 'destination', temp);
        }
      };
      
      const handleDepartureDateSelect = (date) => {
        if (tripType === 'multi-city') return; 
        handleLegChange(0, 'departureDate', date);
        setDeparturePopoverOpen(false);
        if (tripType === 'round-trip' && returnDateButtonRef.current) {
          setTimeout(() => {
             setReturnPopoverOpen(true);
          }, 100);
        }
      };

      const handleReturnDateSelect = (date) => {
        setReturnDate(date);
        setReturnPopoverOpen(false);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let missingInfo = false;
        if (tripType === 'multi-city') {
            legs.forEach(leg => {
                if (!leg.origin || !leg.destination || !leg.departureDate) {
                    missingInfo = true;
                }
            });
        } else {
            if (!legs[0].origin || !legs[0].destination || !legs[0].departureDate) {
                missingInfo = true;
            }
            if (tripType === 'round-trip' && !returnDate) {
                missingInfo = true;
            }
        }

        if (missingInfo) {
          toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all required flight details.",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Searching for flights...",
          description: `Trip type: ${tripType}`,
        });

        await new Promise(resolve => setTimeout(resolve, 1500)); 

        setIsLoading(false);
        navigate('/flights', { state: { 
            legs: tripType === 'multi-city' ? legs : [legs[0]], 
            returnDate: tripType === 'round-trip' ? returnDate : null, 
            tripType, 
            passengers, 
            cabinClass 
        }});
      };
      
      const isReturnCalendarDisabled = tripType === 'one-way' ? true : (d) => legs[0]?.departureDate && d < new Date(legs[0].departureDate).setDate(new Date(legs[0].departureDate).getDate() + 0) && d < legs[0].departureDate;


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <Card className="w-full shadow-2xl glassmorphism border-none p-0 md:p-2">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                {['round-trip', 'one-way', 'multi-city'].map(type => (
                  <Button
                    key={type}
                    type="button"
                    variant={tripType === type ? 'secondary' : 'ghost'}
                    onClick={() => handleTripTypeChange(type)}
                    className="rounded-full text-xs md:text-sm px-3 py-1 h-auto md:px-4 md:py-2 capitalize"
                    disabled={isLoading}
                  >
                    {type.replace('-', ' ')}
                  </Button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {tripType !== 'multi-city' && (
                  <div className="md:flex md:flex-wrap md:items-end md:gap-2 space-y-3 md:space-y-0">
                    <div className="flex-grow min-w-[150px] md:flex-1">
                      <AirportSelect
                        value={legs[0]?.origin || ""}
                        onChange={(value) => handleLegChange(0, 'origin', value)}
                        placeholder="Origin"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="mx-auto md:mx-0 self-center text-primary hover:bg-primary/10 disabled:opacity-50"
                      onClick={() => handleSwapAirports()}
                      disabled={isLoading || !legs[0]?.origin || !legs[0]?.destination}
                      aria-label="Swap origin and destination"
                    ><Repeat className="h-5 w-5" />
                    </Button>
                    <div className="flex-grow min-w-[150px] md:flex-1">
                      <AirportSelect
                        value={legs[0]?.destination || ""}
                        onChange={(value) => handleLegChange(0, 'destination', value)}
                        placeholder="Destination"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex-grow min-w-[130px] md:w-auto">
                      <Popover open={departurePopoverOpen} onOpenChange={setDeparturePopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white", !legs[0]?.departureDate && "text-muted-foreground", "md:rounded-r-none")}
                            disabled={isLoading}
                          ><CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                            {legs[0]?.departureDate ? format(legs[0].departureDate, "dd MMM") : <span>Depart</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                          <Calendar mode="single" selected={legs[0]?.departureDate} onSelect={handleDepartureDateSelect}
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
                )}

                {tripType === 'multi-city' && legs.map((leg, index) => (
                  <div key={index} className="md:flex md:flex-wrap md:items-center md:gap-2 space-y-3 md:space-y-0 mb-2 relative">
                    <span className="absolute -left-4 top-2.5 text-xs font-bold text-primary hidden md:inline">{index + 1}</span>
                     <div className="flex-grow min-w-[150px] md:flex-1">
                        <AirportSelect value={leg.origin} onChange={(value) => handleLegChange(index, 'origin', value)} placeholder={`Origin ${index + 1}`} disabled={isLoading}/>
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
                        <AirportSelect value={leg.destination} onChange={(value) => handleLegChange(index, 'destination', value)} placeholder={`Destination ${index + 1}`} disabled={isLoading}/>
                    </div>
                    <div className="flex-grow min-w-[130px] md:w-auto">
                        <Popover open={multiCityDatePopoverOpen[index]} onOpenChange={() => toggleMultiCityDatePopover(index)}>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white", !leg.departureDate && "text-muted-foreground")} disabled={isLoading}>
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {leg.departureDate ? format(leg.departureDate, "dd MMM") : <span>Date {index+1}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                                <Calendar mode="single" selected={leg.departureDate} onSelect={(date) => handleMultiCityDateSelect(index,date)}
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || (index > 0 && legs[index-1].departureDate && date <= legs[index-1].departureDate) || isLoading} initialFocus />
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
                {tripType === 'multi-city' && legs.length < MAX_LEGS && (
                  <Button type="button" variant="outline" className="w-full md:w-auto mt-2 text-primary border-primary hover:bg-primary/10" onClick={addLeg} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Flight
                  </Button>
                )}

                <div className="pt-2 md:flex md:flex-wrap md:items-end md:gap-2 space-y-3 md:space-y-0">
                    <div className="flex-grow min-w-[150px] md:w-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white" disabled={isLoading}>
                                    <Users className="mr-2 h-4 w-4 text-primary" />
                                    {passengers} Passenger{passengers > 1 ? 's' : ''}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-2 bg-background dark:bg-slate-800 border-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Adults</span>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPassengers(p => Math.max(1, p - 1))} disabled={isLoading}><Users className="h-4 w-4 opacity-50" /></Button>
                                        <span className="w-8 text-center">{passengers}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPassengers(p => Math.min(9, p + 1))} disabled={isLoading}><Users className="h-4 w-4 opacity-50" /></Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    
                    <div className="flex-grow min-w-[150px] md:w-auto">
                        <Select value={cabinClass} onValueChange={setCabinClass} disabled={isLoading}>
                            <SelectTrigger className="w-full text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white">
                                <Briefcase className="mr-2 h-4 w-4 text-primary" />
                                <SelectValue placeholder="Cabin Class" />
                            </SelectTrigger>
                            <SelectContent className="bg-background dark:bg-slate-800 border-border">
                                <SelectItem value="economy">Economy</SelectItem>
                                <SelectItem value="premium_economy">Premium Economy</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="first">First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full md:w-auto text-lg py-3 md:px-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity flex items-center justify-center space-x-2" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search size={20} />}
                      <span>{isLoading ? 'Searching...' : 'Search Flights'}</span>
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default FlightSearchForm;