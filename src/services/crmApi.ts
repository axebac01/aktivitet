
import { toast } from "@/components/ui/sonner";

export interface CrmActivity {
  id: string;
  type: 'note' | 'message' | 'task' | 'call';
  content: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedTo?: {
    type: string;
    id: string;
    name: string;
  };
}

// This is a mock API service - you'll need to replace this with your actual API implementation
class CrmApiService {
  private apiUrl: string = '';
  private pollingInterval: number | null = null;
  private listeners: ((activities: CrmActivity[]) => void)[] = [];

  constructor() {
    // Using localStorage to allow end-users to set their API URL
    const savedApiUrl = localStorage.getItem('crmApiUrl');
    if (savedApiUrl) {
      this.apiUrl = savedApiUrl;
    }
  }

  setApiUrl(url: string): void {
    this.apiUrl = url;
    localStorage.setItem('crmApiUrl', url);
    toast.success("API URL has been saved!");
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  async fetchActivities(): Promise<CrmActivity[]> {
    if (!this.apiUrl) {
      console.log("No API URL set");
      return this.getMockActivities(); // Return mock data when no API URL is set
    }

    try {
      console.log("Fetching activities from:", this.apiUrl);
      const response = await fetch(`${this.apiUrl}/activities`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities. Using mock data instead.");
      return this.getMockActivities(); // Fallback to mock data on error
    }
  }

  // For future implementation - sending messages to the CRM API
  async sendMessage(content: string): Promise<CrmActivity | null> {
    if (!this.apiUrl) {
      toast.error("Please set your CRM API URL first");
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/activities/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return null;
    }
  }

  // Subscribe to activity updates
  subscribeToActivities(callback: (activities: CrmActivity[]) => void): () => void {
    this.listeners.push(callback);
    
    // Start polling if this is the first subscriber
    if (this.listeners.length === 1) {
      this.startPolling();
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      
      // Stop polling if no more subscribers
      if (this.listeners.length === 0) {
        this.stopPolling();
      }
    };
  }
  
  private startPolling(): void {
    // Poll every 30 seconds
    this.pollingInterval = window.setInterval(async () => {
      try {
        const activities = await this.fetchActivities();
        this.listeners.forEach(listener => listener(activities));
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 30000);
  }
  
  private stopPolling(): void {
    if (this.pollingInterval !== null) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Mock data for development and testing
  private getMockActivities(): CrmActivity[] {
    return [
      {
        id: '1',
        type: 'note',
        content: 'Kunden har begärt en offert på 3 nya servrar',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user: {
          id: '101',
          name: 'Maria Andersson',
          avatar: 'https://i.pravatar.cc/150?img=32'
        },
        relatedTo: {
          type: 'customer',
          id: '1001',
          name: 'Acme AB'
        }
      },
      {
        id: '2',
        type: 'call',
        content: 'Ringde Johan för att bekräfta mötet nästa vecka. Han planerar att ta med sin tekniska chef.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        user: {
          id: '102',
          name: 'Erik Johansson',
          avatar: 'https://i.pravatar.cc/150?img=53'
        },
        relatedTo: {
          type: 'customer',
          id: '1002',
          name: 'Teknik Konsult AB'
        }
      },
      {
        id: '3',
        type: 'message',
        content: 'Någon som har kontaktuppgifter till Pernillas ersättare? Behöver komma i kontakt med dem idag!',
        timestamp: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
        user: {
          id: '103',
          name: 'Lina Karlsson',
          avatar: 'https://i.pravatar.cc/150?img=5'
        }
      },
      {
        id: '4',
        type: 'task',
        content: 'Skickat avtal till SignRight för signering av kunden',
        timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        user: {
          id: '104',
          name: 'Niklas Lundgren'
        },
        relatedTo: {
          type: 'opportunity',
          id: '2001',
          name: 'Service renewal Q2'
        }
      },
      {
        id: '5',
        type: 'note',
        content: 'Viktig notering: Alla kundens servrar måste uppgraderas innan årsskiftet på grund av säkerhetsskäl. Diskuteras på nästa möte.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        user: {
          id: '105',
          name: 'Sofia Berg',
          avatar: 'https://i.pravatar.cc/150?img=25'
        },
        relatedTo: {
          type: 'project',
          id: '3001',
          name: 'IT Infrastructure Upgrade'
        }
      }
    ];
  }
}

// Singleton instance
export const crmApi = new CrmApiService();
