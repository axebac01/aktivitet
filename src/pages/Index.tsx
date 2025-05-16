
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityStream } from '@/components/ActivityStream';
import { MessageInput } from '@/components/MessageInput';
import { ApiSetupModal } from '@/components/ApiSetupModal';
import { crmApi } from '@/services/crmApi';
import { Settings, RefreshCw, MessageSquare, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { authService } from '@/services/authService';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(!crmApi.getApiUrl());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('activity');

  useEffect(() => {
    // Check authentication status on component mount
    setIsAuthenticated(authService.isAuthenticated());
    setCurrentUser(authService.getCurrentUser());
  }, []);

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

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast({
      title: "Utloggad",
      description: "Du har loggat ut från systemet.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="bg-white shadow-soft border-b sticky top-0 z-10">
        <div className="container py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/7385ba2a-9cf3-4fb7-a9b6-6884c2a9e544.png" 
              alt="CRMdata Logo" 
              className="h-14" 
            />
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <div className="mr-2 text-sm">
                  <span className="text-gray-500">Inloggad som:</span>{' '}
                  <span className="font-medium">{currentUser?.displayName}</span>
                  {currentUser?.crmUserName && (
                    <span className="text-xs text-crm-blue block">
                      CRM: {currentUser.crmUserName}
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="glass-morphism hover:bg-white/40 hover:shadow-md transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logga ut
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="glass-morphism hover:bg-white/40 hover:shadow-md transition-all duration-300"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Logga in
              </Button>
            )}
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

      <main className="container py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Card className="glass-card border-none shadow-card overflow-hidden">
          <CardHeader className="border-b bg-gradient-blue p-4">
            <CardTitle className="text-2xl font-medium text-white flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-3 h-6 w-6" />
                Aktivitetsflöde från CRM
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-white/20">
                  <TabsTrigger value="activity" className="data-[state=active]:bg-white/90 data-[state=active]:text-crm-blue">
                    Aktiviteter
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="data-[state=active]:bg-white/90 data-[state=active]:text-crm-blue">
                    Chat
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[650px]">
            <TabsContent value="activity" className="flex-1 flex flex-col m-0">
              <div className="flex-1 overflow-y-auto">
                <ActivityStream />
              </div>
              
              <MessageInput 
                disabled={!crmApi.getApiUrl()}
              />
            </TabsContent>
            
            <TabsContent value="chat" className="flex-1 m-0">
              <ChatPanel />
            </TabsContent>
          </CardContent>
        </Card>
      </main>

      {/* API Setup Modal */}
      <ApiSetupModal 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
      
      {/* Auth Modal for Login/Register */}
      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </div>
  );
};

export default Index;
