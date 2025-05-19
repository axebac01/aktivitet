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
  orderDetails?: {
    totalValue?: string;
    items?: Array<{
      id?: string;
      name: string;
      quantity?: number;
      price?: string;
    }>;
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
  text?: string;
  note?: string;
  created: string;
  createdBy?: string;
  userSignature?: string;
  email?: string;
  companyName?: string;
  customerId?: string;
  user?: {
    id?: string;
    name?: string;
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
  createdBy?: string;
  userSignature?: string;
  email?: string;
  companyName?: string;
  customerId?: string;
  user?: {
    id?: string;
    name?: string;
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
  createdBy?: string;
  userSignature?: string;
  email?: string;
  companyName?: string;
  customerId?: string;
  customer?: {
    id: string;
    name: string;
  };
  user?: {
    id?: string;
    name: string;
  };
  totalExVat?: string;
  orderRows?: Array<{
    id?: string;
    productId?: string;
    productName?: string;
    articleNumber?: string;
    quantity?: number;
    price?: string;
    totalRowPrice?: string;
  }>;
  totalExclVat?: string; // Alternative name for totalExVat
  orderDate?: string;    // Alternative field for created date
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

// Interface för användare från api_users_view
interface ApiUser {
  userid: string;
  firstname?: string;  // Updated field names to match API response
  lastname?: string;   // Updated field names to match API response
  Fname?: string;      // Keep original field names as fallback
  Lname?: string;      // Keep original field names as fallback
}

// New interface for salesperson data from dashboard/salesperson endpoint
interface ApiSalesperson {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  userId?: string;
}

class CrmApiService {
  private apiUrl: string = '';
  private credentials: ApiCredentials | null = null;
  private pollingInterval: number | null = null;
  private listeners: ((activities: CrmActivity[]) => void)[] = [];
  private lastFetchTime: number = 0;
  private userMap: Map<string, string> = new Map(); // Map för att koppla användarID till namn
  private salespersonMap: Map<string, string> = new Map(); // New map for salespersons

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
      
      // First, fetch all customers to use for mapping
      const customers = await this.fetchCustomers();
      console.log(`Fetched ${customers.length} customers for mapping`);
      
      // Fetch all users from api_users_view to map user IDs to names
      const users = await this.fetchUsers();
      console.log(`Fetched ${users.length} users for mapping`);
      
      // Fetch all salespersons for better user name mapping
      // Added debug log to track if this function is actually being called
      console.log("About to call fetchSalespersons...");
      await this.fetchSalespersons();
      console.log("Returned from fetchSalespersons call");
      
      // Create a map of customer IDs to names for quick lookups
      const customerMap = new Map<string, string>();
      customers.forEach(customer => {
        if (customer.id && customer.name) {
          customerMap.set(customer.id, customer.name);
          // Also log each customer mapping for debugging
          console.log(`Customer mapping: ID ${customer.id} => ${customer.name}`);
        }
      });
      
      // Create a map of user IDs to names for quick lookups
      this.userMap.clear();
      users.forEach(user => {
        // Use firstname/lastname OR Fname/Lname fields depending on what's available
        const firstName = user.firstname || user.Fname || '';
        const lastName = user.lastname || user.Lname || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (user.userid && fullName) {
          // Important: Clean and normalize the user ID by removing the domain suffix
          const userId = user.userid.toLowerCase().replace(/@001$/, '');
          this.userMap.set(userId, fullName);
          // Log each user mapping for debugging
          console.log(`User mapping: ID ${userId} => ${fullName} (from fields: ${firstName}/${lastName})`);
        } else {
          console.log(`Incomplete user data:`, user);
        }
      });
      
      // Fetch all types of activities
      const [notes, todos, orders] = await Promise.all([
        this.fetchNotes(),
        this.fetchTodos(),
        this.fetchOrders()
      ]);
      
      console.log(`Fetched ${notes.length} notes, ${todos.length} todos, ${orders.length} orders`);
      
      // For debugging, log a sample of each data type
      if (notes.length > 0) console.log("Sample note:", notes[0]);
      if (todos.length > 0) console.log("Sample todo:", todos[0]);
      if (orders.length >0) console.log("Sample order:", orders[0]);
      
      // Konvertera och kombinera notes, todos och orders till activities
      const noteActivities = notes.map(note => this.convertNoteToActivity(note, customerMap));
      const todoActivities = todos.map(todo => this.convertTodoToActivity(todo, customerMap));
      const orderActivities = orders.map(order => this.convertOrderToActivity(order, customerMap));
      
      // Log samples of converted activities
      if (noteActivities.length > 0) console.log("Sample converted note:", noteActivities[0]);
      if (todoActivities.length > 0) console.log("Sample converted todo:", todoActivities[0]);
      if (orderActivities.length > 0) console.log("Sample converted order:", orderActivities[0]);
      
      // Kombinera och sortera efter created timestamp (nyast först)
      const allActivities = [...noteActivities, ...todoActivities, ...orderActivities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Only use mock data if we didn't get any real activities
      if (allActivities.length === 0) {
        console.log("No real activities found, using mock data");
        return this.getMockActivities();
      }
      
      console.log(`Total activities: ${allActivities.length}`);
      console.log(`Activities with company: ${allActivities.filter(a => a.relatedTo).length}`);
      return allActivities;
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Kunde inte hämta aktiviteter. Använder testdata istället.");
      return this.getMockActivities(); // Fallback till mockdata vid fel
    }
  }

  // Hämta alla kunder från API för att kunna koppla kundnamn till aktiviteter
  private async fetchCustomers(): Promise<Array<{id: string, name: string}>> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      console.log("Fetching customers from API for mapping");
      const response = await fetch(`${this.apiUrl}/customers?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Customers API error (${response.status}):`, errorText);
        return [];
      }
      
      const data = await response.json();
      
      // Hanterar olika svarsformat baserat på API-dokumentationen
      let customers: Array<{id: string, name: string}> = [];
      
      if (Array.isArray(data)) {
        customers = data.map(customer => ({ 
          id: customer.id?.toString() || '', 
          name: customer.name || customer.companyName || '' 
        }));
      } else if (data && data.items) {
        customers = data.items.map(customer => ({ 
          id: customer.id?.toString() || '', 
          name: customer.name || customer.companyName || '' 
        }));
      } else if (data && data.data) {
        customers = data.data.map(customer => ({ 
          id: customer.id?.toString() || '', 
          name: customer.name || customer.companyName || '' 
        }));
      }
      
      console.log(`Processed ${customers.length} customers for mapping`);
      return customers;
    } catch (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
  }

  // Enhanced method to fetch salesperson data with better logging
  private async fetchSalespersons(): Promise<void> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      // Explicit debug logging
      console.log("------ STARTING SALESPERSON FETCH ------");
      console.log("API URL:", this.apiUrl);
      console.log("Endpoint: /dashboard/salesperson");
      
      // Creating headers exactly as in the working Postman example
      const myHeaders = new Headers();
      myHeaders.append("schema", this.credentials.schema);
      
      // Use the exact same authorization string as in Postman
      myHeaders.append("Authorization", "Basic YXBpQDAwMV9hcGk6WndMUDgyMlZpNDkz");
      
      console.log("Request headers set:", {
        schema: this.credentials.schema,
        Authorization: "Basic *** (using exact Postman string)"
      });
      
      // Create request options exactly as in Postman
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      
      // Log the full request that will be made
      console.log("Full request:", {
        url: `${this.apiUrl}/dashboard/salesperson`,
        method: "GET",
        headers: {
          schema: this.credentials.schema,
          Authorization: "Basic *** (hidden)"
        }
      });
      
      // Make the exact same API call as in Postman
      console.log("Making fetch request to salesperson endpoint...");
      
      // Explicitly log the complete URL being called
      const fullUrl = `${this.apiUrl}/dashboard/salesperson`;
      console.log("Full URL being called:", fullUrl);
      
      // Use explicit try/catch for the fetch operation
      let response;
      try {
        response = await fetch(fullUrl, requestOptions);
        console.log("Fetch request completed");
      } catch (fetchError) {
        console.error("Fetch operation failed:", fetchError);
        console.error("Fetch error details:", {
          name: fetchError instanceof Error ? fetchError.name : 'Unknown',
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
        return;
      }
      
      console.log("Salesperson API response received");
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      console.log("Response headers:", [...response.headers.entries()]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Salesperson API error (${response.status}):`, errorText);
        return;
      }
      
      // Get the response as text first to log it
      let responseText;
      try {
        responseText = await response.text();
        console.log("Response text received, length:", responseText.length);
        console.log("Response text sample (first 200 chars):", 
          responseText.length > 200 ? `${responseText.substring(0, 200)}...` : responseText);
      } catch (textError) {
        console.error("Error getting response text:", textError);
        return;
      }
      
      // Then parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("JSON parse successful");
        console.log("Data structure type:", Array.isArray(data) ? "Array" : typeof data);
        console.log("Data sample:", data);
      } catch (jsonError) {
        console.error("Could not parse salesperson response as JSON:", jsonError);
        console.error("Raw response text that couldn't be parsed:", responseText);
        return;
      }
      
      // Handle different response formats
      let salespeople: ApiSalesperson[] = [];
      
      if (Array.isArray(data)) {
        console.log("Data is an array with", data.length, "items");
        salespeople = data;
      } else if (data && data.items) {
        console.log("Data contains items array with", data.items.length, "items");
        salespeople = data.items;
      } else if (data && data.data) {
        console.log("Data contains data array with", data.data.length, "items");
        salespeople = data.data;
      } else {
        console.warn("Unexpected data structure:", data);
      }
      
      // Log actual field names from the first salesperson to help debug
      if (salespeople.length > 0) {
        console.log("First salesperson object fields:", Object.keys(salespeople[0]));
        console.log("First salesperson object:", salespeople[0]);
        console.log("Number of salespeople found:", salespeople.length);
      } else {
        console.log("No salesperson data found in the response");
      }
      
      // Clear existing map and populate with new data
      this.salespersonMap.clear();
      
      salespeople.forEach((person, index) => {
        console.log(`Processing salesperson ${index + 1}/${salespeople.length}:`, person);
        
        let fullName = '';
        
        // Try to get name using different possible fields
        if (person.fullName) {
          fullName = person.fullName;
          console.log(`Using fullName field: ${fullName}`);
        } else if (person.name) {
          fullName = person.name;
          console.log(`Using name field: ${fullName}`);
        } else if (person.firstName || person.lastName) {
          fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();
          console.log(`Using firstName/lastName fields: ${fullName}`);
        }
        
        if (person.id && fullName) {
          // Clean and normalize user ID for consistent lookup
          const userId = person.id.toLowerCase().replace(/@001$/, '');
          this.salespersonMap.set(userId, fullName);
          console.log(`Added mapping: ${userId} => ${fullName}`);
          
          // Also set using email as key if available
          if (person.email) {
            const emailId = person.email.toLowerCase().replace(/@.*$/, '');
            this.salespersonMap.set(emailId, fullName);
            console.log(`Added email mapping: ${emailId} => ${fullName}`);
          }
          
          // Also set using userId if available and different from id
          if (person.userId && person.userId !== person.id) {
            const normalizedUserId = person.userId.toLowerCase().replace(/@001$/, '');
            this.salespersonMap.set(normalizedUserId, fullName);
            console.log(`Added userId mapping: ${normalizedUserId} => ${fullName}`);
          }
        } else {
          console.log(`Skipping salesperson due to missing id or name:`, person);
        }
      });
      
      console.log(`Processed ${salespeople.length} salespersons for mapping`);
      console.log("Final salesperson map size:", this.salespersonMap.size);
      console.log("Final salesperson map entries:", [...this.salespersonMap.entries()]);
      console.log("------ FINISHED SALESPERSON FETCH ------");
    } catch (error) {
      console.error("------ ERROR IN SALESPERSON FETCH ------");
      console.error("Error fetching salespersons:", error);
      console.error("Full error details:", { 
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  // Hämta alla användare från api_users_view
  private async fetchUsers(): Promise<ApiUser[]> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      console.log("Fetching users from api_users_view");
      const response = await fetch(`${this.apiUrl}/api_users_view?viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Users API error (${response.status}):`, errorText);
        return [];
      }
      
      const data = await response.json();
      console.log("Users API response:", data);
      
      // Hantera olika svarsformat från API
      let users: ApiUser[] = [];
      
      if (Array.isArray(data)) {
        users = data;
      } else if (data && data.items) {
        users = data.items;
      } else if (data && data.data) {
        users = data.data;
      }
      
      // Log actual field names from the first user to help debug
      if (users.length > 0) {
        console.log("Sample user object fields:", Object.keys(users[0]));
        console.log("Sample user object:", users[0]);
      }
      
      console.log(`Processed ${users.length} users for mapping`);
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
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
      // Get orders sorted by created date or orderDate, newest first
      const response = await fetch(`${this.apiUrl}/orders?sort=created:desc&viewPage=1`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Orders API error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Orders API response:", data);
      
      // Hanterar olika svarsformat baserat på API-dokumentationen
      let orders: ApiOrder[] = [];
      
      if (Array.isArray(data)) {
        orders = data;
      } else if (data && data.items) {
        orders = data.items;
      } else if (data && data.data) {
        orders = data.data;
      }
      
      // Process each order one by one to handle errors with individual order rows
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        if (order.id) {
          try {
            // Fetch order rows for this order
            const orderRows = await this.fetchOrderRowsForOrder(order.id);
            if (orderRows && orderRows.length > 0) {
              order.orderRows = orderRows;
              console.log(`Fetched ${orderRows.length} order rows for order ${order.id}`);
            }
          } catch (error) {
            console.error(`Error fetching order rows for order ${order.id}:`, error);
            // Continue with the next order even if this one fails
          }
        }
      }
      
      console.log(`Processed ${orders.length} orders`);
      return orders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Return empty array instead of throwing to avoid breaking all activities
      console.warn("Using empty orders array due to error");
      return [];
    }
  }
  
  // Separate method to fetch order rows for a specific order
  private async fetchOrderRowsForOrder(orderId: string): Promise<Array<{
    id?: string;
    productId?: string;
    productName?: string;
    articleNumber?: string;
    quantity?: number;
    price?: string;
    totalRowPrice?: string;
  }>> {
    if (!this.credentials) {
      throw new Error("API credentials not set");
    }
    
    try {
      const rowsResponse = await fetch(`${this.apiUrl}/orderrows?orderId=${orderId}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!rowsResponse.ok) {
        const errorText = await rowsResponse.text();
        console.error(`Order rows API error (${rowsResponse.status}) for order ${orderId}:`, errorText);
        return [];
      }
      
      const rowsData = await rowsResponse.json();
      let rows = [];
      
      if (Array.isArray(rowsData)) {
        rows = rowsData;
      } else if (rowsData && rowsData.items) {
        rows = rowsData.items;
      } else if (rowsData && rowsData.data) {
        rows = rowsData.data;
      }
      
      return rows;
    } catch (error) {
      console.error(`Error fetching order rows for order ${orderId}:`, error);
      return [];
    }
  }

  // Hitta användarens namn baserat på createdBy
  private getUserName(createdBy?: string): string {
    if (!createdBy) return 'Okänd användare';
    
    // Extract the username from the createdBy field and normalize it
    // Remove @001 or similar suffix and convert to lowercase for consistent lookup
    const userId = createdBy.toLowerCase().replace(/@001$/, '');
    
    // First check in salesperson map (prioritize this data as it's more likely to be complete)
    const salespersonName = this.salespersonMap.get(userId);
    if (salespersonName) {
      console.log(`Found name in salesperson map for ${userId}: ${salespersonName}`);
      return salespersonName;
    }
    
    // Then check in user map
    const userName = this.userMap.get(userId);
    console.log(`Looking up user ${userId}, found in user map: ${userName || 'not found'}`);
    if (userName) return userName;
    
    // Return the userId as fallback
    return createdBy; 
  }

  // Omvandla ApiNote till CrmActivity
  private convertNoteToActivity(note: ApiNote, customerMap: Map<string, string>): CrmActivity {
    console.log("Converting note to activity:", note);
    
    // Extract userName from multiple possible fields with user mapping
    let userName = 'Okänd användare';
    if (note.createdBy) {
      userName = this.getUserName(note.createdBy);
      console.log(`For note ${note.id}: Found userName ${userName} from createdBy ${note.createdBy}`);
    } else if (note.user && note.user.name) {
      userName = note.user.name;
    } else if (note.userSignature) {
      userName = note.userSignature;
    }
    
    // Extract noteContent from either text or note field
    const noteContent = note.text || note.note || 'Ingen text';
    
    // Extract company information
    let customerName = '';
    let customerId = '';
    
    if (note.companyName) {
      customerName = note.companyName;
    }
    
    if (note.customerId) {
      customerId = note.customerId.toString();
      
      // If we have customerId but no name, try to lookup from customer map
      if (!customerName) {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    } else if (note.customer && note.customer.id) {
      customerId = note.customer.id.toString();
      
      if (!customerName && note.customer.name) {
        customerName = note.customer.name;
      } else {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    }
    
    const activity: CrmActivity = {
      id: note.id || `note-${Date.now()}-${Math.random()}`,
      type: 'note',
      content: noteContent,
      timestamp: note.created || new Date().toISOString(),
      user: {
        id: note.createdBy || 'unknown',
        name: userName,
      },
      relatedTo: customerName ? {
        type: 'customer',
        id: customerId || 'unknown',
        name: customerName
      } : undefined
    };
    
    console.log("Converted note activity:", activity);
    return activity;
  }

  // Omvandla ApiTodo till CrmActivity
  private convertTodoToActivity(todo: ApiTodo, customerMap: Map<string, string>): CrmActivity {
    console.log("Converting todo to activity:", todo);
    
    // Extract userName from multiple possible fields with user mapping
    let userName = '';
    if (todo.createdBy) {
      userName = this.getUserName(todo.createdBy);
    } else if (todo.user && todo.user.name) {
      userName = todo.user.name;
    } else if (todo.userSignature) {
      userName = todo.userSignature;
    }
    
    // Extract company information
    let customerName = '';
    let customerId = '';
    
    if (todo.companyName) {
      customerName = todo.companyName;
    }
    
    if (todo.customerId) {
      customerId = todo.customerId.toString();
      
      // If we have customerId but no name, try to lookup from customer map
      if (!customerName) {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    } else if (todo.customer && todo.customer.id) {
      customerId = todo.customer.id.toString();
      
      if (!customerName && todo.customer.name) {
        customerName = todo.customer.name;
      } else {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    }
    
    const activity: CrmActivity = {
      id: todo.id || `todo-${Date.now()}-${Math.random()}`,
      type: 'task',
      content: todo.title ? `${todo.title}: ${todo.description || ''}` : (todo.description || 'Ingen beskrivning'),
      timestamp: todo.triggerDate || new Date().toISOString(),
      user: {
        id: todo.createdBy || 'unknown',
        name: userName,
      },
      relatedTo: customerName ? {
        type: 'customer',
        id: customerId || 'unknown',
        name: customerName
      } : undefined
    };
    
    console.log("Converted todo activity:", activity);
    return activity;
  }
  
  // Omvandla ApiOrder till CrmActivity
  private convertOrderToActivity(order: ApiOrder, customerMap: Map<string, string>): CrmActivity {
    console.log("Converting order to activity:", order);
    
    // Extract userName from multiple possible fields with user mapping
    let userName = '';
    if (order.createdBy) {
      userName = this.getUserName(order.createdBy);
    } else if (order.user && order.user.name) {
      userName = order.user.name;
    } else if (order.userSignature) {
      userName = order.userSignature;
    }
    
    // Extract company information
    let customerName = '';
    let customerId = '';
    
    if (order.companyName) {
      customerName = order.companyName;
    }
    
    if (order.customerId) {
      customerId = order.customerId.toString();
      
      // If we have customerId but no name, try to lookup from customer map
      if (!customerName) {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    } else if (order.customer && order.customer.id) {
      customerId = order.customer.id.toString();
      
      if (!customerName && order.customer.name) {
        customerName = order.customer.name;
      } else {
        const mappedName = customerMap.get(customerId);
        if (mappedName) {
          customerName = mappedName;
        }
      }
    }
    
    // Use the appropriate timestamp field - prefer orderDate, then created
    const timestamp = order.orderDate || order.created || new Date().toISOString();
    
    // Get total value ex VAT from appropriate field
    const totalValue = order.totalExVat || order.totalExclVat || '';
    
    // Create order details object for display in the UI
    const orderDetails = {
      totalValue: totalValue,
      items: order.orderRows?.map(row => ({
        id: row.id,
        name: row.productName || row.articleNumber || 'Ospecificerad produkt',
        quantity: row.quantity,
        price: row.price
      }))
    };
    
    const activity: CrmActivity = {
      id: `order-${order.id || Date.now()}`, // Unique ID to avoid conflicts
      type: 'call', // Using 'call' type since we don't have an 'order' type
      content: `Order ${order.orderNumber || 'utan nummer'} skapad med status: ${order.status || 'okänd'}`,
      timestamp: timestamp,
      user: {
        id: order.createdBy || 'unknown',
        name: userName,
      },
      relatedTo: customerName ? {
        type: 'customer',
        id: customerId || 'unknown',
        name: customerName
      } : undefined,
      orderDetails: orderDetails
    };
    
    console.log("Converted order activity:", activity);
    return activity;
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
    
    console.log("Using API headers for request:", {
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
        type: 'call', // This represents an order in our system
        content: 'Ny order sparad: Server uppdatering',
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
        },
        orderDetails: {
          totalValue: '56,000',
          items: [
            { name: 'Server Dell PowerEdge R740', quantity: 2, price: '24,000' },
            { name: 'Installation och konfiguration', quantity: 1, price: '8,000' }
          ]
        }
      },
      {
        id: '3',
        type: 'message',
        content: 'Nytt företag har lagts till i CRM-systemet',
        timestamp: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
        user: {
          id: '103',
          name: 'Lina Karlsson',
          avatar: 'https://i.pravatar.cc/150?img=5'
        },
        relatedTo: {
          type: 'customer',
          id: '2004',
          name: 'Nytt Bolag AB'
        }
      },
      {
        id: '4',
        type: 'note',
        content: 'Skickat avtal till SignRight för signering av kunden',
        timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        user: {
          id: '104',
          name: 'Niklas Lundgren'
        },
        relatedTo: {
          type: 'customer',
          id: '2001',
          name: 'Teknikbolaget AB'
        }
      },
      {
        id: '5',
        type: 'call', // This represents an order in our system
        content: 'Ny order registrerad: Supportavtal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        user: {
          id: '105',
          name: 'Sofia Berg',
          avatar: 'https://i.pravatar.cc/150?img=25'
        },
        relatedTo: {
          type: 'customer',
          id: '3001',
          name: 'IT Solutions AB'
        },
        orderDetails: {
          totalValue: '15,000',
          items: [
            { name: 'Premium Support (månadsavgift)', quantity: 1, price: '15,000' }
          ]
        }
      }
    ];
  }
}

// Singleton instance
export const crmApi = new CrmApiService();
