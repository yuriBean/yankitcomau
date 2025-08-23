import { loadStripe } from '@stripe/stripe-js';

    const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY'; // Replace with your actual publishable key

    let stripePromise;
    export const getStripe = () => {
      if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === 'YOUR_STRIPE_PUBLISHABLE_KEY') {
        console.warn("Stripe Publishable Key is not set. Please provide your key.");
        // Optionally, return a mock or throw an error if Stripe is essential
        // For now, we'll proceed, but Stripe functionality will not work.
      }
      if (!stripePromise && STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY !== 'YOUR_STRIPE_PUBLISHABLE_KEY') {
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
      }
      return stripePromise;
    };