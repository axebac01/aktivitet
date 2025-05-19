
import React, { useState } from 'react';
import { ActivityStream } from '@/components/ActivityStream';
import { crmApi } from '@/services/crmApi';
import { ApiSetupModal } from '@/components/ApiSetupModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Embed = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(!crmApi.getCredentials());

  return (
    <div className="h-full flex flex-col glass-card rounded-lg overflow-hidden border shadow-card">
      <div className="p-2 flex justify-between items-center border-b bg-gradient-blue text-white">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/7385ba2a-9cf3-4fb7-a9b6-6884c2a9e544.png" 
            alt="CRMdata Logo" 
            className="h-10" 
          />
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

      {/* API Setup Modal */}
      <ApiSetupModal 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Embed;
