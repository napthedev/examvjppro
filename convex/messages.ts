import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.insert("messages", { body: args.body, userId: user._id });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => {
        // For each message, fetch the User who wrote it and
        // insert their name into the author field.
        const user = await ctx.db.get(message.userId);
        return {
          author: user?.name ?? "Anonymous",
          ...message,
        };
      })
    );
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});
