import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { User, MapPin, CalendarDays, MessageCircle, Package, DollarSign, Info, AlertTriangle } from 'lucide-react';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

    const getInitials = (name) => {
        if (!name) return "?";
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    };

    const ShipmentCard = ({ shipment, type, onOpenChat }) => {
      if (!shipment) {
        return (
            <Card className="shadow-lg glassmorphism dark:bg-slate-800/50 dark:border-slate-700/50 p-4">
                <div className="flex items-center justify-center text-muted-foreground dark:text-slate-400">
                    <AlertTriangle size={18} className="mr-2" />
                    Shipment data is unavailable.
                </div>
            </Card>
        );
      }

      const isSending = type === 'sent';
      
      const otherPartyProfile = isSending ? shipment.traveler_profile : shipment.sender_profile;
      const otherPartyRole = isSending ? 'Traveler' : 'Sender';
      
      let otherPartyName = 'User';
      if (otherPartyProfile && otherPartyProfile.full_name) {
        otherPartyName = otherPartyProfile.full_name;
      } else {
        const otherPartyUserId = isSending ? shipment.traveler_user_id : shipment.sender_user_id;
        otherPartyName = otherPartyUserId ? `User ${otherPartyUserId.slice(0,5)}...` : 'User';
      }
      const otherPartyAvatarUrl = otherPartyProfile?.avatar_url;

      const origin = shipment.listing?.origin || "Not specified";
      const destination = shipment.listing?.destination || "Not specified";
      const currencySymbol = shipment.currency === 'USD' ? '$' : shipment.currency === 'EUR' ? '€' : shipment.currency === 'GBP' ? '£' : shipment.currency ? shipment.currency + ' ' : '$';


      const statusDisplay = shipment.status ? shipment.status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';
      let statusColorClasses = 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200';
      switch (shipment.status) {
        case 'active':
        case 'In Transit':
        case 'delivery_pending':
          statusColorClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
          break;
        case 'completed':
        case 'Delivered':
          statusColorClasses = 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
          break;
        case 'payment_pending':
        case 'Awaiting Pickup':
          statusColorClasses = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100';
          break;
        case 'pending_agreement':
        case 'sender_agreed':
        case 'traveler_agreed':
          statusColorClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100';
          break;
        default:
          break;
      }


      return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 glassmorphism dark:bg-slate-800/50 dark:border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Package size={20} className="mr-3 text-primary dark:text-secondary flex-shrink-0" />
                <CardTitle className="text-lg font-semibold text-foreground dark:text-slate-100">{shipment.item_description || "Item Shipment"}</CardTitle>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${statusColorClasses}`}>
                {statusDisplay}
              </span>
            </div>
            <CardDescription className="text-sm text-muted-foreground dark:text-slate-400 pt-1">Contract ID: {shipment.id?.slice(0,8) || 'N/A'}...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center">
              <MapPin size={14} className="mr-2 text-muted-foreground dark:text-slate-500 flex-shrink-0" /> 
              <span className="font-medium text-foreground dark:text-slate-200">Route: {origin} &rarr; {destination}</span>
            </div>
            <div className="flex items-center">
              <DollarSign size={14} className="mr-2 text-muted-foreground dark:text-slate-500 flex-shrink-0" /> 
              <span className="text-foreground dark:text-slate-200">Agreed Price: {currencySymbol}{shipment.agreed_price || '0.00'}</span>
            </div>
            <div className="flex items-center">
              <User size={14} className="mr-2 text-muted-foreground dark:text-slate-500 flex-shrink-0" /> 
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-1.5">
                  <AvatarImage src={otherPartyAvatarUrl || undefined} alt={otherPartyName} />
                  <AvatarFallback className="text-xs">{getInitials(otherPartyName)}</AvatarFallback>
                </Avatar>
                <span className="text-foreground dark:text-slate-200">
                  {otherPartyRole}: {otherPartyName}
                </span>
              </div>
            </div>
            <div className="flex items-center">
                <CalendarDays size={14} className="mr-2 text-muted-foreground dark:text-slate-500 flex-shrink-0" />
                <span className="text-foreground dark:text-slate-200">
                    Created: {shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : 'N/A'}
                </span>
            </div>
            {shipment.listing?.departure_date && (
                <div className="flex items-center">
                    <CalendarDays size={14} className="mr-2 text-muted-foreground dark:text-slate-500 flex-shrink-0" />
                    <span className="text-foreground dark:text-slate-200">
                        Est. Departure: {new Date(shipment.listing.departure_date).toLocaleDateString()}
                    </span>
                </div>
            )}
            {shipment.status === 'active' && isSending && (
                <div className="flex items-center p-2 bg-yellow-100/50 dark:bg-yellow-800/30 rounded-md border border-yellow-300 dark:border-yellow-700">
                    <Info size={14} className="mr-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-700 dark:text-yellow-300 text-xs">Action: Please proceed to payment to complete this booking.</span>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-400/50 text-slate-600 dark:text-slate-300 hover:bg-slate-500/10 dark:hover:bg-slate-700/50"
              onClick={() => {
                if (shipment.conversation_id && (isSending ? shipment.traveler_user_id : shipment.sender_user_id)) {
                    onOpenChat(shipment.conversation_id, isSending ? shipment.traveler_user_id : shipment.sender_user_id, shipment.listing_id, otherPartyName, shipment.item_description);
                } else {
                    console.warn("Cannot open chat: missing conversation_id or other party user_id", shipment);
                }
              }}
              disabled={!shipment.conversation_id || !(isSending ? shipment.traveler_user_id : shipment.sender_user_id)}
            >
              <MessageCircle size={14} className="mr-2"/> Chat
            </Button>
          </CardFooter>
        </Card>
      );
    };
    export default ShipmentCard;