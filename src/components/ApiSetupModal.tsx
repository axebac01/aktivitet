
import React, { useState } from 'react';
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
import { crmApi } from '@/services/crmApi';
import { toast } from '@/components/ui/sonner';

interface ApiSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApiSetupModal: React.FC<ApiSetupModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [apiUrl, setApiUrl] = useState(crmApi.getApiUrl() || '');
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!apiUrl.trim()) {
      toast.error("API URL cannot be empty");
      return;
    }

    setIsValidating(true);

    try {
      // Try to call the API to validate the URL
      const testUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      try {
        // Just a basic validation check
        const response = await fetch(`${testUrl}/activities`, { 
          method: 'HEAD',
          // Using no-cors mode as a fallback for CORS issues during validation
          mode: 'no-cors',
          // Timeout after 5 seconds
          signal: AbortSignal.timeout(5000)
        });
        
        // Note: With no-cors, we won't get an ok status, so we assume it's valid
        crmApi.setApiUrl(apiUrl);
        onOpenChange(false);
        toast.success("API URL successfully saved");
      } catch (error) {
        // For now we'll just warn but still save it
        // In a real app, you might want stricter validation
        console.warn("Could not validate API URL, saving anyway:", error);
        toast.warning("Could not validate API URL, but it has been saved");
        crmApi.setApiUrl(apiUrl);
        onOpenChange(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>CRM API Setup</DialogTitle>
          <DialogDescription>
            Enter your CRM API URL to connect to your system.
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
              placeholder="https://your-crm-api.example.com/api/v1"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isValidating}>
            {isValidating ? "Validating..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
