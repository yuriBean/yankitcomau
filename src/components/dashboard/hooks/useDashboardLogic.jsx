import { useState, useEffect, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { AlertTriangle } from 'lucide-react';

    const fetchSupabaseCount = async (table, userIdField, userId) => {
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq(userIdField, userId);
      if (error) {
        console.error(`Supabase query error for ${table} count:`, error.message);
        if (error.message.toLowerCase().includes('failed to fetch')) {
          throw new Error(`Network error fetching count for ${table}. Please check your connection.`);
        }
        throw error;
      }
      return count || 0;
    };

    const fetchSupabaseData = async (table, selectQuery, userIdField, userId) => {
      const { data, error } = await supabase
        .from(table)
        .select(selectQuery)
        .eq(userIdField, userId);
      if (error) {
        console.error(`Supabase query error for ${table} data:`, error.message);
        if (error.message.toLowerCase().includes('failed to fetch')) {
          throw new Error(`Network error fetching data for ${table}. Please check your connection.`);
        }
        throw error;
      }
      return data || [];
    };
    
    const useDashboardLogic = (session) => {
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const [stats, setStats] = useState({ listings: 0, shipmentsAsSender: 0, shipmentsAsTraveler: 0, rating: 0, reviews: 0 });
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleSignOut = useCallback(async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          toast({ title: 'Signed Out', description: 'You have been successfully signed out.', variant: 'default', className: 'bg-green-500 dark:bg-green-600 text-white' });
          setProfile(null);
          setStats({ listings: 0, shipmentsAsSender: 0, shipmentsAsTraveler: 0, rating: 0, reviews: 0 });
          navigate('/signin', { replace: true }); 
        } catch (error) {
           let description = "Could not sign out. Please try again.";
            if (error.message?.toLowerCase().includes('failed to fetch') || error.message?.toLowerCase().includes('network error')) {
              description = 'Network error during sign out. Please check your connection.';
            } else if (error.message) {
              description = error.message;
            }
          toast({ title: 'Error Signing Out', description, variant: 'destructive' });
        }
      }, [toast, navigate]);

      const fetchProfileAndStats = useCallback(async (user) => {
        if (!user) {
          setLoading(false);
          navigate('/signin', { replace: true });
          return;
        }
        
        setLoading(true);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { 
            if (profileError.message.toLowerCase().includes('failed to fetch')) {
              throw new Error('Network error fetching profile. Please check your connection.');
            }
            throw profileError;
          }
          
          if (profileError && profileError.code === 'PGRST116') {
            toast({
              title: 'Profile Not Found',
              description: 'It seems your profile is not fully set up. Please complete your profile information.',
              variant: 'default',
              className: 'bg-yellow-500 text-white'
            });
            setProfile({ 
              id: user.id, email: user.email, full_name: user.email,
              first_name: '', surname: '', address_line1: '', address_line2: '',
              city: '', state_province_region: '', postal_code: '', country: 'Australia', avatar_url: null
            });
          } else {
            setProfile(profileData);
          }
          
          const [listingsCount, shipmentsSentCount, shipmentsCarriedCount, reviewsData] = await Promise.all([
            fetchSupabaseCount('listings', 'user_id', user.id),
            fetchSupabaseCount('shipments', 'shipper_user_id', user.id),
            fetchSupabaseCount('shipments', 'traveler_user_id', user.id),
            fetchSupabaseData('reviews', 'rating, id', 'reviewed_user_id', user.id)
          ]);

          const totalRating = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          const avgRating = reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0;

          setStats({
            listings: listingsCount,
            shipmentsAsSender: shipmentsSentCount,
            shipmentsAsTraveler: shipmentsCarriedCount,
            rating: parseFloat(avgRating),
            reviews: reviewsData.length,
          });

        } catch (error) {
          let description = error.message || "An unexpected error occurred.";
          if (error.message?.toLowerCase().includes('failed to fetch') || error.message?.toLowerCase().includes('network error')) {
            description = 'A network error occurred while loading dashboard data. Please check your internet connection and try again.';
          }
          toast({ 
            title: 'Error Loading Dashboard Data', 
            description, 
            variant: 'destructive',
            icon: <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
          });
        } finally {
          setLoading(false);
        }
      }, [toast, navigate]);

      useEffect(() => {
        if (session?.user) {
          fetchProfileAndStats(session.user);
        } else if (session === null) { 
          setLoading(false);
          navigate('/signin', { replace: true });
        }
      }, [session, fetchProfileAndStats, navigate]);
      
      const handleProfileUpdate = useCallback(() => {
        if (session?.user) fetchProfileAndStats(session.user);
      }, [session, fetchProfileAndStats]);

      return { profile, loading, stats, handleSignOut, handleProfileUpdate };
    };
    
    export default useDashboardLogic;