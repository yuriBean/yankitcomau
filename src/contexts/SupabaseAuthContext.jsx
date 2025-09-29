
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [session, setSession] = useState(null); 
      const [userLoading, setUserLoading] = useState(true); 
      const [authError, setAuthError] = useState(null);
      const { toast } = useToast();
      const navigate = useNavigate();

      const createProfileIfNeeded = useCallback(async (currentUser) => {
        if (!currentUser) return;

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentUser.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') { // PGRST116: Row does not exist
            const userMetaData = currentUser.user_metadata;
            const newProfile = {
              id: currentUser.id,
              email: currentUser.email,
              full_name: userMetaData?.full_name || `${userMetaData?.first_name || ''} ${userMetaData?.surname || ''}`.trim() || 'New User',
              first_name: userMetaData?.first_name || '',
              surname: userMetaData?.surname || '',
              avatar_url: userMetaData?.avatar_url || null,
            };
            const { error: insertError } = await supabase.from('profiles').insert(newProfile);
            if (insertError) {
              console.error("Profile creation error:", insertError);
              toast({ title: 'Profile Creation Failed', description: `Could not save profile: ${insertError.message}`, variant: 'destructive' });
            }
          } else if (profileError) {
             console.error("Profile fetch error:", profileError);
            toast({ title: 'Error loading profile', description: profileError.message, variant: 'destructive' });
          }
        } catch (error) {
           console.error("Profile operation failed:", error);
          toast({ title: 'Profile Operation Failed', description: error.message, variant: 'destructive' });
        }
      }, [toast]);

      const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign out Failed",
            description: error.message || "Something went wrong",
          });
        }
        setSession(null);
        navigate('/signin', { replace: true });
        return { error };
      }, [toast, navigate]);


      useEffect(() => {
        const getActiveSession = async () => {
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            setAuthError(sessionError);
            toast({ title: "Session Error", description: `Failed to fetch session: ${sessionError.message}`, variant: "destructive" });
          } else {
            setSession(currentSession);
            if (currentSession?.user) {as
              if (currentSession.user.email_confirmed_at) {
                   await createProfileIfNeeded(currentSession.user);
                  }            }
          }
          setUserLoading(false);
        };
        
        getActiveSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            setSession(newSession);
            setAuthError(null);
            
            if (_event === 'SIGNED_IN' && newSession?.user) {
              const confirmed = !!newSession.user.email_confirmed_at;
              if (confirmed) {
              await createProfileIfNeeded(newSession.user);
              }
            }

            if (_event === 'SIGNED_OUT') {
              navigate('/signin', { replace: true });
            }
            
            setUserLoading(false);
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      }, [toast, createProfileIfNeeded, navigate]);


      return (
        <AuthContext.Provider value={{ session, loading: userLoading, authError, signOut }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
  