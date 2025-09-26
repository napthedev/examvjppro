import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Extend the users table with custom fields while keeping auth functionality
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
  }).index("email", ["email"]),

  exams: defineTable({
    user_id: v.id("users"), // Must be linked to a user id
    creation_date: v.string(), // ISO 8601 timestamp
    exam_name: v.string(), // Name of the exam
    exam_description: v.optional(v.string()), // Optional description of the exam
    question_data: v.array(
      v.object({
        question: v.string(), // Question text, may contain LaTeX math expressions
        answers: v.array(v.string()), // Array of possible answers (typically 4 options)
        correct_answer: v.string(), // Letter identifier for correct answer (A, B, C, or D)
        explanation: v.string(), // Detailed explanation, may contain LaTeX math expressions
      })
    ),
  })
    .index("byUserId", ["user_id"])
    .index("byCreationDate", ["creation_date"]),
});
