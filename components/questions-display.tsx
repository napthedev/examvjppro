"use client";

import React, { useState } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface QuestionsDisplayProps {
  questions: Question[];
  fileName: string;
  fileSize: number;
  onReset: () => void;
  isSaving?: boolean;
}

export function QuestionsDisplay({
  questions,
  fileName,
  fileSize,
  onReset,
  isSaving = false,
}: QuestionsDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    return { correct: correctAnswers, total: questions.length };
  };

  const mathJaxConfig = {
    loader: { load: ["[tex]/html"] },
    tex: {
      packages: { "[+]": ["html"] },
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No questions generated. Please try uploading a different PDF.
          </p>
          <Button onClick={onReset} className="mt-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { correct, total } = getScore();

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-6">
        {/* Header with file info and controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isSaving ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <FileText className="h-5 w-5 text-primary" />
                )}
                <div>
                  <CardTitle className="text-lg">{fileName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {(fileSize / 1024 / 1024).toFixed(2)} MB •{" "}
                    {questions.length} questions generated
                    {isSaving && " • Saving exam..."}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {showResults && (
                  <Badge
                    variant={correct >= total * 0.7 ? "default" : "secondary"}
                  >
                    Score: {correct}/{total} (
                    {Math.round((correct / total) * 100)}%)
                  </Badge>
                )}
                <Button variant="outline" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Upload
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = selectedAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== undefined;

            return (
              <Card
                key={question.id}
                className={cn(
                  "transition-all duration-200",
                  showResults &&
                    isAnswered &&
                    (isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20")
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-medium">
                      <span className="text-primary mr-2">Q{index + 1}.</span>
                      <MathJax>{question.question}</MathJax>
                    </CardTitle>
                    {showResults && isAnswered && (
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(question.options).map(([letter, text]) => {
                      const isSelected = userAnswer === letter;
                      const isCorrectOption = letter === question.correctAnswer;

                      return (
                        <button
                          key={letter}
                          onClick={() =>
                            handleAnswerSelect(question.id, letter)
                          }
                          disabled={showResults}
                          className={cn(
                            "w-full text-left p-3 rounded-md border transition-all duration-200",
                            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                            !showResults &&
                              isSelected &&
                              "bg-primary/10 border-primary",
                            !showResults &&
                              !isSelected &&
                              "border-border hover:border-muted-foreground/30",
                            showResults &&
                              isCorrectOption &&
                              "bg-green-100 border-green-500 dark:bg-green-950/30",
                            showResults &&
                              isSelected &&
                              !isCorrectOption &&
                              "bg-red-100 border-red-500 dark:bg-red-950/30",
                            showResults && "cursor-default hover:bg-current"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={cn(
                                "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                                !showResults &&
                                  isSelected &&
                                  "bg-primary text-primary-foreground border-primary",
                                !showResults &&
                                  !isSelected &&
                                  "border-muted-foreground/30",
                                showResults &&
                                  isCorrectOption &&
                                  "bg-green-600 text-white border-green-600",
                                showResults &&
                                  isSelected &&
                                  !isCorrectOption &&
                                  "bg-red-600 text-white border-red-600"
                              )}
                            >
                              {letter}
                            </div>
                            <div className="flex-1">
                              <MathJax>{text}</MathJax>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Show explanation after results */}
                  {showResults && (
                    <div className="mt-4 p-3 rounded-md bg-muted/50 border">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Explanation:
                      </p>
                      <div className="text-sm">
                        <MathJax>{question.explanation}</MathJax>
                      </div>
                      {userAnswer && userAnswer !== question.correctAnswer && (
                        <p className="text-sm text-red-600 mt-2">
                          Your answer: <strong>{userAnswer}</strong> • Correct
                          answer: <strong>{question.correctAnswer}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit/Reset buttons */}
        {!showResults ? (
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              size="lg"
            >
              Submit Answers ({Object.keys(selectedAnswers).length}/
              {questions.length})
            </Button>
          </div>
        ) : (
          <div className="flex justify-center space-x-3">
            <Button onClick={handleReset} variant="outline">
              Retake Quiz
            </Button>
            <Button onClick={onReset}>Upload New PDF</Button>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
