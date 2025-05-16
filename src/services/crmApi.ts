
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

// Interface för API-autentisering
export interface ApiCredentials {
  username: string;
  password: string;
  schema: string;
  apiUrl: string;
}

// Interface för en anteckning från API
interface ApiNote {
  id: string;
  text: string;
  created: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  customer?: {
    id: string;
    name: string;
  };
}

// Interface för en todo från API
interface ApiTodo {
  id: string;
  title: string;
  description: string;
  triggerDate: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  customer?: {
    id: string;
    name: string;
  };
}

// Interface för en order från API
interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  created: string;
  customer: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
}

// Interface för API svar med pagination
interface ApiResponse<T> {
  data?: T[];
  items?: T[];
  pagination?: {
    next?: string;
    previous?: string;
    currentPage?: number;
    totalPages?: number;
  };
  message?: string;
  success?: boolean;
}

class CrmApiService {
  private apiUrl: string = '';
  private credentials: ApiCredentials | null = null;
  private pollingInterval: number | null = null;
  private listeners: ((activities: CrmActivity[]) => void)[] = [];
  private lastFetchTime: number = 0;

  constructor() {
    // Försöker ladda sparade credentials från localStorage
    const savedCredentials = localStorage.getItem('crmApiCredentials');
    if (savedCredentials) {
      try {
        this.credentials = JSON.parse(savedCredentials);
        this.apiUrl = this.credentials.apiUrl;
        console.log("Restored API credentials from localStorage:", this.apiUrl);
      } catch (error) {
        console.error("Failed to parse saved credentials:", error);
        localStorage.removeItem('crmApiCredentials');
      }
    }
    
    this.lastFetchTime = Date.now();
  }

  setApiCredentials(credentials: ApiCredentials): void {
    this.credentials = credentials;
    this.apiUrl = credentials.apiUrl;
    
    // Spara credentials i localStorage
    localStorage.setItem('crmApiCredentials', JSON.stringify(credentials));
    console.log("Saved API credentials to localStorage:", this.apiUrl);
    
    toast.success("API-inställningar har sparats!");
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getCredentials(): ApiCredentials | null {
    return this.credentials;
  }

  async testApiConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.credentials) {
      return { 
        success: false, 
        message: "Inga API-inloggningsuppgifter är inställda" 
      };
    }

    console.log("Testing API connection with credentials:", {
      url: this.apiUrl,
      username: this.credentials.username,
      schema: this.credentials.schema,
      // Hiding password for security
    });

