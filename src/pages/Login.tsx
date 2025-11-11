import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID;
const GHL_REDIRECT_URI = import.meta.env.VITE_GHL_REDIRECT_URI;

export default function Login() {
  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        window.location.href = '/today';
      }
    };
    checkAuth();
  }, []);

  const handleGHLLogin = () => {
    if (!GHL_CLIENT_ID || !GHL_REDIRECT_URI) {
      console.error('GHL OAuth not configured');
      return;
    }

    const authUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', GHL_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GHL_REDIRECT_URI);
    authUrl.searchParams.set('scope', 'contacts.readonly calendars.readonly locations.readonly users.readonly');

    window.location.href = authUrl.toString();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to TrainU Intelligence</CardTitle>
          <CardDescription>
            Sign in with your GoHighLevel account to access AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleGHLLogin}
              className="w-full h-12 text-base"
              size="lg"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
              Sign in with GoHighLevel
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Secure OAuth Authentication
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have a GoHighLevel account?
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('https://trainu.us', '_blank')}
                className="w-full"
              >
                Sign up at trainu.us
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• AI-powered client risk analysis</li>
              <li>• Automated message drafting</li>
              <li>• Real-time analytics and insights</li>
              <li>• Seamless GHL integration</li>
            </ul>
          </div>

          {!GHL_CLIENT_ID && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>GHL OAuth is being configured. Please contact support if this persists.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
