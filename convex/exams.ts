import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getExamsByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("exams")
      .withIndex("byUserId", (q) => q.eq("user_id", userId))
      .order("desc")
      .collect();
  },
});

export const getExamsByUserWithLimit = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const limit = args.limit || 10;
    return await ctx.db
      .query("exams")
      .withIndex("byUserId", (q) => q.eq("user_id", userId))
      .order("desc")
      .take(limit);
  },
});
