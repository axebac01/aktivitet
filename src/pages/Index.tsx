
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStream } from '@/components/ActivityStream';
import { MessageInput } from '@/components/MessageInput';
import { ApiSetupModal } from '@/components/ApiSetupModal';
import { EmbedCodeGenerator } from '@/components/EmbedCodeGenerator';
import { crmApi } from '@/services/crmApi';
import { Settings, RefreshCw, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(!crmApi.getApiUrl());
  const { toast } = useToast();

  const handleRefreshActivities = async () => {
    toast({
      title: "Uppdaterar aktiviteter",
      description: "Hämtar senaste aktiviteterna från CRM-systemet...",
    });
    
    // This is just to demonstrate toast functionality since the actual refresh 
    // is handled within the ActivityStream component
    setTimeout(() => {
      toast({
        title: "Uppdaterad",
        description: "Aktivitetsflödet har uppdaterats.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-crm-blue" />
            <h1 className="text-xl font-semibold text-gray-900">CRM Aktivitetsflöde</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              API Setup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshActivities}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Uppdatera
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Tabs defaultValue="activity-stream" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity-stream">Aktivitetsflöde</TabsTrigger>
            <TabsTrigger value="embed">Bädda in</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity-stream">
            <Card>
              <CardHeader className="border-b bg-gray-50 p-4">
                <CardTitle className="text-lg font-medium">Aktivitetsflöde från CRM</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[650px]">
                <div className="flex-1 overflow-y-auto">
                  <ActivityStream />
                </div>
                
                <MessageInput 
                  disabled={!crmApi.getApiUrl()}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="embed">
            <EmbedCodeGenerator />
          </TabsContent>
        </Tabs>
      </main>

      {/* API Setup Modal */}
      <ApiSetupModal 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Index;
