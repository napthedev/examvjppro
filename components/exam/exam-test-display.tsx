"use client";

import React, { useState } from "react";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Calendar,
  BookOpen,
  ChevronLeft,
  Clock,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ExamTestDisplayProps {
  exam: Doc<"exams">;
}

interface ConvertedQuestion {
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

export function ExamTestDisplay({ exam }: ExamTestDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(
    null
  );

  const createAttempt = useMutation(api.exams.createAttempt);

  // Convert Convex exam data to the format expected by the questions display
  const questions: ConvertedQuestion[] = exam.question_data.map((q, index) => ({
    id: index + 1,
    question: q.question,
    options: {
      A: q.answers[0] || "",
      B: q.answers[1] || "",
      C: q.answers[2] || "",
      D: q.answers[3] || "",
    },
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
  }));

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submitTime = new Date();
    setEndTime(submitTime);

    try {
      // Calculate score and prepare answers array
      const { correct, total } = getScore();
      const timeTakenSeconds = Math.floor(
        (submitTime.getTime() - startTime.getTime()) / 1000
      );

      // Prepare answers array for storage
      const answersArray = questions.map((question) => ({
        is_correct: selectedAnswers[question.id] === question.correctAnswer,
        answer: selectedAnswers[question.id] || "",
      }));

      // Store the attempt in Convex
      const attemptId = await createAttempt({
        examId: exam._id,
        score: correct,
        timeTaken: timeTakenSeconds,
        answers: answersArray,
      });

      setCompletedAttemptId(attemptId);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to save attempt:", error);
      // Still show results even if saving fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setEndTime(null);
    setIsSubmitting(false);
    setCompletedAttemptId(null);
  };

  const getScore = () => {
    const correctAnswers = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    return { correct: correctAnswers, total: questions.length };
  };

  const getTimeTaken = () => {
    if (!endTime) return null;
    const timeDiff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const { correct, total } = getScore();
  const createdAt = new Date(exam.creation_date);
  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" asChild className="mb-4">
          <Link href={`/exam/${exam._id}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Exam Details
          </Link>
        </Button>

        {/* Exam Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {exam.exam_name}
                  </CardTitle>
                  {exam.exam_description && (
                    <p className="text-muted-foreground mb-3">
                      {exam.exam_description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {timeAgo}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {questions.length} question
                      {questions.length !== 1 ? "s" : ""}
                    </div>
                    {endTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Time taken: {getTimeTaken()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {showResults && (
                  <Badge
                    variant={correct >= total * 0.7 ? "default" : "destructive"}
                    className="text-sm"
                  >
                    Score: {correct}/{total} (
                    {Math.round((correct / total) * 100)}%)
                  </Badge>
                )}
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant="outline">
                    {Object.keys(selectedAnswers).length}/{questions.length}{" "}
                    answered
                  </Badge>
                  {!showResults && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>
                        {Math.round(
                          (Object.keys(selectedAnswers).length /
                            questions.length) *
                            100
                        )}
                        % complete
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Bar (shown while taking exam) */}
        {!showResults && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {Object.keys(selectedAnswers).length} of {questions.length}{" "}
                    questions
                  </span>
                </div>
                <Progress
                  value={
                    (Object.keys(selectedAnswers).length / questions.length) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary (shown after submission) */}
        {showResults && (
          <Card
            className={cn(
              "border-2",
              correct >= total * 0.7
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {correct >= total * 0.7
                      ? "Great job! 🎉"
                      : "Keep practicing! 📚"}
                  </h3>
                  <p className="text-muted-foreground">
                    You scored {correct} out of {total} questions correctly.
                    {getTimeTaken() && ` Time taken: ${getTimeTaken()}.`}
                  </p>
                  {completedAttemptId && (
                    <p className="text-sm text-primary mt-2">
                      💡 Click "View Detailed Results" to see explanations for
                      all questions
                    </p>
                  )}
                </div>
                <Button onClick={handleRetake} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                            showResults && "cursor-default"
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

        {/* Submit/Navigation buttons */}
        <div className="flex justify-center space-x-3 pb-8">
          {!showResults ? (
            <Button
              onClick={handleSubmit}
              disabled={
                Object.keys(selectedAnswers).length < questions.length ||
                isSubmitting
              }
              size="lg"
            >
              {isSubmitting
                ? "Submitting..."
                : `Submit Exam (${Object.keys(selectedAnswers).length}/${
                    questions.length
                  })`}
            </Button>
          ) : (
            <>
              <Button onClick={handleRetake} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Exam
              </Button>
              {completedAttemptId && (
                <Button asChild size="lg">
                  <Link
                    href={`/exam/${exam._id}/attempt/${completedAttemptId}`}
                  >
                    View Detailed Results
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href={`/exam/${exam._id}`}>Back to Exam Details</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}
