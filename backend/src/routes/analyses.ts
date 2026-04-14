import { Elysia, t } from "elysia";
import { db } from "../db";
import { analyses } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authPlugin } from "../middleware/auth";

export const analysesRoutes = new Elysia({ prefix: "/api/analyses" })
  .use(authPlugin)
  .get("/", async ({ userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const userAnalyses = await db
      .select()
      .from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));

    return userAnalyses;
  })
  .delete("/:id", async ({ params: { id }, userId, set }) => {
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const [deleted] = await db
      .delete(analyses)
      .where(and(eq(analyses.id, id), eq(analyses.userId, userId)))
      .returning();

    if (!deleted) {
      set.status = 404;
      return { error: "Analysis not found or unauthorized" };
    }

    return { message: "Analysis deleted" };
  });
