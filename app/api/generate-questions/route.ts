import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import {
  yamlToJson,
  type Question,
  type QuestionOption,
} from "@/lib/yaml-converter";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Create the prompt for generating multiple choice questions
    const prompt = `
    Please analyze the content of this PDF document and generate 10 multiple choice questions based on the material. 
    
    For each question:
    1. Create a clear, well-structured question
    2. Provide 4 answer options (A, B, C, D)
    3. Indicate the correct answer
    4. Include a brief explanation for the correct answer. The explanation shouldn't state any references to the original document.
    5. If the content contains mathematical formulas, equations, or symbols, format them using LaTeX notation (enclosed in $ for inline math or $$ for display math)
    6. Make sure strings don't contain characters that break YAML parsing
    7. Keep all text on single lines (no multi-line strings)

    Format your response as valid YAML with this exact structure (return only the questions array):
    
    - id: 1
      question: |
        Question text with LaTeX if needed: $E = mc^2$
      options:
        A: |
          Option A text
        B: |
          Option B text
        C: |
          Option C text
        D: |
          Option D text
      correctAnswer: "A"
      explanation: |
        Explanation for why A is correct
    
    Important: 
    - Use proper LaTeX notation for all mathematical content
    - Make sure the YAML is valid and properly formatted
    - Focus on creating meaningful questions that test understanding
    - If the document doesn't contain enough content for 10 questions, generate as many as appropriate
    - Return ONLY the YAML array of questions, no additional text or explanations
    `;

    // Prepare the file data for Google AI
    const filePart = {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: file.type,
      },
    };

    // Generate content using the model
    const result = await model.generateContent([prompt, filePart]);
    const response = result.response;
    const text = response.text();

    // Try to parse the YAML response and convert to JSON
    let questions;
    try {
      // Parse YAML to JavaScript object using utility function
      const yamlData = yamlToJson(text);

      // Convert to JSON-compatible format
      questions = Array.isArray(yamlData) ? yamlData : [];

      console.log("Parsed YAML data:", JSON.stringify(questions, null, 2));
    } catch (parseError) {
      console.error("Failed to parse YAML response:", text);
      console.error("Parse error:", parseError);

      // Fallback: try to parse as JSON in case AI returns JSON instead
      try {
        const jsonCleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
        questions = JSON.parse(jsonCleanedText);
        console.log("Successfully parsed as fallback JSON");
      } catch (jsonParseError) {
        return NextResponse.json(
          {
            error:
              "Failed to parse AI response as YAML or JSON. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    // Validate and normalize the response structure
    let normalizedQuestions: Question[];
    try {
      normalizedQuestions = validateAndNormalizeQuestions(questions);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Unknown validation error";
      return NextResponse.json(
        { error: `Invalid response format from AI: ${errorMessage}` },
        { status: 500 }
      );
    }

    if (normalizedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No valid questions were generated from the document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: normalizedQuestions,
      fileName: file.name,
      fileSize: file.size,
      questionCount: normalizedQuestions.length,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
