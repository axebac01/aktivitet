
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
    <div className="h-full flex flex-col glass-card rounded-lg overflow-hidden border shadow-card">
      <div className="p-2 flex justify-between items-center border-b bg-gradient-blue text-white">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/0270df6d-056b-46bd-b766-cb0fe841d756.png" 
            alt="CRMdata Logo" 
            className="h-6"
          />
          <h2 className="text-sm font-medium">Aktivitetsflöde</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          className="text-white hover:bg-crm-navy/50 hover:text-white"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-secondary/30">
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
