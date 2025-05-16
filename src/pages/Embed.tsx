
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
      <div className="p-2 flex justify-between items-center border-b">
        <h2 className="text-sm font-medium">Aktivitetsflöde</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
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
