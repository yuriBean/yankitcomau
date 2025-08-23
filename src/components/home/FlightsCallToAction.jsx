import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlaneTakeoff } from 'lucide-react';
const FlightsCallToAction = () => {
  return <section className="relative py-16 md:py-24 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-800 dark:to-purple-900 text-white overflow-hidden shadow-xl rounded-lg mx-4 md:mx-auto max-w-6xl">
          <div className="absolute inset-0 opacity-20">
            <img alt="Abstract flight path lines" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1698951068552-fd55946bf6af" />
          </div>
          <div className="relative container mx-auto px-4 text-center z-10">
            <motion.div initial={{
        opacity: 0,
        y: 50
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        amount: 0.3
      }} transition={{
        duration: 0.8,
        ease: "easeOut"
      }}>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                <PlaneTakeoff className="inline-block w-8 h-8 md:w-12 md:h-12 mr-3 text-white" />
                Looking for Flights?
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">Find the perfect flight for your next adventure or to connect with your baggage. Seamlessly search and book with Yankit for a seamless travel experience.</p>
              <Button asChild className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-slate-100 dark:text-blue-800 dark:hover:bg-slate-200 text-lg px-8 py-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105">
                <Link to="/flights">
                  Explore Flights
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>;
};
export default FlightsCallToAction;