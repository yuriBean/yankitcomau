import React from 'react';
    import { Button } from '@/components/ui/button';

    const TripTypeSelector = ({ tripType, onTripTypeChange, isLoading }) => {
      const tripTypes = [
        { value: 'round-trip', label: 'Round Trip' },
        { value: 'one-way', label: 'One Way' },
        { value: 'multi-city', label: 'Multi-City' },
      ];

      return (
        <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
          {tripTypes.map(type => (
            <Button
              key={type.value}
              type="button"
              variant={tripType === type.value ? 'secondary' : 'ghost'}
              onClick={() => onTripTypeChange(type.value)}
              className="rounded-full text-xs md:text-sm px-3 py-1 h-auto md:px-4 md:py-2 capitalize"
              disabled={isLoading}
            >
              {type.label}
            </Button>
          ))}
        </div>
      );
    };

    export default TripTypeSelector;