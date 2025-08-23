import React from 'react';
    import { Button } from '@/components/ui/button';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const SocialLoginButtons = () => {
      const { toast } = useToast();

      const handleSocialLogin = async (provider) => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: `${window.location.origin}/`, 
          },
        });
        if (error) {
          toast({
            title: `Error signing in with ${provider}`,
            description: error.message,
            variant: "destructive",
          });
        }
      };

      return (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full border-slate-300/70 dark:border-slate-600/70 hover:bg-accent/50 dark:hover:bg-slate-700/50 group"
            onClick={() => handleSocialLogin('google')}
          >
            <img className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" alt="Google logo" src="https://storage.googleapis.com/hostinger-horizons-assets/google-logo.png" />
            Google
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-slate-300/70 dark:border-slate-600/70 hover:bg-accent/50 dark:hover:bg-slate-700/50 group"
            onClick={() => handleSocialLogin('facebook')}
          >
             <img className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" alt="Facebook logo" src="https://storage.googleapis.com/hostinger-horizons-assets/facebook-logo.png" />
            Facebook
          </Button>
        </div>
      );
    };

    export default SocialLoginButtons;