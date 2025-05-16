
import { useState } from "react";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LogIn } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";

const formSchema = z.object({
  email: z.string().email("Giltig e-postadress krävs"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken")
});

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await authService.login({
        email: values.email,
        password: values.password
      });
      toast.success("Inloggningen lyckades!");
      onSuccess();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Inloggningen misslyckades");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Logga in</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Ange dina uppgifter nedan för att logga in
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post</FormLabel>
                <FormControl>
                  <Input placeholder="namn@företag.se" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lösenord</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-crm-orange hover:bg-crm-orange/90" 
            disabled={isLoading}
          >
            {isLoading ? (
              "Loggar in..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" /> Logga in
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Inget konto?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-crm-blue" 
            onClick={onRegisterClick}
          >
            Registrera dig här
          </Button>
        </p>
      </div>
    </div>
  );
}
