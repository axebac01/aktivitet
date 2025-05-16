
import React, { useEffect, useState, useRef } from 'react';
import { crmApi, CrmActivity } from '@/services/crmApi';
import { ActivityItem } from '@/components/ActivityItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner'; // Add this import for toast notifications

export const ActivityStream: React.FC = () => {
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivities, setNewActivities] = useState<CrmActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousActivitiesRef = useRef<CrmActivity[]>([]);

  // Function to load activities
  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await crmApi.fetchActivities();
      setActivities(data);
      previousActivitiesRef.current = data;
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await crmApi.fetchActivities();
      
      // Find new activities
      const prevIds = new Set(previousActivitiesRef.current.map(a => a.id));
      const newItems = data.filter(activity => !prevIds.has(activity.id));
      
      if (newItems.length > 0) {
        setNewActivities(newItems);
        setTimeout(() => {
          setActivities(data);
          setNewActivities([]);
          previousActivitiesRef.current = data;
        }, 3000); // After highlighting, merge them into the main list
      } else {
        setActivities(data);
        previousActivitiesRef.current = data;
      }
      setLastUpdated(new Date());
      toast.success(`${newItems.length ? newItems.length + " nya aktiviteter hittades" : "Inga nya aktiviteter"}`);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
      toast.error("Kunde inte uppdatera aktiviteter");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load and polling setup
  useEffect(() => {
    loadActivities();
    
    // Subscribe to activity updates
    const unsubscribe = crmApi.subscribeToActivities((updatedActivities) => {
      // Find new activities
      const prevIds = new Set(previousActivitiesRef.current.map(a => a.id));
      const newItems = updatedActivities.filter(activity => !prevIds.has(activity.id));
      
      if (newItems.length > 0) {
        setNewActivities(newItems);
        setTimeout(() => {
          setActivities(updatedActivities);
          setNewActivities([]);
          previousActivitiesRef.current = updatedActivities;
          setLastUpdated(new Date());
        }, 3000); // After highlighting, merge them into the main list
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? new Intl.DateTimeFormat('sv-SE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }).format(lastUpdated)
    : null;

  // Render loading skeletons
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg">Aktivitetsflöde</h2>
          {lastUpdated && (
            <div className="text-xs flex items-center gap-1 text-gray-500">
              <Clock size={12} />
              <span>Uppdaterad: {formattedLastUpdated}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw 
            size={16} 
            className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
          />
          Uppdatera
        </Button>
      </div>
      
      {newActivities.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-crm-blue mb-2">
            Nya aktiviteter
          </div>
          {newActivities.map(activity => (
            <ActivityItem 
              key={`new-${activity.id}`} 
              activity={activity}
              isNew={true}
            />
          ))}
          <div className="border-t border-dashed my-4"></div>
        </div>
      )}
      
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Inga aktiviteter hittades
        </div>
      ) : (
        <div>
          {activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};
