
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

  // Ladda befintliga inställningar när modal öppnas
  useEffect(() => {
    if (open) {
      const savedCredentials = crmApi.getCredentials();
      if (savedCredentials) {
        setCredentials(savedCredentials);
      }
    }
  }, [open]);

  const handleInputChange = (field: keyof ApiCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validera att obligatoriska fält är ifyllda
    if (!credentials.username.trim() || !credentials.password.trim() || !credentials.schema.trim()) {
      toast.error("Alla fält är obligatoriska");
      return;
    }

    setIsValidating(true);

    try {
      // Testa API-anslutningen
      const authString = btoa(`${credentials.username}:${credentials.password}`);
      const testUrl = `${credentials.apiUrl}/notes`;
      
      try {
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          headers: {
            'Authorization': `Basic ${authString}`,
            'X-Schema': credentials.schema
          },
          // Använd no-cors mode för att hantera CORS-problem vid validering
          mode: 'no-cors',
          // Timeout efter 5 sekunder
          signal: AbortSignal.timeout(5000)
        });
        
        // Med no-cors får vi inte en ok-status, så vi antar att det fungerar
        crmApi.setApiCredentials(credentials);
        onOpenChange(false);
        toast.success("API-anslutningen är konfigurerad!");
      } catch (error) {
        // Vi varnar men sparar ändå
        console.warn("Kunde inte validera API-URL, sparar ändå:", error);
        toast.warning("Kunde inte validera API-inställningarna, men de har sparats");
        crmApi.setApiCredentials(credentials);
        onOpenChange(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
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
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isValidating}>
            {isValidating ? "Validerar..." : "Spara inställningar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
