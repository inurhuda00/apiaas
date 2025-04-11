import { database } from '@hanssn/db'
import { users } from '@hanssn/db/schema'
import { Hono } from 'hono'
import type { Env } from '../types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
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

app.get('/seed', async (c) => {
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

export default app
