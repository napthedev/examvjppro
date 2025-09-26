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

export const createAttempt = mutation({
  args: {
    examId: v.id("exams"),
    score: v.number(),
    timeTaken: v.number(),
    answers: v.array(
      v.object({
        is_correct: v.boolean(),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify the exam belongs to the user
    const exam = await ctx.db.get(args.examId);
    if (!exam || exam.user_id !== userId) {
      throw new Error("Not authorized to access this exam");
    }

    const attemptId = await ctx.db.insert("attempts", {
      exam_id: args.examId,
      score: args.score,
      time_taken: args.timeTaken,
      attempt_date: Date.now(),
      answers: args.answers,
    });

    return attemptId;
  },
});

export const getAttemptsByExam = query({
  args: {
    examId: v.id("exams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify the exam belongs to the user
    const exam = await ctx.db.get(args.examId);
    if (!exam || exam.user_id !== userId) {
      throw new Error("Not authorized to access this exam");
    }

    return await ctx.db
      .query("attempts")
      .withIndex("byExamId", (q) => q.eq("exam_id", args.examId))
      .order("desc")
      .collect();
  },
});

export const getAttemptById = query({
  args: {
    attemptId: v.id("attempts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt) {
      throw new Error("Attempt not found");
    }

    // Verify the exam belongs to the user
    const exam = await ctx.db.get(attempt.exam_id);
    if (!exam || exam.user_id !== userId) {
      throw new Error("Not authorized to access this attempt");
    }

    return attempt;
  },
});

export const updateExamName = mutation({
  args: {
    examId: v.id("exams"),
    examName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify the exam belongs to the user
    const exam = await ctx.db.get(args.examId);
    if (!exam || exam.user_id !== userId) {
      throw new Error("Not authorized to update this exam");
    }

    // Validate exam name
    if (!args.examName.trim()) {
      throw new Error("Exam name cannot be empty");
    }

    await ctx.db.patch(args.examId, {
      exam_name: args.examName.trim(),
    });

    return { success: true };
  },
});
