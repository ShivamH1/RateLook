import { Elysia } from "elysia";
import { jwtPlugin } from "./jwt";

export const authPlugin = new Elysia()
  .use(jwtPlugin)
  .derive(async ({ jwt, cookie: { auth_session } }) => {
    const token = auth_session.value;
    console.log(`Auth Middleware - Checking cookie 'auth_session':`, token ? "Found" : "NOT FOUND");
    
    if (!token) return { userId: null };
    
    try {
      const payload = await jwt.verify(token);
      console.log("Auth Middleware - Payload:", payload);
      
      if (!payload || !payload.sub) {
        console.log("Auth Middleware - Verification failed or sub missing");
        return { userId: null };
      }
      
      return { userId: payload.sub as string };
    } catch (err) {
      console.error("Auth Middleware - Verification Error:", err);
      return { userId: null };
    }
  });
