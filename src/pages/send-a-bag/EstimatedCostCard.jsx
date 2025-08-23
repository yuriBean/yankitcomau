
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Route, Package, Calculator, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const InfoRow = ({ icon, label, value, unit, isBold = false }) => (
    <div className="flex justify-between items-center text-sm">
        <div className="flex items-center text-muted-foreground dark:text-slate-400">
            {React.cloneElement(icon, { className: "h-4 w-4 mr-2" })}
            <span>{label}</span>
        </div>
        <span className={`${isBold ? 'font-bold' : ''} text-foreground dark:text-slate-200`}>
            {value} {unit}
        </span>
    </div>
);

const EstimatedCostCard = React.memo(({ origin, destination, numberOfBags, estimatedCost }) => {
    const numBags = parseInt(numberOfBags, 10) || 0;
    const isVisible = origin && destination && numBags > 0;

    const totalCost = estimatedCost !== null ? estimatedCost * numBags : null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isVisible ? 1 : 0, height: isVisible ? 'auto' : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
        >
            <Card className="mt-6 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-800 dark:to-slate-900/70 border-blue-200 dark:border-slate-700 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg text-blue-900 dark:text-blue-300">
                        <Calculator className="mr-2 h-5 w-5" />
                        Estimated Cost Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2 pb-4 px-6">
                    {estimatedCost !== null && estimatedCost > 0 ? (
                        <>
                            <InfoRow icon={<DollarSign />} label="Cost per Bag" value={`$${estimatedCost.toFixed(2)}`} />
                            <InfoRow icon={<Package />} label="Number of Bags" value={numBags} />
                            <Separator className="my-3 bg-blue-200 dark:bg-slate-700" />
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold text-blue-900 dark:text-blue-200">Total Estimated Cost</span>
                                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    ${totalCost.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground text-center pt-2 dark:text-slate-400">This is an estimate. The final price may be subject to agreement with the yanker.</p>
                        </>
                    ) : (
                        <div className="flex items-center justify-center p-4 text-muted-foreground dark:text-slate-400">
                           <AlertCircle className="h-5 w-5 mr-3 text-amber-500" />
                            <span>Cost estimation will appear here once a valid route is selected.</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
});

EstimatedCostCard.displayName = 'EstimatedCostCard';
export default EstimatedCostCard;
