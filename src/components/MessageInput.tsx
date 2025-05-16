
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { crmApi } from '@/services/crmApi';

interface MessageInputProps {
  disabled?: boolean;
  onMessageSent?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  disabled = false,
  onMessageSent
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Meddelandet kan inte vara tomt");
      return;
    }

    if (!crmApi.getApiUrl()) {
      toast.error("Vänligen konfigurera API-URL först");
      return;
    }

    setSending(true);
    try {
      const result = await crmApi.sendMessage(message);
      
      if (result) {
        toast.success("Meddelande skickat");
        setMessage('');
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Kunde inte skicka meddelandet");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Skriv ett meddelande..."
          className="resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          rows={1}
        />
        <Button 
          onClick={handleSend} 
          disabled={disabled || sending || !message.trim()}
          className="bg-crm-orange hover:bg-crm-orange/90 text-white"
        >
          <Send size={16} />
          <span className="sr-only">Skicka</span>
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Tryck på Ctrl+Enter för att skicka
      </div>
    </div>
  );
};
