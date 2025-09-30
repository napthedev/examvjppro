"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle, FileText, Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PdfSettingsForm, type PdfSettings } from "./pdf-settings-form";
import { toast } from "sonner";

// Local type for questions retained only for error descriptions if needed
// but not used in props anymore since saving is server-side
interface Question {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  explanation: string;
}

interface PdfDropZoneProps {
  onFileSelect: (file: File) => void;
  onExamCreated?: (examId: string) => void;
  className?: string;
  maxSizeMB?: number;
}

export function PdfDropZone({
  onFileSelect,
  onExamCreated,
  className,
  maxSizeMB = 10,
}: PdfDropZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError("");

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors?.[0]?.code === "file-too-large") {
          setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        } else if (rejection.errors?.[0]?.code === "file-invalid-type") {
          setError("Please select a PDF file.");
        } else {
          setError("Invalid file. Please select a PDF file.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
    noClick: true, // We'll handle clicks manually
    noKeyboard: true,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setIsGenerating(false);
    setGenerationProgress("");
    setShowSettings(false);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      setShowSettings(true);
    }
  };

  const handleBackToUpload = () => {
    setShowSettings(false);
    setError("");
  };

  const generateQuestions = async (settings: PdfSettings) => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setError("");
    setGenerationProgress("Uploading PDF...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("settings", JSON.stringify(settings));

      setGenerationProgress("Analyzing document...");

      let response;
      try {
        response = await fetch("/api/generate-questions", {
          method: "POST",
          body: formData,
        });
      } catch (networkError) {
        throw new Error(
          "Network connection failed. Please check your internet connection and try again."
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      setGenerationProgress("Generating questions...");

      const data = await response.json();

      if (data.success && data.examId) {
        toast.success(`Exam created! Redirecting...`);
        onExamCreated?.(data.examId);
        // Reset after success
        removeFile();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate questions";

      // Set error for display in the component
      setError(errorMessage);

      // Show toast notification
      toast.error("Question Generation Failed", {
        description: getErrorDescription(errorMessage),
        action: {
          label: "Retry",
          onClick: () => generateQuestions(settings),
        },
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  const getErrorDescription = (errorMessage: string): string => {
    if (
      errorMessage.includes("Failed to parse AI response") ||
      errorMessage.includes("had trouble processing")
    ) {
      return "The AI had trouble understanding your document. Please try again or use a different PDF.";
    }
    if (errorMessage.includes("Google AI API key")) {
      return "There's a configuration issue. Please contact support.";
    }
    if (errorMessage.includes("File size")) {
      return "Your file is too large. Please use a PDF smaller than 10MB.";
    }
    if (errorMessage.includes("File must be a PDF")) {
      return "Please make sure you're uploading a valid PDF file.";
    }
    if (
      errorMessage.includes("No valid questions") ||
      errorMessage.includes("doesn't contain enough")
    ) {
      return "The document doesn't contain enough content to generate questions. Try a more detailed PDF.";
    }
    if (errorMessage.includes("Network connection")) {
      return "Please check your internet connection and try again.";
    }
    return "Something went wrong. Please check your internet connection and try again.";
  };

  const handleClick = () => {
    if (!selectedFile) {
      open();
    }
  };

  // Show settings form if file is selected and settings should be shown
  if (showSettings && selectedFile) {
    return (
      <PdfSettingsForm
        file={selectedFile}
        onGenerate={generateQuestions}
        onBack={handleBackToUpload}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        error={error}
      />
    );
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5"
              : selectedFile
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : error
              ? "border-destructive bg-destructive/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            !selectedFile && "hover:bg-muted/20"
          )}
          onClick={handleClick}
        >
          <input {...getInputProps()} />

          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isGenerating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-sm text-green-600 dark:text-green-400">
                PDF file ready! Configure settings to generate questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload
                  className={cn(
                    "h-12 w-12",
                    isDragActive
                      ? "text-primary"
                      : error
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive
                    ? "Drop your PDF here"
                    : "Drop PDF here to generate with AI"}
                </h3>
                <p className="text-muted-foreground">
                  {isDragActive
                    ? "Release to upload your PDF file"
                    : "Drag and drop your PDF file here, or click to browse"}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="mx-auto"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>

                <p className="text-xs text-muted-foreground">
                  Supports PDF files up to {maxSizeMB}MB
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {selectedFile && !isGenerating && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleFileUpload}
              className="w-full max-w-sm"
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Configure & Generate Questions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
