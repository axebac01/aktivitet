
import { UserProfile, UserCredentials } from "@/types/user";
import { crmApi } from "./crmApi";

class AuthService {
  private currentUser: UserProfile | null = null;
  private users: UserProfile[] = [];
  
  constructor() {
    // Load user data from localStorage on initialization
    this.loadUsersFromStorage();
    this.loadCurrentUserFromStorage();
  }
  
  private loadUsersFromStorage(): void {
    const usersData = localStorage.getItem('crmUsers');
    if (usersData) {
      try {
        this.users = JSON.parse(usersData);
      } catch (error) {
        console.error("Failed to parse users data:", error);
        this.users = [];
      }
    }
  }
  
  private saveUsersToStorage(): void {
    localStorage.setItem('crmUsers', JSON.stringify(this.users));
  }
  
  private loadCurrentUserFromStorage(): void {
    const userData = localStorage.getItem('crmCurrentUser');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error("Failed to parse current user data:", error);
        this.currentUser = null;
      }
    }
  }
  
  private saveCurrentUserToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('crmCurrentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('crmCurrentUser');
    }
  }
  
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
  
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }
  
  public async register(credentials: UserCredentials, displayName: string): Promise<UserProfile> {
    // Check if user already exists
    if (this.users.some(user => user.email === credentials.email)) {
      throw new Error("User with this email already exists");
    }
    
    // Create new user
    const newUser: UserProfile = {
      id: Date.now().toString(),
      email: credentials.email,
      displayName: displayName
    };
    
    this.users.push(newUser);
    this.saveUsersToStorage();
    
    return newUser;
  }
  
  public async login(credentials: UserCredentials): Promise<UserProfile> {
    const user = this.users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // In a real app, we would check the password here
    // This is just a simple implementation for demonstration purposes
    
    // Set as current user
    this.currentUser = user;
    this.saveCurrentUserToStorage();
    
    return user;
  }
  
  public logout(): void {
    this.currentUser = null;
    this.saveCurrentUserToStorage();
  }
  
  public updateUserCrmInfo(userId: string, crmUserId: string, crmUserName: string): UserProfile | null {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return null;
    }
    
    // Update user CRM info
    this.users[userIndex] = {
      ...this.users[userIndex],
      crmUserId,
      crmUserName
    };
    
    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = this.users[userIndex];
      this.saveCurrentUserToStorage();
    }
    
    this.saveUsersToStorage();
    
    return this.users[userIndex];
  }
  
  public getAllUsers(): UserProfile[] {
    return [...this.users];
  }
}

export const authService = new AuthService();
