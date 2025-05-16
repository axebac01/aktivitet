
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { crmApi, ApiCredentials } from '@/services/crmApi';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApiSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApiSetupModal: React.FC<ApiSetupModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [credentials, setCredentials] = useState<ApiCredentials>({
    username: '',
    password: '',
    schema: '',
    apiUrl: 'https://api.crmdata.se'
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Ladda befintliga inställningar när modal öppnas
  useEffect(() => {
    if (open) {
      const savedCredentials = crmApi.getCredentials();
      if (savedCredentials) {
        setCredentials(savedCredentials);
      }
      setTestResult(null); // Reset test result when modal opens
    }
  }, [open]);

  const handleInputChange = (field: keyof ApiCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset test result when credentials change
    if (testResult) {
      setTestResult(null);
    }
  };

  const handleSave = async () => {
    // Validera att obligatoriska fält är ifyllda
    if (!credentials.username.trim() || !credentials.password.trim() || !credentials.schema.trim()) {
      toast.error("Alla fält är obligatoriska");
      return;
    }

    setIsValidating(true);

    try {
      crmApi.setApiCredentials(credentials);
      onOpenChange(false);
      toast.success("API-anslutningen är konfigurerad!");
    } finally {
      setIsValidating(false);
    }
  };

  const handleTest = async () => {
    // Validera att obligatoriska fält är ifyllda
    if (!credentials.username.trim() || !credentials.password.trim() || !credentials.schema.trim()) {
      toast.error("Alla fält är obligatoriska för att testa anslutningen");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Spara temporärt inställningarna för testet
      crmApi.setApiCredentials(credentials);
      
      // Testa anslutningen
      const result = await crmApi.testApiConnection();
      
      setTestResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast.success("API-anslutningen fungerar!");
      } else {
        toast.error("Kunde inte ansluta till API:et");
      }
      
      console.log("API test details:", result.details);
    } catch (error) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        message: `Ett fel uppstod: ${error instanceof Error ? error.message : String(error)}`
      });
      toast.error("Ett oväntat fel uppstod vid test av anslutningen");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-center mb-2">
            <img 
              src="/lovable-uploads/9a9a0b86-ed92-4cd5-b26f-58b6d9dcb5a1.png" 
              alt="CRMdata Logo" 
              className="h-8"
            />
          </div>
          <DialogTitle>CRM API-inställningar</DialogTitle>
          <DialogDescription>
            Ange dina CRM API-inloggningsuppgifter för att ansluta till ditt system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-url" className="text-right">
              API URL
            </Label>
            <Input
              id="api-url"
              className="col-span-3"
              value={credentials.apiUrl}
              onChange={(e) => handleInputChange('apiUrl', e.target.value)}
              placeholder="https://api.crmdata.se"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Användarnamn
            </Label>
            <Input
              id="username"
              className="col-span-3"
              value={credentials.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="api@001_api"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Lösenord
            </Label>
            <Input
              id="password"
              type="password"
              className="col-span-3"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schema" className="text-right">
              Schema
            </Label>
            <Input
              id="schema"
              className="col-span-3"
              value={credentials.schema}
              onChange={(e) => handleInputChange('schema', e.target.value)}
              placeholder="example@001"
            />
            <div className="col-span-4 text-xs text-gray-500">
              <p>Schema är ditt licensnamn, t.ex. "example@001"</p>
            </div>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-md col-span-4 mt-2 flex items-start gap-2 ${
              testResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 
                                 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? 
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" /> : 
                <AlertCircle size={18} className="text-red-500 mt-0.5" />
              }
              <div>
                <p className="font-medium">{testResult.success ? 'Anslutning lyckades' : 'Anslutningen misslyckades'}</p>
                <p className="text-sm">{testResult.message}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleTest} 
            disabled={isTesting}
            className="mr-auto"
          >
            {isTesting ? "Testar..." : "Testa anslutning"}
          </Button>
          <Button 
            type="submit" 
            onClick={handleSave} 
            disabled={isValidating}
            className="bg-crm-orange hover:bg-crm-orange/90"
          >
            {isValidating ? "Validerar..." : "Spara inställningar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
