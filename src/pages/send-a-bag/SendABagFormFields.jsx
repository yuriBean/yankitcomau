import React from 'react';
    import { AirportSelect } from '@/components/AirportSelect';
    import { Label } from '@/components/ui/label';
    import { Calendar } from "@/components/ui/calendar";
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { CalendarPlus as CalendarIcon, PackagePlus } from 'lucide-react';
    import { format } from "date-fns";
    import { cn } from "@/lib/utils";
    import { MAX_BAGS_PER_LISTING } from '@/config/constants';
    import EstimatedCostCard from '@/pages/send-a-bag/EstimatedCostCard';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Checkbox } from '@/components/ui/checkbox';

    const SendABagFormFields = ({ 
      formData, 
      handleInputChange, 
      handleDateChange, 
      handleAirportChange,
      handleNumberOfBagsChange,
      errors, 
      isLoading, 
      estimatedCost,
    }) => {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="origin" className="font-semibold dark:text-slate-200">Origin Airport</Label>
              <AirportSelect
                type="origin"
                value={formData.origin}
                onChange={(selected) => handleAirportChange('origin', selected)}
                placeholder="Select Origin Airport"
                disabled={isLoading}
              />
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
            </div>
            <div>
              <Label htmlFor="destination" className="font-semibold dark:text-slate-200">Destination Airport</Label>
              <AirportSelect
                type="destination"
                value={formData.destination}
                onChange={(selected) => handleAirportChange('destination', selected)}
                placeholder="Select Destination Airport"
                disabled={isLoading}
              />
              {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="departureDate" className="font-semibold dark:text-slate-200">Desired Departure Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal dark:bg-slate-700 dark:text-white", !formData.departureDate && "text-muted-foreground")}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {formData.departureDate ? format(formData.departureDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background dark:bg-slate-800 border-border">
                <Calendar
                  mode="single"
                  selected={formData.departureDate}
                  onSelect={handleDateChange}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) || isLoading }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.departureDate && <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>}
          </div>

          <div>
            <Label htmlFor="numberOfBags" className="font-semibold dark:text-slate-200">Number of Bags to Send</Label>
            <div className="relative">
              <PackagePlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select onValueChange={handleNumberOfBagsChange} value={formData.numberOfBags} disabled={isLoading}>
                <SelectTrigger className="w-full pl-10 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                  <SelectValue placeholder="Select number of bags" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:text-white">
                  {[...Array(MAX_BAGS_PER_LISTING)].map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>{i + 1} Bag{i > 0 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.numberOfBags && <p className="text-xs text-red-500 mt-1">{errors.numberOfBags}</p>}
          </div>

          <div>
            <Label htmlFor="itemDescription" className="font-semibold dark:text-slate-200">Description of Items</Label>
            <Textarea
              id="itemDescription"
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleInputChange}
              placeholder="e.g., 'Clothes and gifts for family. No prohibited items.'"
              className="resize-y min-h-[80px] dark:bg-slate-700 dark:text-white dark:border-slate-600"
              disabled={isLoading}
            />
            {errors.itemDescription && <p className="text-xs text-red-500 mt-1">{errors.itemDescription}</p>}
          </div>

          <EstimatedCostCard
            origin={formData.origin?.value}
            destination={formData.destination?.value}
            numberOfBags={formData.numberOfBags}
            estimatedCost={estimatedCost}
          />
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange({ target: { name: 'termsAccepted', type: 'checkbox', checked } })}
              disabled={isLoading}
            />
            <label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300"
            >
              I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">terms and conditions</a>.
            </label>
            {errors.termsAccepted && <p className="text-xs text-red-500 mt-1">{errors.termsAccepted}</p>}
          </div>
        </div>
      );
    };

    export default SendABagFormFields;