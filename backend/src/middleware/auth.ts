import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "default-secret",
    })
  )
  .derive(async ({ jwt, cookie: { auth_session } }) => {
    const token = auth_session.value;
    if (!token) return { userId: null };
    
    const payload = await jwt.verify(token);
    if (!payload || !payload.sub) return { userId: null };
    
    return { userId: payload.sub as string };
  });
