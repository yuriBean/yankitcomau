import React from 'react';
    import { motion } from 'framer-motion';
    import { Loader2, KeyRound } from 'lucide-react';

    const LoadingState = () => (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-16 w-16 animate-spin text-primary dark:text-secondary mb-4" />
        <p className="text-lg text-muted-foreground dark:text-slate-300">Searching for the best flights...</p>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-sky-500/20 dark:from-blue-700/30 dark:via-cyan-700/30 dark:to-sky-700/30 border border-blue-400/50 dark:border-blue-600/50 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center shadow-lg"
        >
          <KeyRound size={16} className="mr-2 text-blue-500 dark:text-blue-400" />
          <span className="font-medium">Contacting secure flight API...</span>
        </motion.div>
      </div>
    );
    LoadingState.displayName = 'LoadingState';

    export default LoadingState;