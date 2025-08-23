import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const useShipments = () => {
      const [sentShipments, setSentShipments] = useState([]);
      const [carryingShipments, setCarryingShipments] = useState([]);
      const [isLoadingSent, setIsLoadingSent] = useState(true);
      const [isLoadingCarrying, setIsLoadingCarrying] = useState(true);
      const { toast } = useToast();
      const [currentUserId, setCurrentUserId] = useState(undefined); 

      useEffect(() => {
        let isMounted = true;
        const fetchUser = async () => {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
              throw userError;
            }
            if (isMounted) {
              setCurrentUserId(user?.id || null);
            }
          } catch (error) {
            console.error("Error fetching user in useShipments:", error);
            if (isMounted) {
              toast({ title: "Session Error", description: `Could not retrieve user session: ${error.message}`, variant: "destructive" });
              setCurrentUserId(null);
            }
          }
        };
        fetchUser();
        return () => {
          isMounted = false;
        };
      }, [toast]); 

      const fetchProfilesForShipments = async (shipments, profileIdFieldForShipment, profileDestFieldOnShipment) => {
        if (!shipments || shipments.length === 0) return shipments;

        const profileIdsToFetch = [...new Set(shipments.map(s => s[profileIdFieldForShipment]).filter(Boolean))];
        
        if (profileIdsToFetch.length === 0) {
          return shipments.map(s => ({ ...s, [profileDestFieldOnShipment]: null }));
        }
        
        try {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', profileIdsToFetch);

            if (profilesError) {
              throw profilesError;
            }
            
            const profilesMap = new Map(profilesData.map(p => [p.id, p]));
            return shipments.map(s => ({
              ...s,
              [profileDestFieldOnShipment]: profilesMap.get(s[profileIdFieldForShipment]) || null
            }));

        } catch (error) {
            console.error(`Error fetching profiles for ${profileDestFieldOnShipment}:`, error);
            toast({ title: `Error Fetching ${profileDestFieldOnShipment} Profiles`, description: error.message, variant: "destructive" });
            return shipments.map(s => ({ ...s, [profileDestFieldOnShipment]: null }));
        }
      };

      const fetchShipmentsData = useCallback(async (userId) => {
        if (!userId) { 
          setSentShipments([]);
          setCarryingShipments([]);
          setIsLoadingSent(false);
          setIsLoadingCarrying(false);
          return;
        }

        setIsLoadingSent(true);
        setIsLoadingCarrying(true);

        const baseShipmentSelectQuery = `
          id,
          listing_id,
          shipper_user_id,
          traveler_user_id,
          agreed_weight_kg,
          agreed_price,
          status,
          payment_intent_id,
          created_at,
          updated_at,
          currency,
          item_description,
          conversation_id,
          listing:listings (id, origin, destination, departure_date)
        `;

        try {
          let { data: sentData, error: sentError } = await supabase
            .from('shipments')
            .select(baseShipmentSelectQuery)
            .eq('shipper_user_id', userId)
            .order('created_at', { ascending: false });

          if (sentError) throw new Error(sentError.message || "Failed to fetch sent shipments");
          
          sentData = await fetchProfilesForShipments(sentData || [], 'traveler_user_id', 'traveler_profile');
          setSentShipments(sentData || []);

        } catch (error) {
          console.error("Error processing sent shipments:", error);
          toast({ title: "Error Processing Sent Shipments", description: error.message, variant: "destructive" });
          setSentShipments([]);
        } finally {
          setIsLoadingSent(false);
        }

        try {
          let { data: carryingData, error: carryingError } = await supabase
            .from('shipments')
            .select(baseShipmentSelectQuery)
            .eq('traveler_user_id', userId)
            .order('created_at', { ascending: false });

          if (carryingError) throw new Error(carryingError.message || "Failed to fetch carrying shipments");

          carryingData = await fetchProfilesForShipments(carryingData || [], 'shipper_user_id', 'sender_profile');
          setCarryingShipments(carryingData || []);

        } catch (error) {
          console.error("Error processing carrying shipments:", error);
          toast({ title: "Error Processing Carrying Shipments", description: error.message, variant: "destructive" });
          setCarryingShipments([]);
        } finally {
          setIsLoadingCarrying(false);
        }
      }, [toast]);

      useEffect(() => {
        if (typeof currentUserId === 'undefined') {
          // Still waiting for user to be fetched
          setIsLoadingSent(true);
          setIsLoadingCarrying(true);
          return;
        }
        
        if (currentUserId) { // User is logged in
          fetchShipmentsData(currentUserId);
        } else { // User is null (logged out) or explicit fetch determined no user
          fetchShipmentsData(null); // This will clear shipments and set loading to false
        }
      }, [currentUserId, fetchShipmentsData]);

      return {
        sentShipments,
        carryingShipments,
        isLoadingSent,
        isLoadingCarrying,
        currentUserId,
        fetchShipments: () => {
          if (typeof currentUserId !== 'undefined') {
            fetchShipmentsData(currentUserId);
          }
        },
      };
    };

    export default useShipments;