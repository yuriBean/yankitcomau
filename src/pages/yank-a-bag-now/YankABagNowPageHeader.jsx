import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
const YankABagNowPageHeader = () => {
  return <motion.div className="text-center mb-12" initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5,
    delay: 0.1
  }}>
          <div className="inline-block p-4 bg-primary rounded-full mb-4 shadow-lg">
            <Briefcase className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3">
            YankIt Now
          </h1>
          <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">Offer your available baggage allowance to others who need to send items. It's simple, secure, and a great way to earn on your travels.</p>
        </motion.div>;
};
YankABagNowPageHeader.displayName = "YankABagNowPageHeader";
export default YankABagNowPageHeader;