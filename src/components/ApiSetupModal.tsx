
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { crmApi } from '@/services/crmApi';
import { Checkbox } from '@/components/ui/checkbox';

interface ApiSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApiSetupModal = ({ open, onOpenChange }: ApiSetupModalProps) => {
  const [apiUrl, setApiUrl] = useState(crmApi.getApiUrl() || '');
  const [schema, setSchema] = useState(crmApi.getSchema() || '');
  const [username, setUsername] = useState(crmApi.getUsername() || '');
  const [password, setPassword] = useState(''); // We don't store the password in the component state for security reasons
  const [rememberMe, setRememberMe] = useState(false);
  
  useEffect(() => {
    // Check if credentials are stored in localStorage
    const storedCredentials = localStorage.getItem('crm_credentials');
    
    if (storedCredentials) {
      try {
        const { apiUrl, schema, username, rememberMe } = JSON.parse(storedCredentials);
        setApiUrl(apiUrl || '');
        setSchema(schema || '');
        setUsername(username || '');
        setRememberMe(Boolean(rememberMe));
      } catch (error) {
        console.error('Failed to parse stored credentials:', error);
      }
    }
  }, []);

  const handleSave = () => {
    if (apiUrl && schema && username) {
      // Save to API service
      crmApi.setCredentials(apiUrl, schema, username, password);
      
      // If rememberMe is checked, store in localStorage
      if (rememberMe) {
        const credentials = {
          apiUrl,
          schema,
          username,
          rememberMe: true
        };
        localStorage.setItem('crm_credentials', JSON.stringify(credentials));
      } else {
        // If not remember me, remove from localStorage
        localStorage.removeItem('crm_credentials');
      }
      
      onOpenChange(false); // Close modal
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Inställningar</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-url" className="text-right">
              API URL
            </Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://example.com/api"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schema" className="text-right">
              Schema
            </Label>
            <Input
              id="schema"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="col-span-3"
              placeholder="schema"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Användarnamn
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              placeholder="användarnamn"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Lösenord
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right col-span-1">
              <Label htmlFor="remember" className="text-right">
                
              </Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Kom ihåg mig
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Spara</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
