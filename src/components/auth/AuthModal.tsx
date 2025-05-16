
import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { CrmUserSelector } from "./CrmUserSelector";

type AuthView = "login" | "register" | "crm-select";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const handleRegisterSuccess = (userId: string) => {
    setNewUserId(userId);
    setView("crm-select");
  };

  const handleLoginSuccess = () => {
    onOpenChange(false);
    // Reset views for next time
    setView("login");
    setNewUserId(null);
  };

  const handleCrmSelectComplete = () => {
    onOpenChange(false);
    // Reset views for next time
    setView("login");
    setNewUserId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/lovable-uploads/7385ba2a-9cf3-4fb7-a9b6-6884c2a9e544.png" 
            alt="CRMdata Logo" 
            className="h-10" 
          />
        </div>

        {view === "login" && (
          <LoginForm 
            onSuccess={handleLoginSuccess} 
            onRegisterClick={() => setView("register")} 
          />
        )}

        {view === "register" && (
          <RegisterForm 
            onSuccess={handleRegisterSuccess} 
            onLoginClick={() => setView("login")} 
          />
        )}

        {view === "crm-select" && newUserId && (
          <CrmUserSelector 
            userId={newUserId} 
            onComplete={handleCrmSelectComplete} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
