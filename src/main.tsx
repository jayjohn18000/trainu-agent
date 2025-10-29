import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { QueryErrorBoundary } from "@/components/system/QueryErrorBoundary";
import { QueryProvider } from "@/providers/QueryProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <QueryErrorBoundary>
          <App />
        </QueryErrorBoundary>
        <Toaster />
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>
);
