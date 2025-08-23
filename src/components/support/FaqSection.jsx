import React from 'react';
    import { motion } from 'framer-motion';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import { HelpCircle, ChevronRight } from 'lucide-react';

    const faqs = [
      {
        question: "What is <span class='font-vernaccia-bold'>Yankit</span>?",
        answer: "<span class='font-vernaccia-bold'>Yankit</span> is a peer-to-peer platform connecting individuals who need to send items (Senders) with travellers who have spare baggage allowance (Yankers). It aims to make sending items more affordable and potentially faster by utilizing unused luggage space."
      },
      {
        question: "How do I offer my baggage space as a Yanker (Traveller)?",
        answer: "If you're a Yanker, go to the 'Yank a Bag' page. Fill in your trip details (origin, destination, travel date), the number of bags you can carry (up to 2 bags), and the maximum weight per bag (up to 20kg each). You'll also set your price. Your offer will then be visible to Senders."
      },
      {
        question: "How do I find a Yanker (Traveller) to send my bag?",
        answer: "If you're a Sender, go to the 'Send a Bag' page. Search for Yankers based on origin, destination, travel date, and the number of bags you need to send (1 or 2). Browse available yanking offers and connect with Yankers through our in-app conversation system to discuss details."
      },
      {
        question: "How do Senders and Yankers communicate and agree on terms?",
        answer: "All communication, negotiation, and agreement on terms (like exact items, pickup/drop-off details, and final price if different from listing) should happen through <span class='font-vernaccia-bold'>Yankit</span>'s secure in-app conversation feature. This keeps a record and helps if issues arise."
      },
      {
        question: "What are the baggage limits on <span class='font-vernaccia-bold'>Yankit</span>?",
        answer: "A Yanker can offer space for a maximum of 2 bags. Each bag must not exceed 20kg. Senders should ensure their items fit within these limits per bag slot they intend to use."
      },
      {
        question: "Is <span class='font-vernaccia-bold'>Yankit</span> secure?",
        answer: "We prioritize user safety. We encourage user verification, provide secure in-app messaging, and have a review system. Payments are processed securely. However, users are solely responsible for the items they send and carry, and must comply with all airline and customs regulations. <span class='font-vernaccia-bold'>Yankit</span> is a platform to connect users and is not responsible for the contents of baggage."
      },
      {
        question: "How are payments handled?",
        answer: "Senders pay the agreed amount through <span class='font-vernaccia-bold'>Yankit</span> when a contract is finalized. The funds are held securely and released to the Yanker after the Sender confirms receipt of the item(s)."
      },
      {
        question: "What fees does <span class='font-vernaccia-bold'>Yankit</span> charge?",
        answer: "<span class='font-vernaccia-bold'>Yankit</span> charges a small service fee to both the Sender and the Yanker upon successful completion of a transaction. This fee helps us maintain and improve the platform. The exact fee structure is clearly communicated during the contract and payment process."
      },
      {
        question: "What can I send using <span class='font-vernaccia-bold'>Yankit</span>?",
        answer: "Users are responsible for ensuring that any items sent or carried comply with all applicable laws, airline regulations, and customs rules of both the origin and destination countries. Prohibited items, illegal goods, hazardous materials, and items restricted by airlines cannot be transported via <span class='font-vernaccia-bold'>Yankit</span>. Always discuss the nature of the items with the other party via the in-app conversation."
      },
      {
        question: "What if there's a problem with my transaction?",
        answer: "We encourage users to communicate clearly and document their agreements within the in-app conversation. In case of disputes, <span class='font-vernaccia-bold'>Yankit</span> provides a dispute resolution mechanism. Please contact our support team with all relevant details and conversation history if you encounter an issue."
      },
    ];

    const FaqSection = () => {
      return (
        <section id="faq" className="py-12 md:py-16 bg-slate-50 dark:bg-slate-800/70 rounded-xl shadow-inner">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="inline-block p-4 bg-gradient-to-r from-primary to-accent rounded-full shadow-lg mb-4"
              >
                <HelpCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground dark:text-white">
                Your Questions Answered
              </h2>
              <p className="text-lg text-muted-foreground dark:text-slate-300 mt-3 max-w-2xl mx-auto">
                Find quick answers to common questions about using <span className="font-vernaccia-bold">Yankit</span> and its features.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900/80 rounded-lg shadow-xl p-2 md:p-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                >
                  <AccordionTrigger 
                    className="text-left text-base md:text-lg font-semibold hover:no-underline py-5 px-4 md:px-6 text-foreground dark:text-slate-100 hover:bg-primary/5 dark:hover:bg-blue-600/10 rounded-md transition-colors group"
                  >
                    <span dangerouslySetInnerHTML={{ __html: faq.question }} />
                  </AccordionTrigger>
                  <AccordionContent 
                    className="text-sm md:text-base text-muted-foreground dark:text-slate-300 pb-5 px-4 md:px-6 leading-relaxed"
                  >
                    <div className="flex">
                      <ChevronRight className="w-5 h-5 mr-2 mt-1 text-primary flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      );
    };

    export default FaqSection;