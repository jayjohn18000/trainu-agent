import { ClientDataProvider } from "./types";
import { MockClientProvider } from "./mock";
import { HttpClientProvider } from "./http";

const providerType = import.meta.env.VITE_DATA_PROVIDER || "mock";

export const clientProvider: ClientDataProvider =
  providerType === "http" ? new HttpClientProvider() : new MockClientProvider();
