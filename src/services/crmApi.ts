import axios from 'axios';

class CrmApiService {
  private apiUrl: string | null = null;
  private credentials: {
    schema: string;
    username: string;
    password: string;
  } | null = null;
  private userMap: Map<string, string> = new Map();
  private salesPersonIdToNameMap: Map<string, string> = new Map();
  private initialized = false;

  constructor() {
    // Load stored credentials on initialization
    this.loadStoredCredentials();
  }

  private loadStoredCredentials(): void {
    try {
      // Check if credentials are stored in localStorage
      const storedCredentials = localStorage.getItem('crm_credentials');
      
      if (storedCredentials) {
        const { apiUrl, schema, username } = JSON.parse(storedCredentials);
        
        // Check if all required fields exist
        if (apiUrl && schema && username) {
          console.log('Loaded stored API credentials for', username);
          
          // Set API URL
          this.apiUrl = apiUrl;
          
          // Set credentials (without password, which we don't store)
          // The user will still need to enter the password when needed
          this.credentials = {
            schema,
            username,
            password: '' // Password is empty, will be set when user logs in
          };
        }
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  }

  setCredentials(apiUrl: string, schema: string, username: string, password: string): void {
    this.apiUrl = apiUrl;
    this.credentials = {
      schema,
      username,
      password
    };
    this.initialized = false; // Reset initialization flag
  }

  getApiUrl(): string | null {
    return this.apiUrl;
  }

  getSchema(): string | null {
    return this.credentials?.schema || null;
  }

  getUsername(): string | null {
    return this.credentials?.username || null;
  }

  // Additional methods for API interaction can be added here
}

export const crmApi = new CrmApiService();
