
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
  User 
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
      case 'note': return <FileText size={18} className="text-blue-500" />;
      case 'message': return <MessageSquare size={18} className="text-green-500" />;
      case 'call': return <Phone size={18} className="text-purple-500" />;
      case 'task': return <CheckSquare size={18} className="text-amber-500" />;
      default: return <MessageSquare size={18} className="text-gray-500" />;
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      className={`mb-4 transition-all ${
        isNew ? 'animate-fade-in' : ''
      }`}
    >
      <Card className="border-l-4 hover:shadow-md transition-shadow" 
        style={{ 
          borderLeftColor: 
            activity.type === 'note' ? '#3b82f6' : 
            activity.type === 'message' ? '#10b981' : 
            activity.type === 'call' ? '#8b5cf6' : 
            activity.type === 'task' ? '#f59e0b' : '#9ca3af'
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border">
              {activity.user.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : null}
              <AvatarFallback className="bg-gray-100 text-crm-blue">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    {getActivityIcon(activity.type)}
                    <span className="capitalize">{activity.type}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500">{formattedTime}</div>
              </div>
              
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {activity.content}
              </div>
              
              {activity.relatedTo && (
                <div className="mt-2 text-xs flex items-center gap-1 text-gray-500">
                  <User size={12} />
                  <span>
                    Relaterad till:{' '}
                    <span className="font-medium">
                      {activity.relatedTo.name}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
