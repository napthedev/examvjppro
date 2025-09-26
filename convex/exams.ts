import { v } from "convex/values";
import { query } from "./_generated/server";

export const getExamsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exams")
      .withIndex("byUserId", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .collect();
  },
});

export const getExamsByUserWithLimit = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("exams")
      .withIndex("byUserId", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .take(limit);
  },
});
