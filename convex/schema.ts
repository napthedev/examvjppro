import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // this is the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byExternalId", ["externalId"]),

  exams: defineTable({
    teacher_id: v.string(), // Must be linked to a user id
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
    .index("byTeacherId", ["teacher_id"])
    .index("byCreationDate", ["creation_date"]),
});
