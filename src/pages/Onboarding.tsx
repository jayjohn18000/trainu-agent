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
  const [provisioningProgress, setProvisioningProgress] = useState<string>('Initializing...');
  const [provisioningStep, setProvisioningStep] = useState<number>(0);

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
      const paymentSuccess = searchParams.get('payment') === 'success';

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
        } else if (paymentSuccess) {
          // User just completed payment and signed up - validate session then auto-trigger OAuth
          console.log('Payment successful, validating session before OAuth...');
          
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            console.log('Session valid, auto-triggering OAuth for new paid user');
            toast.info('Connecting to GoHighLevel...');
            setStep('oauth_required');
            
            setTimeout(() => {
              handleConnectGHL();
            }, 2000); // Increased from 1s to 2s for session stability
          } else {
            console.error('No valid session after payment, cannot auto-trigger OAuth');
            setError('Session expired. Please try connecting manually below.');
            setStep('oauth_required');
          }
        } else {
          // Need OAuth - show manual button
          setStep('oauth_required');
        }
      }
    };

    initOnboarding();
  }, [user, searchParams, navigate]);

  const checkProvisioningStatus = async () => {
    setStep('provisioning');
    setProvisioningProgress('Checking account status...');
    setProvisioningStep(1);
    
    try {
      // Check if already provisioned
      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('plan_tier, location')
        .eq('id', user!.id)
        .single();

      if (profile?.location) {
        // Already provisioned - redirect to app.trainu.us
        setProvisioningProgress('Account ready! Redirecting...');
        setProvisioningStep(5);
        setStep('complete');
        setTimeout(() => {
          window.location.href = 'https://app.trainu.us';
        }, 2000);
        return;
      }

      // Trigger provisioning
      setProvisioningProgress('Creating your GHL account...');
      setProvisioningStep(2);
      
      const userMeta = (user as any).user_metadata || {};
      const { data, error: provError } = await supabase.functions.invoke('ghl-provisioning', {
        body: {
          trainerId: user!.id,
          planTier: tier,
          trainer: {
            firstName: userMeta.first_name || 'Trainer',
            lastName: userMeta.last_name || '',
            email: user!.email!,
            phone: userMeta.phone || '',
          },
          business: {
            brandName: userMeta.business_name || `${userMeta.first_name || 'Trainer'}'s Training`,
            legalName: userMeta.business_name || `${userMeta.first_name || 'Trainer'}'s Training`,
            supportEmail: user!.email!,
          },
        },
      });

      if (provError) {
        console.error('Provisioning error:', provError);
        setError(`Provisioning failed: ${provError.message || 'Unknown error'}`);
        setStep('error');
        toast.error('Failed to provision your account');
        return;
      }

      // Poll for provisioning completion
      setProvisioningProgress('Setting up automations and workflows...');
      setProvisioningStep(3);
      
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      const pollInterval = setInterval(async () => {
        attempts++;
        
        const { data: ghlConfig } = await supabase
          .from('ghl_config')
          .select('provisioning_status, last_sync_error')
          .eq('trainer_id', user!.id)
          .single();

        if (ghlConfig?.provisioning_status === 'completed') {
          clearInterval(pollInterval);
          setProvisioningProgress('Configuration complete!');
          setProvisioningStep(5);
          setStep('complete');
          setTimeout(() => {
            window.location.href = 'https://app.trainu.us';
          }, 2000);
        } else if (ghlConfig?.provisioning_status === 'failed') {
          clearInterval(pollInterval);
          setError(`Provisioning failed: ${ghlConfig.last_sync_error || 'Unknown error'}`);
          setStep('error');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setError('Provisioning is taking longer than expected. Please contact support.');
          setStep('error');
        } else {
          // Update progress message based on status
          if (ghlConfig?.provisioning_status === 'creating_location') {
            setProvisioningProgress('Creating your workspace...');
            setProvisioningStep(2);
          } else if (ghlConfig?.provisioning_status === 'creating_user') {
            setProvisioningProgress('Setting up your admin account...');
            setProvisioningStep(3);
          } else if (ghlConfig?.provisioning_status === 'applying_snapshots') {
            setProvisioningProgress('Applying templates and automations...');
            setProvisioningStep(4);
          }
        }
      }, 1000);

    } catch (err) {
      console.error('Provisioning check error:', err);
      setError('Failed to check provisioning status. Please try again.');
      setStep('error');
    }
  };

  const handleConnectGHL = async () => {
    try {
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        toast.error('Please log in first');
        navigate('/login');
        return;
      }

      console.log('Session exists, initiating OAuth with tier:', tier);
      console.log('User ID:', user?.id);
      
      const { data, error } = await supabase.functions.invoke('ghl-oauth-init', {
        body: { tier },
      });

      console.log('OAuth init response:', { data, error });

      if (error) {
        console.error('OAuth init failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setError(`Failed to initialize OAuth: ${error.message || 'Unknown error'}`);
        setStep('error');
        toast.error(`Failed to initiate OAuth: ${error.message || 'Please try again'}`);
        return;
      }

      if (data?.authUrl) {
        console.log('Redirecting to GHL OAuth:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        console.error('Invalid OAuth response - no authUrl:', data);
        setError('Invalid OAuth response from server');
        setStep('error');
        toast.error('Invalid OAuth response');
      }
    } catch (err) {
      console.error('OAuth error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError('An unexpected error occurred while connecting to GoHighLevel');
      setStep('error');
      toast.error('Failed to connect to GoHighLevel');
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
              <h2 className="text-2xl font-bold">Connect Your GHL Account</h2>
              <p className="text-muted-foreground mb-4">
                We'll set up your white-labeled GHL instance at app.trainu.us
              </p>
              
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Instant Provisioning</p>
                    <p className="text-sm text-muted-foreground">
                      Sub-account created with pre-configured automations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Snapshots Applied</p>
                    <p className="text-sm text-muted-foreground">
                      Tags, pipelines, and calendars set up automatically
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">TrainU Access</p>
                    <p className="text-sm text-muted-foreground">
                      Access TrainU features via custom menu links in GHL
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={handleConnectGHL} size="lg" className="w-full">
                Connect GHL Account
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Need help? <a href="mailto:hello@trainu.us" className="text-primary hover:underline">Contact Support</a>
              </p>
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
              <p className="text-muted-foreground mb-6">
                {provisioningProgress}
              </p>
              
              {/* Progress indicator */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${provisioningStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {provisioningStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <span className={provisioningStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}>Initializing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${provisioningStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {provisioningStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                  </div>
                  <span className={provisioningStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}>Creating workspace</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${provisioningStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {provisioningStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                  </div>
                  <span className={provisioningStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}>Setting up admin account</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${provisioningStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {provisioningStep > 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                  </div>
                  <span className={provisioningStep >= 4 ? 'text-foreground' : 'text-muted-foreground'}>Applying templates & automations</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${provisioningStep >= 5 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {provisioningStep >= 5 ? <CheckCircle2 className="w-4 h-4" /> : '5'}
                  </div>
                  <span className={provisioningStep >= 5 ? 'text-foreground' : 'text-muted-foreground'}>Complete!</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This usually takes 30-60 seconds...
              </p>
            </>
          )}

          {step === 'complete' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
              <h2 className="text-2xl font-bold">Account Ready!</h2>
              <p className="text-muted-foreground mb-6">
                Redirecting you to your white-labeled GHL dashboard at app.trainu.us
              </p>
              <div className="space-y-2 text-sm text-muted-foreground text-left">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  OAuth connected
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Sub-account provisioned
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Snapshots applied
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Automations configured
                </p>
              </div>
            </>
          )}

          {step === 'error' && (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-destructive">Setup Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleConnectGHL} className="w-full">
                  Retry Connection
                </Button>
                <Button variant="outline" onClick={() => navigate('/today')} className="w-full">
                  Go to Dashboard
                </Button>
                <p className="text-xs text-muted-foreground">
                  Still having issues? <a href="mailto:hello@trainu.us" className="text-primary hover:underline">Contact Support</a>
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

