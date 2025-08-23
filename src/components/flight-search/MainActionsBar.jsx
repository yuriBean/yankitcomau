import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Plane, PackagePlus, Send } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ActionButton = ({ icon: Icon, label, onClick, delay, className }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Button
          onClick={onClick}
          size="lg"
          className={`w-full md:w-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${className}`}
        >
          <Icon className="mr-2 h-5 w-5" />
          {label}
        </Button>
      </motion.div>
    );

    const MainActionsBar = () => {
      const navigate = useNavigate();

      return (
        <div className="py-6 md:py-8 bg-gradient-to-r from-slate-50 via-gray-100 to-slate-200 dark:from-slate-800 dark:via-gray-800 dark:to-slate-900 shadow-md rounded-lg mb-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center justify-center">
              <ActionButton
                icon={Plane}
                label="Book New Flight"
                onClick={() => navigate('/')}
                delay={0.1}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              />
              <ActionButton
                icon={PackagePlus}
                label="List Package Space" 
                onClick={() => navigate('/list-package')} 
                delay={0.2}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              />
              <ActionButton
                icon={Send}
                label="Send a Package"
                onClick={() => navigate('/send-package')} 
                delay={0.3}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              />
            </div>
          </div>
        </div>
      );
    };

    export default MainActionsBar;