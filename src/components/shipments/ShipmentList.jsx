import React from 'react';
    import { Link } from 'react-router-dom';
    import { PackageSearch, Package } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardTitle, CardDescription } from '@/components/ui/card';
    import ShipmentCard from './ShipmentCard';

    const ShipmentList = ({ shipments, type, onOpenChat, isLoading }) => {
      if (isLoading) {
        return <div className="text-center py-10"><PackageSearch className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" /> <p className="text-muted-foreground dark:text-slate-300">Loading shipments...</p></div>;
      }
      if (shipments.length === 0) {
        return (
          <Card className="text-center p-8 shadow-lg glassmorphism border-none dark:bg-slate-800/40">
            <Package size={48} className="mx-auto mb-4 text-primary" />
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">
              {type === 'sent' ? "No Sent Shipments" : "Not Carrying Any Items"}
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-slate-300 mt-2 mb-4">
              {type === 'sent' ? "You haven't sent any items yet." : "You are not currently carrying any items for others."}
            </CardDescription>
            <Link to={type === 'sent' ? "/send-baggage" : "/list-baggage"}>
              <Button className="bg-gradient-to-r from-primary to-purple-600 text-white">
                {type === 'sent' ? "Send an Item" : "List Baggage Space"}
              </Button>
            </Link>
          </Card>
        );
      }
      return (
        <div className="space-y-4">
          {shipments.map(shipment => (
            <ShipmentCard 
              key={shipment.id} 
              shipment={shipment} 
              type={type} 
              onOpenChat={onOpenChat}
            />
          ))}
        </div>
      );
    };

    export default ShipmentList;