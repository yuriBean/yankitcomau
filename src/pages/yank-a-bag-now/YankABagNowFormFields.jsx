import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Briefcase, Info, Percent } from 'lucide-react';
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { AirportSelect } from '@/components/AirportSelect';
import { MAX_BAGGAGE_WEIGHT_PER_BAG, MAX_BAGS_PER_LISTING } from '@/config/constants';
import YankABagNowEstimatedEarningsCard from '@/pages/yank-a-bag-now/YankABagNowEstimatedEarningsCard';
const YankABagNowFormFields = ({
  formData,
  handleInputChange,
  handleDateChange,
  handleAirportChange,
  handleNumberOfBagsChange,
  errors,
  isLoading,
  estimatedDistance,
  estimatedEarnings,
  isCalculationPending
}) => {
  const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(false);
  const handleDateSelect = date => {
    handleDateChange(date);
    setIsDatePopoverOpen(false);
  };
  const shouldShowEarningsCard = formData.origin && formData.destination && formData.numberOfBags;
  let dateButtonText = "Select Date";
  if (formData.departureDate) {
    dateButtonText = format(formData.departureDate, "PPP");
  }
  return <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="origin" className="dark:text-slate-300">Origin Airport</Label>
              <AirportSelect value={formData.origin} onChange={value => handleAirportChange('origin', value)} placeholder="Select Origin Airport" disabled={isLoading} type="origin" />
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
            </div>
            <div>
              <Label htmlFor="destination" className="dark:text-slate-300">Destination Airport</Label>
              <AirportSelect value={formData.destination} onChange={value => handleAirportChange('destination', value)} placeholder="Select Destination Airport" disabled={isLoading} type="destination" />
              {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="departureDate" className="dark:text-slate-300">Departure Date</Label>
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal dark:bg-slate-700 dark:text-white", !formData.departureDate && "text-muted-foreground")} disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {dateButtonText}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                  <Calendar mode="single" selected={formData.departureDate} onSelect={handleDateSelect} disabled={date => date < new Date(new Date().setDate(new Date().getDate() - 1)) || isLoading} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.departureDate && <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>}
            </div>
            
            <div>
              <Label htmlFor="numberOfBags" className="dark:text-slate-300">Number of Bags to Yank ({MAX_BAGS_PER_LISTING} max)</Label>
              <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="numberOfBags" name="numberOfBags" type="number" value={formData.numberOfBags} onChange={e => handleNumberOfBagsChange(e.target.value)} className="pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600" disabled={isLoading} min="1" max={MAX_BAGS_PER_LISTING.toString()} placeholder="e.g., 1" />
              </div>
              {errors.numberOfBags && <p className="text-xs text-red-500 mt-1">{errors.numberOfBags}</p>}
            </div>
          </div>

          {shouldShowEarningsCard && <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }} className="mt-6 min-h-[100px]">
              <YankABagNowEstimatedEarningsCard isLoading={isCalculationPending} estimatedDistance={estimatedDistance} estimatedEarnings={estimatedEarnings} numberOfBags={formData.numberOfBags} />
            </motion.div>}

          <div className="items-top flex space-x-2 mt-4">
            <Checkbox id="termsAccepted" name="termsAccepted" checked={formData.termsAccepted} onCheckedChange={checked => handleInputChange({
        target: {
          name: 'termsAccepted',
          type: 'checkbox',
          checked
        }
      })} disabled={isLoading} className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="termsAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">I agree to the Yankit terms and conditions, including baggage restrictions and service fees.</label>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                You must accept the terms to list your baggage yanking offer.
              </p>
              {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
            </div>
          </div>
        </div>;
};
YankABagNowFormFields.displayName = "YankABagNowFormFields";
export default YankABagNowFormFields;