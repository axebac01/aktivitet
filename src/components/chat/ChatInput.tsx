
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Users } from "lucide-react";
import { chatService } from "@/services/chatService";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserProfile } from "@/types/user";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showUserPopover, setShowUserPopover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get all users for mentions
    setUsers(authService.getAllUsers());
  }, []);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Meddelandet kan inte vara tomt");
      return;
    }

    if (!authService.isAuthenticated()) {
      toast.error("Du måste vara inloggad för att skicka meddelanden");
      return;
    }

    setIsSending(true);
    try {
      const result = chatService.sendMessage(message);
      
      if (result) {
        setMessage("");
        // Refocus the textarea
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Kunde inte skicka meddelandet");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMention = (username: string) => {
    setMessage((prev) => {
      // Insert @username at cursor position or at the end
      const selectionStart = textareaRef.current?.selectionStart ?? prev.length;
      const selectionEnd = textareaRef.current?.selectionEnd ?? prev.length;
      const beforeCursor = prev.substring(0, selectionStart);
      const afterCursor = prev.substring(selectionEnd);
      
      // Add space before mention if there isn't one already
      const spaceBeforeMention = 
        beforeCursor.length === 0 || beforeCursor.endsWith(" ") ? "" : " ";
      
      // Add space after mention if there isn't one already
      const spaceAfterMention = 
        afterCursor.length === 0 || afterCursor.startsWith(" ") ? "" : " ";
      
      const newMessage = 
        beforeCursor + spaceBeforeMention + "@" + username + spaceAfterMention + afterCursor;
      
      return newMessage;
    });
    
    setShowUserPopover(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Skriv ett meddelande... @användarnamn för att tagga"
            className="resize-none pr-10"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || !authService.isAuthenticated()}
            rows={2}
          />
          
          <Popover open={showUserPopover} onOpenChange={setShowUserPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                disabled={!authService.isAuthenticated()}
                onClick={() => setShowUserPopover(true)}
              >
                <Users size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="py-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                  Tagga användare
                </div>
                {users.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => insertMention(user.displayName)}
                      >
                        <div className="h-6 w-6 rounded-full bg-crm-blue/20 flex items-center justify-center text-crm-blue text-xs font-medium">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.displayName}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Inga användare tillgängliga
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={isSending || !message.trim() || !authService.isAuthenticated()}
          className="bg-crm-orange hover:bg-crm-orange/90 text-white self-end"
        >
          <Send size={16} />
          <span className="sr-only">Skicka</span>
        </Button>
      </div>
      
      {authService.isAuthenticated() ? (
        <div className="text-xs text-gray-500 mt-1">
          Tryck på Ctrl+Enter för att skicka
        </div>
      ) : (
        <div className="text-xs text-red-500 mt-1">
          Du måste vara inloggad för att skicka meddelanden
        </div>
      )}
    </div>
  );
}
