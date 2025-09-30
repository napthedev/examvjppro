"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenAI, Type } from "@google/genai";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { ActionCtx } from "./_generated/server";

// Type definitions for the question structure
export interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

// Define the JSON schema for structured output
const questionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.INTEGER,
        description: "Unique identifier for the question",
      },
      question: {
        type: Type.STRING,
        description: "The question text, can include LaTeX math notation",
      },
      options: {
        type: Type.OBJECT,
        properties: {
          A: {
            type: Type.STRING,
            description: "Option A text, can include LaTeX math notation",
          },
          B: {
            type: Type.STRING,
            description: "Option B text, can include LaTeX math notation",
          },
          C: {
            type: Type.STRING,
            description: "Option C text, can include LaTeX math notation",
          },
          D: {
            type: Type.STRING,
            description: "Option D text, can include LaTeX math notation",
          },
        },
        required: ["A", "B", "C", "D"],
        propertyOrdering: ["A", "B", "C", "D"],
      },
      correctAnswer: {
        type: Type.STRING,
        enum: ["A", "B", "C", "D"],
        description: "The correct answer option",
      },
      explanation: {
        type: Type.STRING,
        description:
          "Explanation for why the correct answer is right, can include LaTeX math notation",
      },
    },
    required: ["id", "question", "options", "correctAnswer", "explanation"],
    propertyOrdering: [
      "id",
      "question",
      "options",
      "correctAnswer",
      "explanation",
    ],
  },
};

