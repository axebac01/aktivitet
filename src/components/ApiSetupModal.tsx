
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { crmApi } from "@/services/crmApi";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema
const formSchema = z.object({
  apiUrl: z.string().min(1, { message: "API URL måste anges" }),
  apiKey: z.string().min(1, { message: "API nyckel måste anges" }),
  rememberMe: z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ApiSetupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ApiSetupModal = ({ open, onOpenChange }: ApiSetupModalProps) => {
  const { toast } = useToast();
  
  // Initialize form with values from localStorage if they exist
  const savedCredentials = React.useMemo(() => {
    const rememberMe = localStorage.getItem("crm-remember-me") === "true";
    
    return {
      apiUrl: rememberMe ? localStorage.getItem("crm-api-url") || "" : "",
      apiKey: rememberMe ? localStorage.getItem("crm-api-key") || "" : "",
      rememberMe,
    };
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: savedCredentials,
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      // Save API settings to the API service using the correct method
      crmApi.setApiCredentials({
        apiUrl: values.apiUrl,
        username: "", // These fields are required by the ApiCredentials interface
        password: values.apiKey,
        schema: ""    // Using apiKey as password based on the implementation
      });
      
      // Save to localStorage if remember me is checked
      if (values.rememberMe) {
        localStorage.setItem("crm-api-url", values.apiUrl);
        localStorage.setItem("crm-api-key", values.apiKey);
        localStorage.setItem("crm-remember-me", "true");
      } else {
        // Clear localStorage if remember me is unchecked
        localStorage.removeItem("crm-api-url");
        localStorage.removeItem("crm-api-key");
        localStorage.removeItem("crm-remember-me");
      }
      
      toast({
        title: "API-inställningar sparade",
        description: "Dina API-inställningar har nu sparats",
      });
      
      // Close the modal
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte spara API-inställningar",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API-inställningar</DialogTitle>
          <DialogDescription>
            Ange API-uppgifter för att ansluta till CRM-systemet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com/v1" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL till API-tjänsten
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API nyckel</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="API nyckel" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nyckel för autentisering mot API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Kom ihåg mig</FormLabel>
                    <FormDescription>
                      Spara inloggningsuppgifter för nästa besök
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Spara</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
