
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStream } from '@/components/ActivityStream';
import { ApiSetupModal } from '@/components/ApiSetupModal';
import { crmApi } from '@/services/crmApi';
import { Settings, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  // Check if we have remembered credentials
  const hasRememberedCredentials = localStorage.getItem("crm-remember-me") === "true";
  
  // Only show settings modal if neither API URL is set nor remembered credentials exist
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    !crmApi.getApiUrl() && !hasRememberedCredentials
  );
  
  const { toast } = useToast();
  
  // Apply remembered credentials on mount if they exist
  useEffect(() => {
    if (hasRememberedCredentials) {
      const apiUrl = localStorage.getItem("crm-api-url");
      const apiKey = localStorage.getItem("crm-api-key");
      
      if (apiUrl) crmApi.setApiUrl(apiUrl);
      if (apiKey) crmApi.setApiKey(apiKey);
    }
  }, [hasRememberedCredentials]);
  
  const handleRefreshActivities = async () => {
    toast({
      title: "Uppdaterar aktiviteter",
      description: "Hämtar senaste aktiviteterna från CRM-systemet..."
    });

    // This is just to demonstrate toast functionality since the actual refresh 
    // is handled within the ActivityStream component
    setTimeout(() => {
      toast({
        title: "Uppdaterad",
        description: "Aktivitetsflödet har uppdaterats."
      });
    }, 1500);
  };
  
  return <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="bg-white shadow-soft border-b sticky top-0 z-10">
        <div className="container py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/7385ba2a-9cf3-4fb7-a9b6-6884c2a9e544.png" alt="CRMdata Logo" className="h-14" />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="glass-morphism hover:bg-white/40 hover:shadow-md transition-all duration-300">
              <Settings className="mr-2 h-4 w-4" />
              API Setup
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Card className="glass-card border-none shadow-card overflow-hidden">
          <CardHeader className="border-b bg-gradient-blue p-4">
            <CardTitle className="text-2xl font-medium text-white flex items-center">
              <RefreshCw className="mr-3 h-6 w-6" />
              Aktivitetsflöde från CRM
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[650px]">
            <div className="flex-1 overflow-y-auto">
              <ActivityStream />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* API Setup Modal */}
      <ApiSetupModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>;
};
export default Index;
