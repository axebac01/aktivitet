
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { crmApi } from "@/services/crmApi";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

interface CrmUserSelectorProps {
  userId: string;
  onComplete: () => void;
}

interface CrmUserOption {
  id: string;
  name: string;
}

export function CrmUserSelector({ userId, onComplete }: CrmUserSelectorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [crmUsers, setCrmUsers] = useState<CrmUserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    async function fetchCrmUsers() {
      try {
        // Get the users from CRM API
        const apiCredentials = crmApi.getCredentials();
        
        if (!apiCredentials) {
          toast.error("API-inloggningsuppgifter saknas");
          setCrmUsers([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch users from the API
        const usersResponse = await crmApi.fetchUsers();
        
        // Map the response to CrmUserOption format
        const userOptions = usersResponse.map(user => {
          // Use firstname/lastname OR Fname/Lname fields depending on what's available
          const firstName = user.firstname || user.Fname || '';
          const lastName = user.lastname || user.Lname || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          return {
            id: user.userid || '',
            name: fullName || user.userid || 'Okänd användare'
          };
        });
        
        setCrmUsers(userOptions);
      } catch (error) {
        console.error("Failed to fetch CRM users:", error);
        toast.error("Kunde inte hämta CRM-användare");
        setCrmUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCrmUsers();
  }, []);

  const handleSave = async () => {
    if (!selectedUserId) {
      toast.error("Välj en CRM-användare");
      return;
    }

    setIsSaving(true);
    try {
      const selectedUser = crmUsers.find(user => user.id === selectedUserId);
      if (selectedUser) {
        const updatedUser = authService.updateUserCrmInfo(
          userId,
          selectedUser.id,
          selectedUser.name
        );
        
        if (updatedUser) {
          toast.success("CRM-användare har kopplats till ditt konto");
          onComplete();
        } else {
          toast.error("Kunde inte uppdatera användaren");
        }
      }
    } catch (error) {
      console.error("Failed to save CRM user selection:", error);
      toast.error("Kunde inte spara CRM-användarval");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-pulse-subtle h-8 w-32 bg-gray-200 rounded mx-auto"></div>
          <div className="animate-pulse-subtle h-24 w-48 bg-gray-200 rounded mx-auto"></div>
          <div className="animate-pulse-subtle h-10 w-32 bg-gray-200 rounded mx-auto"></div>
          <p className="text-sm text-gray-500">Hämtar CRM-användare...</p>
        </div>
      </div>
    );
  }

  if (crmUsers.length === 0) {
    return (
      <div className="text-center p-8 space-y-4">
        <h3 className="text-lg font-medium">Inga CRM-användare hittades</h3>
        <p className="text-sm text-gray-500">
          Kontrollera dina API-inställningar och försök igen
        </p>
        <Button onClick={onComplete} variant="outline">
          Fortsätt utan CRM-koppling
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Välj CRM-användare</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Välj vilken CRM-användare du vill koppla till ditt konto
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            CRM-användare
          </label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Välj användare" />
            </SelectTrigger>
            <SelectContent>
              {crmUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onComplete()}
          >
            Hoppa över
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !selectedUserId}
            className="bg-crm-blue hover:bg-crm-blue/90"
          >
            {isSaving ? "Sparar..." : (
              <>
                <Check className="mr-2 h-4 w-4" /> Spara val
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
