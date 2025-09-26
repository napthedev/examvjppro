import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
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

export const getExamById = query({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const exam = await ctx.db.get(args.examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Check if the exam belongs to the authenticated user
    if (exam.user_id !== userId) {
      throw new Error("Not authorized to access this exam");
    }

    return exam;
  },
});

export const createExam = mutation({
  args: {
    examName: v.string(),
    examDescription: v.optional(v.string()),
    questions: v.array(
      v.object({
        question: v.string(),
        answers: v.array(v.string()),
        correct_answer: v.string(),
        explanation: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const examId = await ctx.db.insert("exams", {
      user_id: userId,
      creation_date: new Date().toISOString(),
      exam_name: args.examName,
      exam_description: args.examDescription,
      question_data: args.questions,
    });

    return examId;
  },
});
