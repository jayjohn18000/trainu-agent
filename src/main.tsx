import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { QueryErrorBoundary } from "@/components/system/QueryErrorBoundary";
import { QueryProvider } from "@/providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import posthog from 'posthog-js';
import * as Sentry from "@sentry/react";

// Initialize PostHog (optional - requires API key)
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    person_profiles: 'identified_only',
  });
}

// Initialize Sentry (optional - requires DSN)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <TooltipProvider>
          <QueryErrorBoundary>
            <App />
          </QueryErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);
