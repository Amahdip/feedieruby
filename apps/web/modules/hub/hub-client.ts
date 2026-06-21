import "server-only";
import SalamRubyHub from "@salamruby/hub";
import { env } from "@/lib/env";

const globalForHub = globalThis as unknown as {
  salamrubyHubClient: SalamRubyHub | undefined;
};

/**
 * Returns a shared SalamRuby Hub API client when HUB_API_KEY is set.
 * Uses a global singleton so the same instance is reused across the process
 * (and across Next.js HMR in development). When the key is not set, returns
 * null and does not cache that result so a later call with the key set
 * can create the client.
 */
export const getHubClient = (): SalamRubyHub | null => {
  if (globalForHub.salamrubyHubClient) {
    return globalForHub.salamrubyHubClient;
  }
  const apiKey = env.HUB_API_KEY;
  if (!apiKey) return null;
  const client = new SalamRubyHub({ apiKey, baseURL: env.HUB_API_URL });
  globalForHub.salamrubyHubClient = client;
  return client;
};
