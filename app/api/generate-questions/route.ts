import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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
    6. Ensure questions cover different difficulty levels and key concepts from the document
    7. Escape the special characters in the JSON to ensure valid formatting.
    8. The output strings in JSON shouldn't be expanding on multiple lines.
    
    Format your response as a JSON array with this structure:
    [
      {
        "id": 1,
        "question": "Question text with LaTeX if needed: $E = mc^2$",
        "options": {
          "A": "Option A text",
          "B": "Option B text", 
          "C": "Option C text",
          "D": "Option D text"
        },
        "correctAnswer": "A",
        "explanation": "Explanation for why A is correct"
      }
    ]
    
    Important: 
    - Use proper LaTeX notation for all mathematical content
    - Make sure the JSON is valid and properly formatted
    - Focus on creating meaningful questions that test understanding
    - If the document doesn't contain enough content for 10 questions, generate as many as appropriate
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

    // Try to parse the JSON response
    let questions;
    try {
      // Remove any markdown code block formatting if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      questions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
