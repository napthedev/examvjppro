"use client";

import TriggerSignIn from "@/components/trigger-sign-in";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { PdfDropZone } from "@/components/pdf-drop-zone";
import { QuestionsDisplay } from "@/components/questions-display";
import { UserExams } from "@/components/user-exams";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
}

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useCurrentUser();
  const createExam = useMutation(api.exams.createExam);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file.name);
  };

  const handleQuestionsGenerated = async (
    generatedQuestions: Question[],
    file: string,
    size: number
  ) => {
    setQuestions(generatedQuestions);
    setFileName(file);
    setFileSize(size);
    setShowQuestions(true);

    // Save exam to Convex
    try {
      setIsSaving(true);

      // Convert questions to the format expected by Convex schema
      const convexQuestions = generatedQuestions.map((q) => ({
        question: q.question,
        answers: [q.options.A, q.options.B, q.options.C, q.options.D],
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
      }));

      // Extract exam name from file name (remove .pdf extension)
      const examName = file.replace(/\.pdf$/i, "");

      await createExam({
        examName,
        examDescription: `Generated from ${file} containing ${generatedQuestions.length} questions`,
        questions: convexQuestions,
      });

      toast.success(
        `Exam "${examName}" saved successfully with ${generatedQuestions.length} questions.`
      );
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error(
        "Failed to save exam. The exam was generated but couldn't be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setFileName("");
    setFileSize(0);
    setShowQuestions(false);
    setIsSaving(false);
  };

  // Show loading spinner while checking auth state or storing user in Convex
  if (isLoading) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </>
    );
  }

  // If user is not logged in, trigger login immediately
  if (!isAuthenticated) {
    return <TriggerSignIn />;
  }

  // If user is logged in and stored in Convex, show welcome message
  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to the Dashboard, {user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground mb-6">
              Upload your PDF documents and let AI generate comprehensive exam
              questions and study materials.
            </p>
          </div>

          {!showQuestions ? (
            <div className="mb-8">
              <PdfDropZone
                onFileSelect={handleFileSelect}
                onQuestionsGenerated={handleQuestionsGenerated}
              />
            </div>
          ) : (
            <div className="mb-8">
              <QuestionsDisplay
                questions={questions}
                fileName={fileName}
                fileSize={fileSize}
                onReset={handleReset}
                isSaving={isSaving}
              />
            </div>
          )}

          {/* User Exams Section - Only show when not viewing questions */}
          {!showQuestions && (
            <div className="mt-12">
              <UserExams />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
