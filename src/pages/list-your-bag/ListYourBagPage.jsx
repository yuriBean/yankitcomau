import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Loader2 } from 'lucide-react';

import ListYourBagPageHeader from '@/pages/list-your-bag/ListYourBagPageHeader';
import ListYourBagFormFields from '@/pages/list-your-bag/ListYourBagFormFields';

const ListYourBagPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        numberOfBags: '',
        desiredDate: null,
        description: '',
        termsAccepted: false,
    });
    
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, desiredDate: date }));
    };

    const handleAirportChange = (fieldName, value) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleNumberOfBagsChange = (value) => {
        const num = Math.max(1, Math.min(2, Number(value)));
        setFormData(prev => ({ ...prev, numberOfBags: num.toString() }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.origin) newErrors.origin = "Origin airport is required.";
        if (!formData.destination) newErrors.destination = "Destination airport is required.";
        if (!formData.numberOfBags) newErrors.numberOfBags = "Number of bags is required.";
        if (!formData.desiredDate) newErrors.desiredDate = "A desired send date is required.";
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions.";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
          toast({ variant: "destructive", title: "Validation Error", description: "Please fill out all required fields." });
          return;
        }

        setIsLoading(true);

        // Placeholder for Supabase logic
        setTimeout(() => {
            setIsLoading(false);
            console.log("Form Submitted:", formData);
            toast({
                title: 'Bag Listed for Yankers!',
                description: "Yankers can now see your request and make offers.",
                variant: 'default',
                className: "bg-green-500 dark:bg-green-600 text-white",
            });
            navigate('/my-shipments');
        }, 1500);
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-[calc(100vh-180px)]">
            <ListYourBagPageHeader />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-3xl mx-auto shadow-xl glassmorphism border-none dark:bg-slate-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl text-foreground dark:text-white">
                            Enter Your Bag's Details
                        </CardTitle>
                        <CardDescription className="dark:text-slate-300">
                            Provide the details for the bag you want to send. Yankers will see this listing.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleFormSubmit}>
                        <CardContent>
                            <ListYourBagFormFields
                                formData={formData}
                                errors={errors}
                                isLoading={isLoading}
                                handleInputChange={handleInputChange}
                                handleDateChange={handleDateChange}
                                handleAirportChange={handleAirportChange}
                                handleNumberOfBagsChange={handleNumberOfBagsChange}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-3" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <PackagePlus className="mr-2 h-5 w-5" />}
                                {isLoading ? "Listing Your Bag..." : "List My Bag Now"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default ListYourBagPage;