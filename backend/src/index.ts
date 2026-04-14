import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwtPlugin } from "./middleware/jwt";
import { authRoutes } from "./routes/auth";
import { analyzePhotoRoutes } from "./routes/analyze-photo";

const app = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`Elysia Error [${code}]:`, error);
    set.status = 500;
    return { error: error.message || error.toString() };
  })
  .use(
    cors({
      origin: ["http://localhost:8080"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(swagger())
  .use(jwtPlugin)
  .use(authRoutes)
  .use(analyzePhotoRoutes)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
