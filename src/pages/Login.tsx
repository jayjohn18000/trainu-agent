import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, "You must accept the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID;
const GHL_REDIRECT_URI = import.meta.env.VITE_GHL_REDIRECT_URI;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier') || 'starter';
  const paymentSuccess = searchParams.get('payment') === 'success';
  const { user, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false },
  });

  useEffect(() => {
    // Check if already authenticated
    if (user) {
      navigate('/today', { replace: true });
    }
  }, [user, navigate]);

  const onSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Invalid credentials");
        return;
      }

      if (authData.session) {
        await initialize();
        toast.success("Welcome back!");
        navigate('/today', { replace: true });
      }
    } catch (error) {
      toast.error("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            first_name: data.name.split(' ')[0] || data.name,
            last_name: data.name.split(' ').slice(1).join(' ') || '',
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (authData.session) {
        await initialize();
        toast.success("Account created successfully!");
        // Redirect to onboarding with tier to complete GHL setup
        navigate(`/onboarding?tier=${tier}${paymentSuccess ? '&payment=success' : ''}`, { replace: true });
      } else if (authData.user) {
        // If no session (email confirmation required), show message and poll for session
        toast.info("Account created! Please check your email to verify. You'll be automatically logged in after verification.");
        
        // Poll for session every 2 seconds
        const checkSession = setInterval(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            clearInterval(checkSession);
            await initialize();
            toast.success("Email verified! Redirecting...");
            navigate(`/onboarding?tier=${tier}${paymentSuccess ? '&payment=success' : ''}`, { replace: true });
          }
        }, 2000);
        
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(checkSession), 300000);
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  // GHL OAuth should be handled through the onboarding flow, not directly from login
  // This button is kept for reference but should redirect to onboarding
  const handleGHLLogin = () => {
    if (!user) {
      toast.error("Please sign up or sign in first");
      return;
    }
    // Redirect to onboarding where proper OAuth flow is handled
    navigate('/onboarding');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to TrainU Intelligence</CardTitle>
          <CardDescription>
            Sign in or create an account to access AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentSuccess && (
            <div className="mb-4 p-4 bg-success text-success-foreground border border-success rounded-lg">
              <p className="font-medium text-center">Payment successful! 🎉</p>
              <p className="text-sm text-center mt-1 opacity-90">
                Create your account to get started with your <strong className="capitalize">{tier}</strong> plan
              </p>
            </div>
          )}
          {tier && !paymentSuccess && (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-center">
                Starting your <strong className="capitalize">{tier}</strong> plan setup
              </p>
            </div>
          )}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="trainer@example.com"
                    {...signInForm.register("email")}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      {...signInForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </Button>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    {...signUpForm.register("name")}
                  />
                  {signUpForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="trainer@example.com"
                    {...signUpForm.register("email")}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      {...signUpForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min 8 characters, 1 number, 1 special character
                  </p>
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      {...signUpForm.register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={signUpForm.watch("terms")}
                    onCheckedChange={(checked) => signUpForm.setValue("terms", checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to the{" "}
                    <a href="https://trainu.us/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="https://trainu.us/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {signUpForm.formState.errors.terms && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.terms.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={handleGHLLogin}
            variant="outline"
            className="w-full"
            disabled={!GHL_CLIENT_ID}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            {GHL_CLIENT_ID ? "GoHighLevel (Coming Soon)" : "GoHighLevel (Not Configured)"}
          </Button>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI-powered client risk analysis</li>
              <li>• Automated message drafting</li>
              <li>• Real-time analytics and insights</li>
              <li>• Seamless integrations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
