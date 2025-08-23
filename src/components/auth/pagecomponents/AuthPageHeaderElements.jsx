import React from 'react';
    import { motion } from 'framer-motion';

    export const AnimatedIcon = ({ icon: Icon, iconClassName = "w-8 h-8 text-white", containerClassName = "inline-block p-3 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 shadow-lg" }) => (
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className={containerClassName}
      >
        <Icon className={iconClassName} />
      </motion.div>
    );
    AnimatedIcon.displayName = 'AnimatedIcon';