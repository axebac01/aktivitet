
import { ChatMessage, UserProfile } from "@/types/user";
import { authService } from "./authService";
import { toast } from "sonner";

class ChatService {
  private messages: ChatMessage[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];
  
  constructor() {
    this.loadMessagesFromStorage();
  }
  
  private loadMessagesFromStorage(): void {
    const messagesData = localStorage.getItem('crmChatMessages');
    if (messagesData) {
      try {
        this.messages = JSON.parse(messagesData);
      } catch (error) {
        console.error("Failed to parse messages data:", error);
        this.messages = [];
      }
    }
  }
  
  private saveMessagesToStorage(): void {
    localStorage.setItem('crmChatMessages', JSON.stringify(this.messages));
  }
  
  public getAllMessages(): ChatMessage[] {
    return [...this.messages];
  }
  
  public subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.messages]));
  }
  
  public sendMessage(content: string): ChatMessage | null {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error("Du måste vara inloggad för att skicka meddelanden");
      return null;
    }
    
    // Extract mentions using @username pattern
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionPattern.exec(content)) !== null) {
      const mentionedName = match[1];
      const mentionedUser = authService.getAllUsers().find(
        user => user.displayName.toLowerCase() === mentionedName.toLowerCase()
      );
      
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    // Create new message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      mentions
    };
    
    // Add message to list
    this.messages.unshift(newMessage);
    this.saveMessagesToStorage();
    
    // Notify listeners
    this.notifyListeners();
    
    return newMessage;
  }
  
  public clearMessages(): void {
    this.messages = [];
    this.saveMessagesToStorage();
    this.notifyListeners();
  }
}

export const chatService = new ChatService();