// Helper function to validate and normalize question data
function validateAndNormalizeQuestions(data: any): Question[] {
  if (!Array.isArray(data)) {
    throw new Error("Response must be an array of questions");
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Question at index ${index} is not a valid object`);
    }

    const question: Question = {
      id: item.id || index + 1,
      question: item.question || "",
      options: {
        A: item.options?.A || "",
        B: item.options?.B || "",
        C: item.options?.C || "",
        D: item.options?.D || "",
      },
      correctAnswer: item.correctAnswer || "A",
      explanation: item.explanation || "",
    };

    // Validate required fields
    if (!question.question.trim()) {
      throw new Error(`Question at index ${index} has empty question text`);
    }

    if (!["A", "B", "C", "D"].includes(question.correctAnswer)) {
      throw new Error(
        `Question at index ${index} has invalid correctAnswer: ${question.correctAnswer}`
      );
    }

    return question;
  });
}

type GenerateQuestionsResult = {
  success: boolean;
  examId: string;
  fileName: string;
  fileSize: number;
  questionCount: number;
};

export const generateQuestions = action({
  args: {
    fileBuffer: v.bytes(),
    fileName: v.string(),
    fileSize: v.number(),
    settings: v.optional(
      v.object({
        numberOfQuestions: v.number(),
        difficulty: v.union(
          v.literal("easy"),
          v.literal("medium"),
          v.literal("hard"),
          v.literal("mixed")
        ),
        explanation: v.union(v.literal("brief"), v.literal("detailed")),
      })
    ),
  },
  handler: async (ctx: ActionCtx, args): Promise<GenerateQuestionsResult> => {
    // Check authentication
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("You must be signed in to generate questions.");
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Google AI API key not configured");
    }

    // Parse settings with defaults
    const settings = {
      numberOfQuestions: Math.min(
        Math.max(args.settings?.numberOfQuestions || 10, 1),
        20
      ),
      difficulty: args.settings?.difficulty || "mixed",
      explanation: args.settings?.explanation || "brief",
    };

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (args.fileSize > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    // Initialize Google AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });

    // Build difficulty instruction
    let difficultyInstruction = "";
    switch (settings.difficulty) {
      case "easy":
        difficultyInstruction =
          "Generate questions at an EASY difficulty level. Focus on basic concepts, definitions, and straightforward applications. Questions should test fundamental understanding and recall.";
        break;
      case "medium":
        difficultyInstruction =
          "Generate questions at a MEDIUM difficulty level. Include questions that require analysis, comparison, and application of concepts. Mix conceptual understanding with practical application.";
        break;
      case "hard":
        difficultyInstruction =
          "Generate questions at a HARD difficulty level. Create challenging questions that require critical thinking, synthesis of multiple concepts, complex problem-solving, and deep analysis.";
        break;
      case "mixed":
        difficultyInstruction =
          "Generate questions with MIXED difficulty levels, progressing from easy to hard. Start with basic recall questions, move to medium-level analysis questions, and end with challenging synthesis and application questions.";
        break;
    }

    // Build explanation instruction
    const explanationInstruction =
      settings.explanation === "detailed"
        ? "Include detailed, comprehensive explanations for the correct answer. Provide context, reasoning, and additional insights that help reinforce understanding. The explanation should be educational and thorough."
        : "Include brief, concise explanations for the correct answer. Keep explanations clear and to the point, focusing on the key reason why the answer is correct.";

    // Create the prompt for generating multiple choice questions
    const prompt = `
      Please analyze the content of this PDF document and generate exactly ${settings.numberOfQuestions} multiple choice questions based on the material. 
      
      DIFFICULTY REQUIREMENTS:
      ${difficultyInstruction}
      
      EXPLANATION REQUIREMENTS:
      ${explanationInstruction} The explanation shouldn't state any references to the original document.
      
      For each question:
      1. Create a clear, well-structured question appropriate for the specified difficulty level
      2. Provide 4 answer options (A, B, C, D)
      3. Indicate the correct answer
      4. Include an explanation following the detail level specified above
      5. If the content contains mathematical formulas, equations, or symbols, format them using LaTeX notation (enclosed in $ for inline math or $$ for display math)
      6. Make sure all text is properly formatted for JSON
      7. Generate exactly ${settings.numberOfQuestions} questions
      8. Follow the ${settings.difficulty} difficulty level requirement strictly
      9. Provide ${settings.explanation} explanations as specified
      10. Use proper LaTeX notation for all mathematical content
      11. Focus on creating meaningful questions that test understanding
      
      The response will be automatically formatted as JSON according to the specified schema.
      `;

    // Prepare the file data for Google AI
    const filePart = {
      inlineData: {
        data: Buffer.from(args.fileBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    };

    try {
      // Generate content using structured output
      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, filePart],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: questionsSchema,
        },
      });

      const text = result.text;

      if (!text) {
        throw new Error(
          "No response received from the AI model. Please try again."
        );
      }

      // Parse the JSON response directly
      let questions: Question[];
      try {
        const parsedData = JSON.parse(text);
        questions = validateAndNormalizeQuestions(parsedData);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text);
        console.error("Parse error:", parseError);
        throw new Error(
          "The AI had trouble processing your document. This might be due to poor document quality, unclear text, or unsupported PDF format. Please try again with a clearer PDF document."
        );
      }

      if (questions.length === 0) {
        throw new Error(
          "Your document doesn't contain enough readable content to generate questions. Please try a more detailed PDF with clear text."
        );
      }

      // Transform questions to Convex schema format
      const convexQuestions = questions.map((q) => ({
        question: q.question,
        answers: [q.options.A, q.options.B, q.options.C, q.options.D],
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
      }));

      // Derive exam name and description
      const examName = args.fileName.replace(/\.pdf$/i, "");
      const examDescription = `Generated from ${args.fileName} containing ${questions.length} questions`;

      try {
        // Persist exam using the createExam mutation
        const examId: string = await ctx.runMutation(api.exams.createExam, {
          examName,
          examDescription,
          questions: convexQuestions,
        });

        return {
          success: true,
          examId,
          fileName: args.fileName,
          fileSize: args.fileSize,
          questionCount: questions.length,
        };
      } catch (err) {
        console.error("Error saving exam to Convex:", err);

        // Handle unauthenticated or authorization issues
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("Not authenticated") || message.includes("401")) {
          throw new Error("You must be signed in to save exams.");
        }

        throw new Error("Failed to save the generated exam. Please try again.");
      }
    } catch (error) {
      console.error("Error generating questions:", error);

      // Provide more specific error messages based on the error type
      let errorMessage =
        "An unexpected error occurred while processing your document.";

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorMessage =
            "There's a configuration issue with our AI service. Please contact support.";
        } else if (
          error.message.includes("quota") ||
          error.message.includes("limit")
        ) {
          errorMessage =
            "Our AI service is currently experiencing high demand. Please try again in a few minutes.";
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "The request took too long to process. Please try with a smaller PDF or try again later.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network connection issue. Please check your internet connection and try again.";
        }
        // If it's one of our custom error messages, use it directly
        else if (
          error.message.includes("signed in") ||
          error.message.includes("API key not configured") ||
          error.message.includes("File size must be") ||
          error.message.includes("trouble processing") ||
          error.message.includes("doesn't contain enough") ||
          error.message.includes("save the generated exam")
        ) {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  },
});
