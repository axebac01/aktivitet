
import React, { useState } from 'react';
import { ActivityStream } from '@/components/ActivityStream';
import { MessageInput } from '@/components/MessageInput';
import { crmApi } from '@/services/crmApi';
import { ApiSetupModal } from '@/components/ApiSetupModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Embed = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(!crmApi.getCredentials());

  // Funktion för att uppdatera aktivitetsflödet när ett nytt meddelande skickas
  const handleMessageSent = () => {
    // ActivityStream komponenten hanterar uppdateringar automatiskt
    // genom prenumeration på aktiviteter
  };

  return (
    <div className="h-full flex flex-col bg-white border rounded shadow-sm">
      <div className="p-2 flex justify-between items-center border-b bg-crm-blue text-white">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/9a9a0b86-ed92-4cd5-b26f-58b6d9dcb5a1.png" 
            alt="CRMdata Logo" 
            className="h-6"
          />
          <h2 className="text-sm font-medium">Aktivitetsflöde</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          className="text-white hover:bg-crm-navy"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ActivityStream />
      </div>
      
      <MessageInput 
        disabled={!crmApi.getCredentials()} 
        onMessageSent={handleMessageSent}
      />

      {/* API Setup Modal */}
      <ApiSetupModal 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Embed;
