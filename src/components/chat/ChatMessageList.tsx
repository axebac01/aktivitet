
import { useEffect, useState, useRef } from "react";
import { chatService } from "@/services/chatService";
import { ChatMessage } from "@/types/user";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessageListProps {
  className?: string;
}

export function ChatMessageList({ className = "" }: ChatMessageListProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Get initial messages
    const initialMessages = chatService.getAllMessages();
    setMessages(initialMessages);
    
    // Subscribe to new messages
    const unsubscribe = chatService.subscribeToMessages((updatedMessages) => {
      setMessages(updatedMessages);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Format message content to highlight mentions
  const formatMessageContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-crm-blue font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className={`h-full px-4 py-4 ${className}`}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p className="text-muted-foreground text-sm">
            Inga meddelanden än. Börja chatta!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className="p-3 rounded-lg bg-white/70 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-full bg-crm-blue/20 flex items-center justify-center text-crm-blue font-medium">
                  {message.senderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {message.senderName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
              <div className="pl-10 text-sm">
                {formatMessageContent(message.content)}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}
