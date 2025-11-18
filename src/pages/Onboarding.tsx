import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type OnboardingStep = 'loading' | 'oauth_required' | 'oauth_success' | 'provisioning' | 'complete' | 'error';

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [step, setStep] = useState<OnboardingStep>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<string>('starter');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const initOnboarding = async () => {
      // Check for OAuth callback parameters
      const oauthSuccess = searchParams.get('oauth');
      const oauthError = searchParams.get('error');
      const tierParam = searchParams.get('tier');

      if (tierParam) {
        setTier(tierParam);
      }

      if (oauthError) {
        setError(getErrorMessage(oauthError));
        setStep('error');
        return;
      }

      if (oauthSuccess === 'success') {
        // OAuth successful, check if we need to provision
        await checkProvisioningStatus();
      } else {
        // Check if OAuth is already done
        const { data: ghlConfig } = await supabase
          .from('ghl_config')
          .select('location_id, access_token')
          .eq('trainer_id', user.id)
          .single();

        if (ghlConfig?.access_token) {
          // Has OAuth tokens, check provisioning
          await checkProvisioningStatus();
        } else {
          // Need OAuth
          setStep('oauth_required');
        }
      }
    };

    initOnboarding();
  }, [user, searchParams, navigate]);

  const checkProvisioningStatus = async () => {
    setStep('provisioning');
    
    try {
      // Check if already provisioned
      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('plan_tier, location')
        .eq('id', user!.id)
        .single();

      if (profile?.location) {
        // Already provisioned
        setStep('complete');
        setTimeout(() => navigate('/today'), 2000);
        return;
      }

      // Trigger provisioning
      const { data, error: provError } = await supabase.functions.invoke('ghl-provisioning', {
        body: {
          trainerId: user!.id,
          planTier: tier,
          trainer: {
            firstName: user!.user_metadata?.first_name || 'Trainer',
            lastName: user!.user_metadata?.last_name || '',
            email: user!.email!,
            phone: user!.user_metadata?.phone || '',
          },
          business: {
            brandName: `${user!.user_metadata?.first_name || 'Trainer'}'s Training`,
            legalName: `${user!.user_metadata?.first_name || 'Trainer'}'s Training`,
            supportEmail: user!.email!,
          },
        },
      });

      if (provError) {
        console.error('Provisioning error:', provError);
        setError('Failed to provision your account. Please contact support.');
        setStep('error');
        return;
      }

      console.log('Provisioning successful:', data);
      toast.success('Account provisioned successfully!');
      setStep('complete');
      setTimeout(() => navigate('/today'), 2000);
    } catch (err) {
      console.error('Provisioning error:', err);
      setError('An unexpected error occurred. Please contact support.');
      setStep('error');
    }
  };

  const handleConnectGHL = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ghl-oauth-init', {
        body: { tier },
      });

      if (error) {
        toast.error('Failed to initiate OAuth');
        console.error('OAuth init error:', error);
        return;
      }

      if (data?.authUrl) {
        // Redirect to GHL OAuth
        window.location.href = data.authUrl;
      } else {
        toast.error('Invalid OAuth response');
      }
    } catch (err) {
      toast.error('Failed to connect to GoHighLevel');
      console.error('OAuth error:', err);
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      'oauth_declined': 'You declined the authorization. Please try again to continue.',
      'invalid_callback': 'Invalid OAuth callback. Please try again.',
      'invalid_state': 'Invalid OAuth state. Please try again.',
      'token_exchange_failed': 'Failed to exchange authorization code. Please try again.',
      'incomplete_token_data': 'Incomplete authorization data. Please try again.',
      'storage_failed': 'Failed to store authorization. Please contact support.',
      'server_error': 'Server error occurred. Please try again.',
    };
    return messages[errorCode] || 'An error occurred during setup.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="text-center space-y-6">
          {step === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Setting up your account...</h2>
            </>
          )}

          {step === 'oauth_required' && (
            <>
              <ExternalLink className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Connect GoHighLevel</h2>
              <p className="text-muted-foreground">
                To complete your setup, we need to connect your GoHighLevel location.
                This allows TrainU to manage your clients, messages, and automations.
              </p>
              <Button onClick={handleConnectGHL} size="lg" className="w-full">
                Connect GoHighLevel
              </Button>
            </>
          )}

          {step === 'oauth_success' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
              <h2 className="text-2xl font-bold">Connected Successfully!</h2>
              <p className="text-muted-foreground">
                GoHighLevel is now connected. Setting up your account...
              </p>
            </>
          )}

          {step === 'provisioning' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Provisioning Your Account</h2>
              <p className="text-muted-foreground">
                We're setting up your CRM, workflows, and automations. This may take a minute...
              </p>
            </>
          )}

          {step === 'complete' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
              <h2 className="text-2xl font-bold">All Set!</h2>
              <p className="text-muted-foreground">
                Your account is ready. Redirecting to dashboard...
              </p>
            </>
          )}

          {step === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-2xl font-bold">Setup Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => setStep('oauth_required')} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/support')} className="w-full">
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

