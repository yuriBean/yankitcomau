import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import FlightSearchForm from '@/components/flight-search/FlightSearchForm';
import FlightSearchHeader from '@/components/flight-search/page-specific/FlightSearchHeader';
import WhyBookWithYankit from '@/components/flight-search/page-specific/WhyBookWithYankit';

const FlightsPage = () => {
  return (
    <>
      <Helmet>
        <title>Book Flights with Yankit - Seamless Travel Starts Here</title>
        <meta name="description" content="Find, compare, and book cheap flights with Yankit. Your one-stop solution for domestic and international travel, fully integrated with our baggage shipping service." />
      </Helmet>
      <div className="relative min-h-[60vh] md:min-h-[55vh] lg:min-h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Airplane wing flying above the clouds during a beautiful sunset"
            className="w-full h-full object-cover"
           src="https://images.unsplash.com/photo-1698505670557-4bb00e7d11ba" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-transparent"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 pt-24 pb-12 md:pt-32 md:pb-16 text-center text-white">
          <FlightSearchHeader />
        </div>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-20 -mt-16 md:-mt-24 lg:-mt-32"
      >
        <div className="container mx-auto px-4">
          <FlightSearchForm />
        </div>
      </motion.main>

      <WhyBookWithYankit />
    </>
  );
};

export default FlightsPage;