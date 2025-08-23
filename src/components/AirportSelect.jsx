import React, { useState, useMemo } from "react";
    import { Check, ChevronsUpDown, MapPin } from "lucide-react";
    import { cn } from "@/lib/utils";
    import { Button } from "@/components/ui/button";
    import {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    } from "@/components/ui/command";
    import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from "@/components/ui/popover";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { globalAirportsList, originAirportCodes, destinationAirportCodes } from "@/lib/airportData";

    const getSortedAirports = (airports) => airports.sort((a, b) => a.label.localeCompare(b.label));

    const originAirports = getSortedAirports(
      globalAirportsList.filter(airport => originAirportCodes.includes(airport.value))
    );

    const destinationAirports = getSortedAirports(
      globalAirportsList.filter(airport => destinationAirportCodes.includes(airport.value))
    );
    
    const allUniqueAirports = getSortedAirports(
      Array.from(new Set(globalAirportsList.map(a => a.value)))
        .map(value => {
          const airport = globalAirportsList.find(a => a.value === value);
          return airport ? { ...airport } : null; 
        })
        .filter(Boolean)
    );


    export function AirportSelect({ value, onChange, placeholder, disabled, type = "all" }) {
      const [open, setOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState("");

      const availableAirports = useMemo(() => {
        if (type === "origin") {
          return originAirports;
        } else if (type === "destination") {
          return destinationAirports;
        }
        return allUniqueAirports;
      }, [type]);

      const filteredAirports = useMemo(() => {
        if (!searchTerm) return availableAirports;
        return availableAirports.filter(airport =>
          airport.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }, [searchTerm, availableAirports]);

      const selectedAirportLabel = useMemo(() => {
        return value ? globalAirportsList.find((airport) => airport.value === value)?.label : placeholder;
      }, [value, placeholder]);

      const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchTerm("");
        }
      };

      const handleSelect = (currentValue) => {
        onChange(currentValue);
        setOpen(false);
        setSearchTerm("");
      };

      return (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between text-muted-foreground hover:text-muted-foreground focus:ring-primary dark:bg-slate-700 dark:text-white truncate",
                !value && "text-muted-foreground/70"
              )}
              disabled={disabled}
            >
              <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
              <span className="truncate">
                {selectedAirportLabel || placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[calc(100vw-2rem)] max-w-[500px] sm:w-[350px] md:w-[450px] lg:w-[500px] p-0"
            side="bottom"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Type airport name or code..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>
                  {searchTerm && filteredAirports.length === 0 ? "No airport found." : (availableAirports.length > 0 ? "Start typing to see results." : "No airports available for this selection.")}
                </CommandEmpty>
                <ScrollArea className="h-72">
                  <CommandGroup>
                    {filteredAirports.map((airport) => (
                      <CommandItem
                        key={airport.value}
                        value={airport.label}
                        onSelect={() => handleSelect(airport.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === airport.value ? "opacity-100 text-primary" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{airport.label}</span>
                          <span className="text-xs text-muted-foreground">{airport.region}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }