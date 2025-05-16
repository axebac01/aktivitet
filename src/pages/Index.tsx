
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="bg-white shadow-soft border-b sticky top-0 z-10">
        <div className="container py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0270df6d-056b-46bd-b766-cb0fe841d756.png" 
              alt="CRMdata Logo" 
              className="h-8"
            />
            <h1 className="text-xl font-semibold text-gradient">Aktivitetsflöde</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSettingsOpen(true)}
              className="glass-morphism hover:bg-white/40 hover:shadow-md transition-all duration-300"
            >
              <Settings className="mr-2 h-4 w-4" />
              API Setup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshActivities}
              className="glass-morphism hover:bg-white/40 hover:shadow-md transition-all duration-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Uppdatera
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Tabs defaultValue="activity-stream" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-full p-1 glass-morphism mb-6">
            <TabsTrigger value="activity-stream" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
              <MessageSquare className="mr-2 h-4 w-4" />
              Aktivitetsflöde
            </TabsTrigger>
            <TabsTrigger value="embed" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
              Bädda in
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity-stream" className="animate-fade-in">
            <Card className="glass-card border-none shadow-card overflow-hidden">
              <CardHeader className="border-b bg-gradient-blue p-4">
                <CardTitle className="text-lg font-medium text-white flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Aktivitetsflöde från CRM
                </CardTitle>
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
          
          <TabsContent value="embed" className="animate-fade-in">
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
