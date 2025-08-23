import React from 'react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import ShipmentList from './ShipmentList';
    import { Package, Send } from 'lucide-react';

    const MyShipmentsTabs = ({ sentShipments, carryingShipments, onOpenChat, isLoadingSent, isLoadingCarrying, currentUserId }) => {
      return (
        <Tabs defaultValue="sent" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-2 md:max-w-md mx-auto bg-slate-200 dark:bg-slate-700/50 shadow-inner">
            <TabsTrigger value="sent" className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-blue-600">
              <Send className="w-4 h-4 mr-2" /> Items I'm Sending
            </TabsTrigger>
            <TabsTrigger value="carrying" className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-blue-600">
              <Package className="w-4 h-4 mr-2" /> Items I'm Carrying
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sent" className="mt-6">
            <ShipmentList 
              shipments={sentShipments} 
              type="sent" 
              onOpenChat={onOpenChat} 
              isLoading={isLoadingSent}
              currentUserId={currentUserId}
            />
          </TabsContent>
          <TabsContent value="carrying" className="mt-6">
            <ShipmentList 
              shipments={carryingShipments} 
              type="carrying" 
              onOpenChat={onOpenChat} 
              isLoading={isLoadingCarrying}
              currentUserId={currentUserId}
            />
          </TabsContent>
        </Tabs>
      );
    };

    export default MyShipmentsTabs;