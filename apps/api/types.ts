import type { DurableObjectRateLimiter } from "@hono-rate-limiter/cloudflare";

export type Env = {
  DATABASE_URL: string;
  HYPERDRIVE: Hyperdrive;
  EMAIL_LIMITER: {
    limit: (params: { key: string }) => Promise<{ success: boolean }>;
  };
  ENCRYPTED_TOKENS: KVNamespace;
  RATE_LIMITER: DurableObjectNamespace<DurableObjectRateLimiter>;
  AI: Ai
};
