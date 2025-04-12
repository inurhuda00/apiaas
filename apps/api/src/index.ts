import { Hono } from "hono";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { cors } from "hono/cors";
import { rateLimiter } from "hono-rate-limiter";
import type { Env } from "../types";
import { users } from "@apiaas/db/schema";
import { database } from "@apiaas/db";
import { DurableObjectRateLimiter, DurableObjectStore } from "@hono-rate-limiter/cloudflare";

const app = new Hono<{ Bindings: Env }>();

// Add all middleware and routes
app.use("*", timing());
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://apiaas.ai",
      "https://*.apiaas.ai",
      "https://*.apiaas.com",
      "https://apiaas.com",
    ],
    allowHeaders: ["*"],
    allowMethods: ["*"],
    credentials: true,
    exposeHeaders: ["*"],
  })
);

// Add rate limiting middleware
app.use("/v1/*", (c, next) => {
  return rateLimiter({
    windowMs: 60000, // 1 minute
    limit: 60,// 60 requests per minute
    keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
    store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
  })(c as any, next)
});

app.get('/v1', async (c) => {
  const db = database(c.env.HYPERDRIVE.connectionString)

  const users = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    }
  })

  return c.json({
    data: users
  })
})

app.get('/v1/seed', async (c) => {
  console.log("Starting seed process...");

  const db = database(c.env.HYPERDRIVE.connectionString);

  const email = "admin@mail.com";
  const password = "password";
  const passwordHash = password;

  const [admin] = await db
    .insert(users)
    .values([
      {
        name: "Admin User",
        email: email,
        password: passwordHash,
        role: "admin",
      },
    ])
    .onConflictDoUpdate({
      target: users.email, set: {
        name: "Admin User",
        password: passwordHash,
        role: "admin",
      }
    }).returning();

  return c.json({
    data: {
      name: admin.name,
      email: admin.email
    }
  }, 201)
})

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default {
  fetch: app.fetch,
};
export { DurableObjectRateLimiter };

export type AppType = typeof app;