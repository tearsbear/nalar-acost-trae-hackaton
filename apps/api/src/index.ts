import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .use(cors())
  .use(swagger())
  .get("/health", () => ({ status: "ok" }))
  .listen(3001);

console.log(`Server running at http://${app.server?.hostname}:${app.server?.port}`);
