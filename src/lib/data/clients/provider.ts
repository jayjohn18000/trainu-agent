import { ClientDataProvider } from "./types";
import { HttpClientProvider } from "./http";

// Use HTTP provider to fetch real data from Supabase contacts table
export const clientProvider: ClientDataProvider = new HttpClientProvider();
