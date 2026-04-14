import { Elysia, t } from "elysia";
import { db } from "../db";
import { users, profiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { jwtPlugin } from "../middleware/jwt";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(jwtPlugin)
  .post(
    "/signup",
    async ({ body, jwt, cookie: { auth_session }, set }) => {
      const { email, password, displayName } = body;

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        set.status = 400;
        return { error: "Email already in use" };
      }

      // Hash password
      const passwordHash = await Bun.password.hash(password);

      // Create user
      const [newUser] = await db.insert(users).values({ email, passwordHash }).returning();

      // Create profile
      const [newProfile] = await db.insert(profiles).values({
        id: newUser.id,
        displayName: displayName || email.split("@")[0],
      }).returning();

      // Generate JWT
      const token = await jwt.sign({ sub: newUser.id, email: newUser.email });

      auth_session.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 days
        path: "/",
        sameSite: "lax",
      });

      return { user: { ...newUser, profile: newProfile } };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        displayName: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/signin",
    async ({ body, jwt, cookie: { auth_session }, set }) => {
      const { email, password } = body;

      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        set.status = 400;
        return { error: "Invalid email or password" };
      }

      const isMatch = await Bun.password.verify(password, user.passwordHash);
      if (!isMatch) {
        set.status = 400;
        return { error: "Invalid email or password" };
      }

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

      const token = await jwt.sign({ sub: user.id, email: user.email });

      auth_session.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 days
        path: "/",
        sameSite: "lax",
      });

      return { user: { ...user, profile } };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .post("/signout", ({ cookie: { auth_session } }) => {
    auth_session.set({
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });
    return { message: "Signed out successfully" };
  })
  .get("/me", async ({ jwt, cookie: { auth_session }, set }) => {
    const token = auth_session.value;
    if (!token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const payload = await jwt.verify(token as string);
    if (!payload || !payload.sub) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub as string));
    if (!user) {
      set.status = 401;
      return { error: "User not found" };
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

    return { user: { ...user, profile } };
  });
