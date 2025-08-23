import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const NoResultsState = ({ onModifySearch }) => (
   <div className="text-center py-20">
    <Alert className="max-w-md mx-auto glassmorphism-subtle dark:bg-slate-800/60 border-destructive/50 dark:border-destructive/60">
      <Info className="h-5 w-5 text-destructive" />
      <AlertTitle className="font-semibold text-destructive">No Flights Found</AlertTitle>
      <AlertDescription className="text-destructive/80 dark:text-destructive/90">
        We couldn't find any flights matching your criteria. Please try different dates or airports.
      </AlertDescription>
    </Alert>
    <Button onClick={onModifySearch} className="mt-8 bg-primary hover:bg-primary/90 text-white">
      Modify Search
    </Button>
  </div>
);
NoResultsState.displayName = 'NoResultsState';

export default NoResultsState;