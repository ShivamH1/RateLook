import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { authRoutes } from "./routes/auth";
import { analysesRoutes } from "./routes/analyses";
import { analyzePhotoRoutes } from "./routes/analyze-photo";

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:5173", // Assuming Vite default
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(swagger())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default-secret",
    }),
  )
  .use(authRoutes)
  .use(analysesRoutes)
  .use(analyzePhotoRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
