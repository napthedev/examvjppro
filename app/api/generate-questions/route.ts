import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

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

// Initialize Google AI
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY!,
});

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

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const settingsString = formData.get("settings") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Parse settings with defaults
    type DifficultyType = "easy" | "medium" | "hard" | "mixed";
    type ExplanationType = "brief" | "detailed";

    let settings: {
      numberOfQuestions: number;
      difficulty: DifficultyType;
      explanation: ExplanationType;
    } = {
      numberOfQuestions: 10,
      difficulty: "mixed",
      explanation: "brief",
    };

    if (settingsString) {
      try {
        const parsedSettings = JSON.parse(settingsString);
        settings = {
          numberOfQuestions: Math.min(
            Math.max(parseInt(parsedSettings.numberOfQuestions) || 10, 1),
            20
          ),
          difficulty: (["easy", "medium", "hard", "mixed"].includes(
            parsedSettings.difficulty
          )
            ? parsedSettings.difficulty
            : "mixed") as DifficultyType,
          explanation: (["brief", "detailed"].includes(
            parsedSettings.explanation
          )
            ? parsedSettings.explanation
            : "brief") as ExplanationType,
        };
      } catch (error) {
        console.error("Error parsing settings:", error);
        // Continue with default settings
      }
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
        data: buffer.toString("base64"),
        mimeType: file.type,
      },
    };

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
      return NextResponse.json(
        {
          error: "No response received from the AI model. Please try again.",
        },
        { status: 500 }
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
      return NextResponse.json(
        {
          error:
            "The AI had trouble processing your document. This might be due to poor document quality, unclear text, or unsupported PDF format. Please try again with a clearer PDF document.",
        },
        { status: 500 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Your document doesn't contain enough readable content to generate questions. Please try a more detailed PDF with clear text.",
        },
        { status: 500 }
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
    const examName = file.name.replace(/\.pdf$/i, "");
    const examDescription = `Generated from ${file.name} containing ${questions.length} questions`;

    // Get auth token from Next.js request cookies/session
    const token = await convexAuthNextjsToken();

    try {
      // Persist exam directly from the server using the user's auth token
      const examId = await fetchMutation(
        api.exams.createExam,
        {
          examName,
          examDescription,
          questions: convexQuestions,
        },
        { token }
      );

      return NextResponse.json({
        success: true,
        examId,
        fileName: file.name,
        fileSize: file.size,
        questionCount: questions.length,
      });
    } catch (err) {
      console.error("Error saving exam to Convex:", err);

      // Handle unauthenticated or authorization issues
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Not authenticated") || message.includes("401")) {
        return NextResponse.json(
          { error: "You must be signed in to save exams." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to save the generated exam. Please try again." },
        { status: 500 }
      );
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
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
