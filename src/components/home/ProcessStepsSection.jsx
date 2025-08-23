import React from 'react';
    import { motion } from 'framer-motion';
    import { UserPlus, Search, Briefcase, Send, MessageSquare, CreditCard, Plane, CheckCircle } from 'lucide-react';

    const defaultSteps = [
      {
        icon: <UserPlus />,
        title: "Sign Up / Log In",
        description: "Create your free <span class='font-vernaccia-bold'>Yankit</span> account in minutes."
      },
      {
        icon: <Send />,
        title: "Senders: Find a Yanker",
        description: "Search for travellers (Yankers) heading to your destination with available bag space."
      },
      {
        icon: <Briefcase />,
        title: "Yankers: Offer Your Bag",
        description: "List your upcoming trips and available baggage allowance to earn."
      },
      {
        icon: <MessageSquare />,
        title: "Connect & Agree",
        description: "Use secure messaging to discuss details and finalize terms."
      },
      {
        icon: <CreditCard />,
        title: "Secure Payment",
        description: "Senders pay through <span class='font-vernaccia-bold'>Yankit</span>. Funds are held until delivery confirmation."
      },
      {
        icon: <Plane />,
        title: "Traveller Check-In the Bag",
        description: "The traveller checks in the bag(s) as their own and provides evidence of the bag tag in the in-app messaging."
      },
      {
        icon: <CheckCircle />,
        title: "Confirm & Get Paid",
        description: "Sender confirms receipt, and the yanker receives their payment.",
        isConfirmation: true
      }
    ];

    const ProcessStepsSection = ({ title, subtitle, steps = defaultSteps }) => {
      const cardVariants = {
        offscreen: {
          y: 50,
          opacity: 0
        },
        onscreen: (i) => ({
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8,
            delay: i * 0.1
          }
        })
      };

      return (
        <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              {title && <h2 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white mb-3" dangerouslySetInnerHTML={{ __html: title }} />}
              {subtitle && <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: subtitle }} />}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={cardVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, amount: 0.1 }}
                  className={`bg-slate-50 dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-primary/30
                              ${index === steps.length -1 && steps.length % 2 !== 0 && steps.length > 2 ? 'lg:col-start-2 xl:col-start-auto' : ''} 
                              ${index === steps.length -1 && steps.length % 3 === 1 && steps.length > 3 ? 'xl:col-start-2' : ''}
                              ${index === steps.length -2 && steps.length % 3 === 2 && steps.length > 3 ? 'xl:col-start-1.5' : ''}
                            `}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full mr-4 bg-gradient-to-br ${step.isConfirmation ? 'from-green-400/20 to-emerald-500/20' : 'from-primary/20 to-blue-500/20'}`}>
                      {React.cloneElement(step.icon, { className: `${step.isConfirmation ? 'text-green-500' : 'text-primary'} w-6 h-6` })}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.description }}></p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      );
    };

    export default ProcessStepsSection;