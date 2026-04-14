import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { jwtPlugin } from "./middleware/jwt";
import { authRoutes } from "./routes/auth";
import { analyzePhotoRoutes } from "./routes/analyze-photo";

export const app = new Elysia()
  .onError(({ code, error, set }) => {
    console.error(`Elysia Error [${code}]:`, error);
    set.status = 500;
    return { error: error.message || error.toString() };
  })
  .use(
    cors({
      origin: true, // Allow all for now, can be restricted in prod
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(swagger())
  .use(jwtPlugin)
  .use(authRoutes)
  .use(analyzePhotoRoutes);

const port = process.env.PORT || 3000;
app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export default app;
