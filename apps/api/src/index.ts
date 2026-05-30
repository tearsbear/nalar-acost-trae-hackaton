import "dotenv/config";
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { node } from "@elysia/node";
// import { createClient } from "@supabase/supabase-js";
import { db, schema } from "./db";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, createHash } from "crypto";
import { eq } from "drizzle-orm";

// Initialize Supabase client (TODO: use this for auth)
// const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//   throw new Error("Missing Supabase environment variables");
// }

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function generateApiKey(): { key: string; hash: string } {
  const key = `ack_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, hash };
}

// Authentication middleware - temporary mock for now
const authMiddleware = new Elysia()
  .derive(async () => {
    // Mock user for now
    return { user: { id: "test-user-id", email: "test@example.com" } };
  });

const app = new Elysia({ adapter: node() })
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: "AI Cost Intelligence API",
        version: "1.0.0",
        description: "API for AI Cost Intelligence platform"
      },
      tags: [
        { name: "health", description: "Health check endpoints" },
        { name: "auth", description: "Authentication endpoints" },
        { name: "api-keys", description: "API key management" },
        { name: "workspaces", description: "Workspace management" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    }
  }))
  .get("/health", () => ({ status: "ok" }), {
    tags: ["health"],
    detail: {
      summary: "Health check endpoint",
      description: "Returns the health status of the API"
    }
  })

  // Authentication endpoints
  .group("/auth", (app) =>
    app
      // Sign up
      .post(
        "/signup",
        async ({ body }) => {
          // TODO: Implement real Supabase sign up
          const id = uuidv4();

          await db.insert(schema.users).values({
            id,
            email: body.email,
            name: body.name,
            createdAt: new Date()
          });

          return {
            message: "Signup successful",
            user: { id, email: body.email, name: body.name }
          };
        },
        {
          tags: ["auth"],
          detail: {
            summary: "Sign up a new user",
            description: "Creates a new user account using email and password"
          },
          body: t.Object({
            email: t.String({ format: "email", description: "User's email address" }),
            password: t.String({ minLength: 6, description: "User's password (min 6 characters)" }),
            name: t.Optional(t.String({ description: "User's full name" }))
          })
        }
      )
      // Login
      .post(
        "/login",
        async ({ body }) => {
          // TODO: Implement real Supabase login
          return {
            message: "Login successful",
            user: { email: body.email },
            session: { access_token: "mock-token" }
          };
        },
        {
          tags: ["auth"],
          detail: {
            summary: "Login a user",
            description: "Authenticates a user with email and password and returns a session"
          },
          body: t.Object({
            email: t.String({ format: "email", description: "User's email address" }),
            password: t.String({ description: "User's password" })
          })
        }
      )
  )

  // Protected API Key Management Routes
  .use(authMiddleware)
  .group("/api-keys", (app) =>
    app
      // Get all API keys for a workspace
      .get(
        "/",
        async () => {
          // TODO: For now, let's create a default workspace if it doesn't exist
          // In a real app, you'd have multiple workspaces per user
          let workspaces = await db.select().from(schema.workspaces).limit(1);

          if (workspaces.length === 0) {
            const workspaceId = uuidv4();
            await db.insert(schema.workspaces).values({
              id: workspaceId,
              name: "Default Workspace",
              slug: "default-workspace-" + workspaceId.slice(0, 8),
            });

            workspaces = await db.select().from(schema.workspaces).limit(1);
          }

          const workspace = workspaces[0];

          if (!workspace) {
            throw new Error("Failed to get or create workspace");
          }

          const keys = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.workspaceId, workspace.id));
          return keys.map(k => ({ id: k.id, name: k.name, lastUsedAt: k.lastUsedAt, createdAt: k.createdAt }));
        },
        {
          tags: ["api-keys"],
          detail: {
            summary: "List API keys",
            description: "Get all API keys for the current user's workspace (no plaintext keys returned)",
            security: [{ bearerAuth: [] }]
          }
        }
      )

      // Create a new API key
      .post(
        "/",
        async ({ body }) => {
          let workspaces = await db.select().from(schema.workspaces).limit(1);

          if (workspaces.length === 0) {
            const workspaceId = uuidv4();
            await db.insert(schema.workspaces).values({
              id: workspaceId,
              name: "Default Workspace",
              slug: "default-workspace-" + workspaceId.slice(0, 8),
            });

            workspaces = await db.select().from(schema.workspaces).limit(1);
          }

          const workspace = workspaces[0];

          if (!workspace) {
            throw new Error("Failed to get or create workspace");
          }

          const { key, hash } = generateApiKey();
          const id = uuidv4();

          await db.insert(schema.apiKeys).values({
            id,
            workspaceId: workspace.id,
            name: body.name,
            keyHash: hash,
          });

          const [createdKey] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, id));

          if (!createdKey) {
            throw new Error("Failed to create API key");
          }

          return {
            id: createdKey.id,
            name: createdKey.name,
            key: key, // Only return the plaintext key once
            createdAt: createdKey.createdAt,
          };
        },
        {
          tags: ["api-keys"],
          detail: {
            summary: "Create API key",
            description: "Create a new API key. The plaintext key is returned only once.",
            security: [{ bearerAuth: [] }]
          },
          body: t.Object({
            name: t.String({ description: "Name for the API key" }),
          })
        }
      )

      // Revoke an API key
      .delete(
        "/:id",
        async ({ params }) => {
          await db
            .delete(schema.apiKeys)
            .where(eq(schema.apiKeys.id, params.id));

          return { success: true };
        },
        {
          tags: ["api-keys"],
          detail: {
            summary: "Revoke API key",
            description: "Revoke (delete) an existing API key",
            security: [{ bearerAuth: [] }]
          },
          params: t.Object({
            id: t.String({ description: "ID of the API key to revoke" }),
          })
        }
      )
  )

  // Protected Workspace Routes
  .group("/workspaces", (app) =>
    app
      .use(authMiddleware)
      // Create a workspace
      .post(
        "/",
        async ({ body }) => {
          const id = uuidv4();
          const slug = body.name.toLowerCase().replace(/\s+/g, "-") + "-" + id.slice(0, 8);

          await db.insert(schema.workspaces).values({
            id,
            name: body.name,
            slug,
          });

          // Add workspace member entry for current user (mock)
          await db.insert(schema.workspaceMembers).values({
            id: uuidv4(),
            userId: "test-user-id",
            workspaceId: id,
            role: "owner"
          });

          const [workspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, id));

          if (!workspace) {
            throw new Error("Failed to create workspace");
          }

          return workspace;
        },
        {
          tags: ["workspaces"],
          detail: {
            summary: "Create workspace",
            description: "Create a new workspace and assign the current user as owner",
            security: [{ bearerAuth: [] }]
          },
          body: t.Object({
            name: t.String({ description: "Name of the workspace" }),
          })
        }
      )
      // Get all workspaces for user
      .get(
        "/",
        async () => {
          const memberRecords = await db
            .select()
            .from(schema.workspaceMembers)
            .where(eq(schema.workspaceMembers.userId, "test-user-id"));

          const workspaceIds = memberRecords.map(m => m.workspaceId);

          if (workspaceIds.length === 0) return [];

          // For now, just get the first one - fix this later
          const workspaces = await db
            .select()
            .from(schema.workspaces);

          return workspaces;
        },
        {
          tags: ["workspaces"],
          detail: {
            summary: "List workspaces",
            description: "Get all workspaces that the current user is a member of",
            security: [{ bearerAuth: [] }]
          }
        }
      )
  );

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/swagger`);
});

export default app;
