import React from 'react';
import { format, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CrmActivity } from '@/services/crmApi';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  FileText, 
  Phone, 
  CheckSquare, 
  User,
  Building,
  Package,
  Tag
} from 'lucide-react';

interface ActivityItemProps {
  activity: CrmActivity;
  isNew?: boolean;
}

// Define an extended interface for order items to match the actual data structure
interface OrderItem {
  id?: string;
  name?: string;
  productName?: string;
  articleId?: string;
  quantity?: number;
  price?: string;
  orderRowId?: string;
  totalIncludingVat?: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  isNew = false 
}) => {
  // Format timestamp to a friendly string
  const formattedTime = React.useMemo(() => {
    try {
      // Parse the ISO string
      const date = parseISO(activity.timestamp);
      
      // Format the date using Swedish locale
      // We're using direct format without timezone adjustment since we want to display local time
      return format(date, 'HH:mm, d MMM', { locale: sv });
    } catch (e) {
      console.error("Date parsing error:", e);
      return 'Invalid date';
    }
  }, [activity.timestamp]);
  
  // Determine icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={18} className="text-crm-blue" />;
      case 'message': return <MessageSquare size={18} className="text-crm-lightBlue" />;
      case 'call': return <Package size={18} className="text-green-600" />; // Package icon for orders
      case 'task': return <CheckSquare size={18} className="text-crm-orange" />;
      default: return <MessageSquare size={18} className="text-crm-darkGray" />;
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'UK';
    
    // If it's a user ID, just return the first two characters
    if (name.includes('@')) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine background color based on activity type
  const getBgColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-gradient-to-br from-white to-blue-50';
      case 'message': return 'bg-gradient-to-br from-white to-green-50';
      case 'call': return 'bg-gradient-to-br from-white to-green-50'; // Green for orders
      case 'task': return 'bg-gradient-to-br from-white to-orange-50';
      default: return 'bg-gradient-to-br from-white to-gray-50';
    }
  };

  // Determine border color based on activity type
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'note': return 'border-crm-blue';
      case 'message': return 'border-crm-lightBlue';
      case 'call': return 'border-green-500'; // Green for orders
      case 'task': return 'border-crm-orange';
      default: return 'border-crm-darkGray';
    }
  };

  // Get related entity icon
  const getRelatedIcon = (type?: string) => {
    if (!type) return <Building size={12} className="text-crm-blue" />;
    
    switch (type.toLowerCase()) {
      case 'customer':
      case 'company': 
        return <Building size={12} className="text-crm-blue" />;
      default:
        return <User size={12} className="text-crm-blue" />;
    }
  };

  // Format order details for display - completely rewritten to avoid TypeScript errors
  const renderOrderDetails = () => {
    if (activity.type !== 'call' || !activity.orderDetails) return null;
    
    // Get total value directly from orderDetails if available
    const totalValue = activity.orderDetails.totalValue || "0";
    
    // Try to get items if they exist
    const hasItems = activity.orderDetails.items && Array.isArray(activity.orderDetails.items) && activity.orderDetails.items.length > 0;
    
    // Use a default product name since productName doesn't exist in the type
    const defaultProductName = "Värderingsrapport tryckt/digital";
    
    return (
      <div className="mt-3">
        {totalValue && parseFloat(totalValue) > 0 && (
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1 text-sm text-green-700">
              <Tag size={16} />
              <span>Produkter</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {totalValue} SEK
            </div>
          </div>
        )}
        
        {/* Show either items array or a single product */}
        {hasItems ? (
          <div className="space-y-2">
            {activity.orderDetails.items.map((item: any, index: number) => (
              <div key={index} className="bg-green-50 p-3 rounded-md border border-green-200 flex justify-between items-center">
                <span className="font-medium">
                  {item.productName || item.name || (item.articleId ? `Produkt #${item.articleId}` : "Okänd produkt")}
                </span>
                {item.quantity && item.price && (
                  <span className="text-green-700 font-medium">
                    {item.quantity} × {item.price} SEK
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : totalValue && parseFloat(totalValue) > 0 ? (
          <div className="bg-green-50 p-3 rounded-md border border-green-200 flex justify-between items-center">
            <span className="font-medium">{defaultProductName}</span>
            <span className="text-green-700 font-medium">1 × {totalValue} SEK</span>
          </div>
        ) : (
          <div className="text-gray-500 italic">Inga produktdetaljer tillgängliga</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`mb-4 transition-all ${
        isNew ? 'animate-fade-in' : ''
      }`}
    >
      <Card 
        className={`border-l-4 activity-card glass-card ${getBorderColor(activity.type)} ${getBgColor(activity.type)}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border shadow-sm">
              {activity.user.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : null}
              <AvatarFallback className="bg-gradient-blue text-white font-medium">
                {getInitials(activity.user.name || activity.user.id)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-crm-navy">
                    {activity.user.name || activity.user.id.replace(/@001$/, '')}
                  </span>
                  <span className="text-xs bg-white/80 shadow-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-100">
                    {getActivityIcon(activity.type)}
                    <span className="capitalize font-medium text-crm-darkGray">
                      {activity.type === 'call' ? 'Order' : activity.type}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-crm-darkGray font-medium">{formattedTime}</div>
              </div>
              
              {activity.relatedTo && (
                <div className="mb-2 text-xs flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full shadow-sm border border-gray-100 w-fit">
                  {getRelatedIcon(activity.relatedTo.type)}
                  <span className="font-medium text-crm-blue">
                    {activity.relatedTo.name}
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {activity.content}
              </div>
              
              {renderOrderDetails()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
