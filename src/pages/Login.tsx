import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email format").max(255, "Email too long"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input with Zod
      const validation = authSchema.safeParse({ email: email.trim(), password });
      if (!validation.success) {
        const firstError = validation.error.errors[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email: validation.data.email, 
          password: validation.data.password 
        });
        if (error) throw error;
        toast.success("Account created! Logging you in...");
        navigate("/today");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: validation.data.email, 
          password: validation.data.password 
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/today");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up to start using TrainU" : "Log in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {isSignUp && password.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be 8+ characters with uppercase, lowercase, and number
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
