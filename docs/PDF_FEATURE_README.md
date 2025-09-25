# PDF Question Generator Feature

This feature allows users to upload PDF documents and automatically generate multiple-choice questions using Google's Generative AI, with full MathJax support for mathematical content.

## Features

- **PDF Upload**: Drag and drop PDF files up to 10MB
- **AI Question Generation**: Uses Google Gemini 1.5 Flash model to analyze PDFs and create questions
- **MathJax Support**: Renders mathematical formulas and equations properly using LaTeX notation
- **Interactive Quiz**: Take the generated quiz with instant feedback
- **File Validation**: Automatic validation of file type and size
- **Progress Tracking**: Real-time progress updates during generation
- **Score Calculation**: Get detailed results with explanations

## Setup

1. Get a Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add it to your `.env.local` file:
   ```
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

## Components

- `components/pdf-drop-zone.tsx` - File upload interface
- `components/questions-display.tsx` - Question display and quiz interface  
- `app/api/generate-questions/route.ts` - API endpoint for question generation

## Dependencies Added

- `@google/generative-ai` - Google AI SDK
- `better-react-mathjax` - MathJax components for React

## Usage

1. Navigate to the dashboard
2. Upload a PDF file (max 10MB)
3. Wait for AI to generate questions (30-60 seconds)
4. Take the interactive quiz
5. View results with explanations
6. Upload a new file or retake the quiz

The system automatically handles:
- PDF content analysis
- Mathematical notation detection and LaTeX formatting
- Question difficulty balancing
- Answer validation and scoring