    try {
      // Testar anslutningen genom att försöka hämta en anteckning med limit=1
      const response = await fetch(`${this.apiUrl}/notes?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      console.log("API test response status:", response.status);
      console.log("API test response headers:", [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        
        let errorMessage = `API svarade med status ${response.status}`;
        if (response.status === 401) {
          errorMessage = "Obehörig åtkomst. Kontrollera användarnamn och lösenord.";
        } else if (response.status === 400) {
          errorMessage = "Felaktig förfrågan. Kontrollera schema och andra parametrar.";
        } else if (response.status === 404) {
          errorMessage = "API endpoint hittades inte. Kontrollera API URL.";
        }
        
        return { 
          success: false, 
          message: errorMessage, 
          details: {
            status: response.status,
            text: errorText
          }
        };
      }
      
      const data = await response.json();
      console.log("API test data:", data);
      
      // Kontrollera svarsformatet baserat på API-dokumentationen
      if (Array.isArray(data)) {
        return { 
          success: true, 
          message: `Anslutning lyckades! Hittade ${data.length} anteckningar.`,
          details: data
        };
      } else if (data && (data.items || data.data)) {
        const items = data.items || data.data || [];
        return { 
          success: true, 
          message: `Anslutning lyckades! Hittade ${items.length} anteckningar.`,
          details: data
        };
      } else {
        return { 
          success: true,
          message: "Anslutningen fungerar men svarsformatet var oväntat.",
          details: data
        };
      }
    } catch (error) {
      console.error("API connection test failed:", error);
      return { 
        success: false, 
        message: `Anslutningsfel: ${error instanceof Error ? error.message : String(error)}`,
        details: error
      };
    }
  }

  async fetchActivities(): Promise<CrmActivity[]> {
    console.log("Fetching activities at", new Date().toISOString());
    this.lastFetchTime = Date.now();
    
    if (!this.credentials) {
      console.log("Inga API-inloggningsuppgifter är inställda");
      return this.getMockActivities(); // Returnera mockdata när ingen API-URL är inställd
    }

    try {
      console.log("Fetching from API:", this.apiUrl);
      
      // Fetch all types of activities
      const [notes, todos, orders] = await Promise.all([
        this.fetchNotes(),
        this.fetchTodos(),
        this.fetchOrders()
      ]);
      
      console.log(`Fetched ${notes.length} notes, ${todos.length} todos, ${orders.length} orders`);
      
      // Konvertera och kombinera notes, todos och orders till activities
      const noteActivities = notes.map(note => this.convertNoteToActivity(note));
      const todoActivities = todos.map(todo => this.convertTodoToActivity(todo));
      const orderActivities = orders.map(order => this.convertOrderToActivity(order));
      
      // Kombinera och sortera efter timestamp, nyast först
      const allActivities = [...noteActivities, ...todoActivities, ...orderActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log(`Total activities: ${allActivities.length}`);
      return allActivities;
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Kunde inte hämta aktiviteter. Använder testdata istället.");
      return this.getMockActivities(); // Fallback till mockdata vid fel
    }
  }

  // Hämta alla anteckningar från API
  private async fetchNotes(): Promise<ApiNote[]> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      console.log("Fetching notes from API");
      const response = await fetch(`${this.apiUrl}/notes?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Notes API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Notes API response:", data);
      
      // Hanterar olika svarsformat baserat på API-dokumentationen
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.items) {
        return data.items;
      } else if (data && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  // Hämta alla todos från API
  private async fetchTodos(): Promise<ApiTodo[]> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      console.log("Fetching todos from API");
      const response = await fetch(`${this.apiUrl}/todos?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Todos API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Hanterar olika svarsformat baserat på API-dokumentationen
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.items) {
        return data.items;
      } else if (data && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  }
  
  // Hämta alla orders från API
  private async fetchOrders(): Promise<ApiOrder[]> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      console.log("Fetching orders from API");
      const response = await fetch(`${this.apiUrl}/orders?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Orders API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Hanterar olika svarsformat baserat på API-dokumentationen
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.items) {
        return data.items;
      } else if (data && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Return empty array instead of throwing to avoid breaking all activities
      console.warn("Using empty orders array due to error");
      return [];
    }
  }

  // Omvandla ApiNote till CrmActivity
  private convertNoteToActivity(note: ApiNote): CrmActivity {
    return {
      id: note.id,
      type: 'note',
      content: note.text,
      timestamp: note.created,
      user: {
        id: note.user.id,
        name: note.user.name,
      },
      relatedTo: note.customer ? {
        type: 'customer',
        id: note.customer.id,
        name: note.customer.name
      } : undefined
    };
  }

  // Omvandla ApiTodo till CrmActivity
  private convertTodoToActivity(todo: ApiTodo): CrmActivity {
    return {
      id: todo.id,
      type: 'task',
      content: `${todo.title}: ${todo.description}`,
      timestamp: todo.triggerDate,
      user: {
        id: todo.user.id,
        name: todo.user.name,
      },
      relatedTo: todo.customer ? {
        type: 'customer',
        id: todo.customer.id,
        name: todo.customer.name
      } : undefined
    };
  }
  
  // Omvandla ApiOrder till CrmActivity
  private convertOrderToActivity(order: ApiOrder): CrmActivity {
    return {
      id: `order-${order.id}`, // Unique ID to avoid conflicts
      type: 'call', // Using 'call' type since we don't have an 'order' type
      content: `Order ${order.orderNumber} skapad med status: ${order.status}`,
      timestamp: order.created,
      user: {
        id: order.user.id,
        name: order.user.name,
      },
      relatedTo: {
        type: 'customer',
        id: order.customer.id,
        name: order.customer.name
      }
    };
  }

  // Skapa auth headers för API-anrop enligt API-dokumentationen
  private getAuthHeaders(): HeadersInit {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }

    // Skapa Base64-kodad auth-sträng för Basic Auth
    const authString = btoa(`${this.credentials.username}:${this.credentials.password}`);
    
    const headers: HeadersInit = {
      'Authorization': `Basic ${authString}`,
      'schema': this.credentials.schema,
    };
    
    console.log("Using API headers:", {
      Authorization: "Basic ********", // Don't log full auth string
      schema: this.credentials.schema
    });
    
    return headers;
  }

  // För framtida implementation - skicka meddelanden till CRM API
  async sendMessage(content: string): Promise<CrmActivity | null> {
    if (!this.credentials) {
      toast.error("Vänligen konfigurera dina API-inställningar först");
      return null;
    }

    try {
      // Eftersom API:et inte har en specifik endpoint för att skicka meddelanden,
      // kan vi använda notes-endpointen för att skapa en ny anteckning
      // Detta behöver anpassas när API:et stödjer direkta meddelanden
      
      // Mock-implementering tills API stöder det
      const mockActivity: CrmActivity = {
        id: Date.now().toString(),
        type: 'message',
        content: content,
        timestamp: new Date().toISOString(),
        user: {
          id: '100',
          name: 'Aktiv användare',
        }
      };
      
      // Meddela lyssnare om den nya aktiviteten
      const currentActivities = await this.fetchActivities();
      const updatedActivities = [mockActivity, ...currentActivities];
      this.listeners.forEach(listener => listener(updatedActivities));
      
      toast.success("Meddelande skickat");
      return mockActivity;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Kunde inte skicka meddelandet");
      return null;
    }
  }

  // Prenumerera på aktivitetsuppdateringar
  subscribeToActivities(callback: (activities: CrmActivity[]) => void): () => void {
    this.listeners.push(callback);
    
    // Starta pollingen om detta är första prenumeranten
    if (this.listeners.length === 1) {
      this.startPolling();
    }
    
    // Returnera avprenumereringsfunktion
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      
      // Stoppa pollingen om det inte finns fler prenumeranter
      if (this.listeners.length === 0) {
        this.stopPolling();
      }
    };
  }
  
  private startPolling(): void {
    // Polla var 30:e sekund
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

  // Mockdata för utveckling och testning
  private getMockActivities(): CrmActivity[] {
    // Add a new activity that will appear as "new" in the app
    const newMockActivity: CrmActivity = {
      id: `mock-${Date.now()}`,  // Ensures a unique ID each time
      type: 'note',
      content: 'Ny testanteckning skapad ' + new Date().toLocaleTimeString('sv-SE'),
      timestamp: new Date().toISOString(),
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
    };
    
    return [
      newMockActivity, // Add the new mock activity at the top
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

