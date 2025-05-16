
import React from 'react';
import { format } from 'date-fns';
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
  Building
} from 'lucide-react';

interface ActivityItemProps {
  activity: CrmActivity;
  isNew?: boolean;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  isNew = false 
}) => {
  // Format timestamp to a friendly string
  const formattedTime = React.useMemo(() => {
    try {
      return format(new Date(activity.timestamp), 'HH:mm, d MMM', { locale: sv });
    } catch (e) {
      return 'Invalid date';
    }
  }, [activity.timestamp]);
  
  // Determine icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={18} className="text-crm-blue" />;
      case 'message': return <MessageSquare size={18} className="text-crm-lightBlue" />;
      case 'call': return <Phone size={18} className="text-crm-navy" />;
      case 'task': return <CheckSquare size={18} className="text-crm-orange" />;
      default: return <MessageSquare size={18} className="text-crm-darkGray" />;
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === 'Okänd användare') return 'UK';
    
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
      case 'call': return 'bg-gradient-to-br from-white to-purple-50';
      case 'task': return 'bg-gradient-to-br from-white to-orange-50';
      default: return 'bg-gradient-to-br from-white to-gray-50';
    }
  };

  // Determine border color based on activity type
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'note': return 'border-crm-blue';
      case 'message': return 'border-crm-lightBlue';
      case 'call': return 'border-crm-navy';
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

  return (
    <div
      className={`mb-4 transition-all ${
        isNew ? 'animate-fade-in' : ''
      }`}
    >
      <Card 
        className={`border-l-4 hover:shadow-md transition-shadow ${getBorderColor(activity.type)} ${getBgColor(activity.type)}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border shadow-sm">
              {activity.user.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : null}
              <AvatarFallback className="bg-crm-blue/10 text-crm-blue font-medium">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-crm-navy">
                    {activity.user.name || 'Okänd användare'}
                  </span>
                  <span className="text-xs bg-white/80 shadow-sm px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-100">
                    {getActivityIcon(activity.type)}
                    <span className="capitalize font-medium text-crm-darkGray">{activity.type}</span>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
