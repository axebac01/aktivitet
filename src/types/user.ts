
export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  crmUserId?: string;
  crmUserName?: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  mentions: string[]; // Array of user IDs that are mentioned
}
