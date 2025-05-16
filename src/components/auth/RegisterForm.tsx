
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
import { UserPlus } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";

const formSchema = z.object({
  email: z.string().email("Giltig e-postadress krävs"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
  displayName: z.string().min(2, "Namnet måste vara minst 2 tecken")
});

interface RegisterFormProps {
  onSuccess: (userId: string) => void;
  onLoginClick: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const user = await authService.register(
        {
          email: values.email,
          password: values.password
        },
        values.displayName
      );
      toast.success("Registreringen lyckades!");
      onSuccess(user.id);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Registreringen misslyckades");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Skapa konto</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Fyll i dina uppgifter nedan för att skapa ett konto
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Namn</FormLabel>
                <FormControl>
                  <Input placeholder="Ditt namn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            className="w-full bg-crm-blue hover:bg-crm-blue/90" 
            disabled={isLoading}
          >
            {isLoading ? (
              "Registrerar..."
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Skapa konto
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Har du redan ett konto?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-crm-orange" 
            onClick={onLoginClick}
          >
            Logga in här
          </Button>
        </p>
      </div>
    </div>
  );
}
