import React, { useEffect, useState, useRef } from 'react';
import { crmApi, CrmActivity } from '@/services/crmApi';
import { ActivityItem } from '@/components/ActivityItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, Eye, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export const ActivityStream: React.FC = () => {
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivities, setNewActivities] = useState<CrmActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousActivitiesRef = useRef<CrmActivity[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshIntervalRef = useRef<number | null>(null);

  // Function to load activities
  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await crmApi.fetchActivities();
      console.log("Initial load fetched", data.length, "activities");
      console.log("Activities with company data:", data.filter(a => a.relatedTo).length);
      
      // Log user information for debugging
      data.forEach(activity => {
        console.log(`Activity ${activity.id}: User ${activity.user.name}`);
      });
      
      setActivities(data);
      previousActivitiesRef.current = data;
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Identify new activities by comparing current and previous data
  const findNewActivities = (currentActivities: CrmActivity[], previousActivities: CrmActivity[]) => {
    // Create a Set of IDs from previous activities for faster lookup
    const prevIds = new Set(previousActivities.map(a => a.id));
    
    // Filter current activities to find ones that don't exist in previous data
    return currentActivities.filter(activity => !prevIds.has(activity.id));
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await crmApi.fetchActivities();
      
      console.log("Refresh fetched", data.length, "activities");
      console.log("Activities with company data:", data.filter(a => a.relatedTo).length);
      
      // Find new activities using the improved function
      const newItems = findNewActivities(data, previousActivitiesRef.current);
      
      console.log(`Found ${newItems.length} new activities`);
      console.log('New activities:', newItems);
      
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

  // Auto-refresh function
  const setupAutoRefresh = () => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }

    if (autoRefresh) {
      autoRefreshIntervalRef.current = window.setInterval(() => {
        handleRefresh();
      }, 30000); // 30 seconds
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Initial load and polling setup
  useEffect(() => {
    loadActivities();
    
    // Subscribe to activity updates
    const unsubscribe = crmApi.subscribeToActivities((updatedActivities) => {
      // Find new activities using the improved function
      const newItems = findNewActivities(updatedActivities, previousActivitiesRef.current);
      
      if (newItems.length > 0) {
        console.log(`Subscription found ${newItems.length} new activities`);
        setNewActivities(newItems);
        toast.success(`${newItems.length} nya aktiviteter hittades`);
        
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

  // Setup auto-refresh effect
  useEffect(() => {
    setupAutoRefresh();
    
    // Clean up on component unmount
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh]);

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
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg text-crm-navy">Aktivitetsflöde</h2>
          {lastUpdated && (
            <div className="text-xs flex items-center gap-1 text-crm-darkGray bg-gray-50 px-2 py-1 rounded-full">
              <Clock size={12} />
              <span>Uppdaterad: {formattedLastUpdated}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoRefresh}
            className={autoRefresh ? "bg-crm-orange hover:bg-crm-orange/90 gap-1" : "gap-1"}
          >
            <Eye size={16} />
            {autoRefresh ? "Auto uppdatering på" : "Auto uppdatering av"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-crm-blue text-crm-blue hover:bg-crm-blue/5"
          >
            <RefreshCw 
              size={16} 
              className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
            />
            Uppdatera
          </Button>
        </div>
      </div>
      
      {newActivities.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-crm-blue/5 to-transparent p-3 rounded-lg border border-crm-blue/20">
          <div className="text-sm font-medium text-crm-blue mb-2 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-crm-blue rounded-full animate-pulse"></span>
            Nya aktiviteter ({newActivities.length})
          </div>
          {newActivities.map(activity => (
            <ActivityItem 
              key={`new-${activity.id}`} 
              activity={activity}
              isNew={true}
            />
          ))}
          <div className="border-t border-dashed border-crm-blue/20 my-4"></div>
        </div>
      )}
      
      {activities.length === 0 ? (
        <div className="text-center py-12 text-crm-darkGray bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex flex-col items-center gap-2">
            <MessageSquare size={32} className="text-crm-blue/30" />
            <p>Inga aktiviteter hittades</p>
            <p className="text-xs">Aktiviteter kommer visas här när de skapas</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};
