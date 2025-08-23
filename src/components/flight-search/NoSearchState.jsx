import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const NoSearchState = ({ onGoHome }) => (
  <motion.div 
    className="container mx-auto py-12 px-4 md:px-6 min-h-[calc(100vh-180px)] flex flex-col items-center justify-center"
    initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}
  >
    <Alert className="max-w-lg glassmorphism-subtle dark:bg-slate-800/60 border-yellow-500/50 dark:border-yellow-400/60">
      <Info className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
      <AlertTitle className="font-semibold text-yellow-700 dark:text-yellow-300">No Search Performed</AlertTitle>
      <AlertDescription className="text-yellow-600 dark:text-yellow-400">
        Please go back to the homepage to search for flights.
      </AlertDescription>
    </Alert>
    <Button onClick={onGoHome} className="mt-6 bg-primary hover:bg-primary/90 text-white">
      Go to Homepage
    </Button>
  </motion.div>
);
NoSearchState.displayName = 'NoSearchState';

export default NoSearchState;