import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { DollarSign, TrendingUp, Route, Loader2, AlertCircle, Info } from 'lucide-react';

    const YankitNowEstimatedEarningsCard = ({ isLoading, estimatedDistance, estimatedEarnings, numberOfBags }) => {
      const numBags = parseInt(numberOfBags, 10) || 1;

      let title = "Estimated Earnings";
      let description = "Potential earnings for your Yankit Now offer.";
      let content;

      if (isLoading) {
        title = "Calculating Earnings...";
        description = "Please wait while we estimate your potential earnings.";
        content = (
          <div className="flex flex-col items-center justify-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Crunching numbers...</p>
          </div>
        );
      } else if (estimatedEarnings === null || estimatedDistance === null) {
         title = "Enter Details to Estimate";
         description = "Select origin, destination, and number of bags to see potential earnings.";
         content = (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Info className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-muted-foreground">Fill in the form fields above.</p>
          </div>
        );
      } else if (estimatedEarnings <= 0 && estimatedDistance === 0) {
        title = "Invalid Route or No Data";
        description = "Could not calculate earnings. This might be due to an invalid route or missing distance data.";
        content = (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-destructive">Please check your airport selections or try a different route.</p>
          </div>
        );
      } else {
        content = (
          <>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <div className="flex items-center">
                <Route className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-muted-foreground">Est. Distance:</span>
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {estimatedDistance !== null ? `${estimatedDistance.toLocaleString()} km` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-muted-foreground">Earnings per Bag:</span>
              </div>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                A{(estimatedEarnings / numBags).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                <span className="text-lg font-semibold text-muted-foreground">Total Est. Earnings:</span>
              </div>
              <span className="text-xl font-bold text-primary">
                A{estimatedEarnings !== null ? estimatedEarnings.toFixed(2) : "0.00"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              This is an estimate. Actual earnings may vary. Service fees apply.
            </p>
          </>
        );
      }

      return (
        <Card className="bg-gradient-to-br from-sky-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 shadow-md border-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-primary dark:text-sky-300">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <DollarSign className="h-5 w-5 mr-2" />}
              {title}
            </CardTitle>
            <CardDescription className="text-xs dark:text-slate-400">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      );
    };
    YankitNowEstimatedEarningsCard.displayName = "YankitNowEstimatedEarningsCard";
    export default YankitNowEstimatedEarningsCard;