import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send, Search, Plane, Briefcase, CheckCircle, Users, Shield, Globe, Ship, HeartHandshake as Handshake, Landmark, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.2 } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const StepCard = ({ icon, title, description, stepNumber, className }) => {
  const IconComponent = icon;
  return (
    <motion.div 
      variants={itemVariants}
      className="relative p-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
    >
      <div className={cn("absolute -top-8 -right-8 text-7xl font-bold text-gray-200 group-hover:text-primary/20 transition-colors duration-300", className)}>
        {stepNumber}
      </div>
      <div className="relative z-10">
        <div className={cn("w-14 h-14 flex items-center justify-center rounded-xl mb-4 text-white shadow-md", className)}>
          <IconComponent size={32} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};
StepCard.displayName = 'StepCard';

const BenefitCard = ({ icon, title, description }) => {
  const IconComponent = icon;
  return (
    <motion.div 
      variants={itemVariants}
      className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-4 bg-gradient-to-br from-primary to-accent text-white rounded-full mb-4 shadow-lg">
        <IconComponent size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{description}</p>
    </motion.div>
  );
};
BenefitCard.displayName = 'BenefitCard';

const HowItWorksPage = () => {
  const senderSteps = [
    { icon: Search, title: "Search for Travelers", description: "Find travelers heading to your desired destination with available baggage space.", colorClass: "bg-primary" },
    { icon: Handshake, title: "Connect & Coordinate", description: "Chat with travelers, agree on terms, and arrange item pickup or drop-off.", colorClass: "bg-primary" },
    { icon: Ship, title: "Track Your Item", description: "Receive updates as your item makes its journey with the traveler.", colorClass: "bg-primary" },
    { icon: CheckCircle, title: "Confirm Delivery", description: "Once your item arrives safely, confirm receipt and complete the transaction.", colorClass: "bg-primary" },
  ];

  const travelerSteps = [
    { icon: Briefcase, title: "List Your Trip", description: "Post your upcoming travel plans and specify your available baggage capacity.", colorClass: "bg-primary" },
    { icon: Users, title: "Receive Requests", description: "Get notifications from senders interested in using your baggage space.", colorClass: "bg-primary" },
    { icon: Plane, title: "Coordinate & Carry", description: "Agree on terms with senders, receive items, and transport them safely.", colorClass: "bg-primary" },
    { icon: Landmark, title: "Deliver & Earn", description: "Deliver items to the recipient, confirm delivery, and get paid for your service.", colorClass: "bg-primary" },
  ];

  const benefits = [
    { icon: Globe, title: "Global Reach", description: "Send and receive items across continents with a community of trusted travelers." },
    { icon: Shield, title: "Secure & Transparent", description: "Verified users, secure messaging, and clear processes ensure peace of mind." },
    { icon: Briefcase, title: "Earn While Traveling", description: "Offset your travel costs by utilizing your unused baggage allowance." },
    { icon: Send, title: "Affordable Shipping", description: "A cost-effective alternative to traditional shipping methods for senders." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 md:mb-24"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600"
          >
            How <span className="font-vernaccia-bold">Yankit</span> Works
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto"
          >
            Discover a new way to send items and earn while you travel. Yankit connects senders with travelers, making global shipping simple, affordable, and community-driven.
          </motion.p>
        </motion.section>

        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">For <span className="text-primary">Senders</span>: Ship with Ease</h2>
          <p className="text-center text-gray-700 mb-10 md:mb-12 max-w-2xl mx-auto">Follow these simple steps to send your items across the globe.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {senderSteps.map((step, index) => (
              <StepCard key={index} icon={step.icon} title={step.title} description={step.description} stepNumber={String(index + 1).padStart(2, '0')} className={step.colorClass} />
            ))}
          </div>
          <motion.div variants={itemVariants} className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/send-a-bag">
                Send an Item Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.section>

        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">For <span className="text-primary">Travelers</span>: Earn on the Go</h2>
          <p className="text-center text-gray-700 mb-10 md:mb-12 max-w-2xl mx-auto">Turn your extra baggage space into extra cash on your next trip.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {travelerSteps.map((step, index) => (
              <StepCard key={index} icon={step.icon} title={step.title} description={step.description} stepNumber={String(index + 1).padStart(2, '0')} className={step.colorClass} />
            ))}
          </div>
          <motion.div variants={itemVariants} className="text-center mt-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link to="/yank-a-bag-now">
                List Your Trip <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.section>

        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10 md:mb-12">Why Choose <span className="font-vernaccia-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-600">Yankit</span>?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <BenefitCard key={index} icon={benefit.icon} title={benefit.title} description={benefit.description} />
            ))}
          </div>
        </motion.section>

        <motion.section 
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-200"
        >
          <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</motion.h2>
          <motion.p variants={itemVariants} className="text-gray-700 mb-8 max-w-xl mx-auto">
            Join the <span className="font-vernaccia-bold text-gray-900">Yankit</span> community today and experience the future of peer-to-peer shipping and travel earnings.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
              <Link to="/signup">
                Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto font-semibold transform hover:scale-105 transition-transform duration-300">
              <Link to="/support">
                Learn More
              </Link>
            </Button>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};
HowItWorksPage.displayName = 'HowItWorksPage';

export default HowItWorksPage;