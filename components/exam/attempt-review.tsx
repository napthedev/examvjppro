"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  FileText,
  Award,
} from "lucide-react";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { MathJax, MathJaxContext } from "better-react-mathjax";

interface AttemptReviewProps {
  exam: Doc<"exams">;
  attempt: Doc<"attempts">;
}

// MathJax configuration
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
  options: {
    enableMenu: false,
  },
};

// Helper component to render text with LaTeX
const LaTeXRenderer: React.FC<{ children: string; className?: string }> = ({
  children,
  className = "",
}) => {
  return <MathJax className={className}>{children}</MathJax>;
};

export function AttemptReview({ exam, attempt }: AttemptReviewProps) {
  const attemptDate = new Date(attempt.attempt_date);
  const timeAgo = formatDistance(attemptDate, new Date(), { addSuffix: true });
  const questionCount = exam.question_data.length;
  const percentage = Math.round((attempt.score / questionCount) * 100);
  const correctAnswers = attempt.answers.filter(
    (answer) => answer.is_correct
  ).length;
  const wrongAnswers = questionCount - correctAnswers;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = () => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" asChild className="mb-4">
          <Link href={`/exam/${exam._id}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Exam
          </Link>
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {exam.exam_name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Attempted {timeAgo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(attempt.time_taken)}
                    </div>
                  </div>
                </div>
              </div>
              <Badge
                variant={getScoreBadgeVariant()}
                className="text-lg px-3 py-1"
              >
                {percentage}%
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className={`h-8 w-8 mx-auto mb-2 ${getScoreColor()}`} />
              <div className={`text-2xl font-bold ${getScoreColor()}`}>
                {attempt.score}/{questionCount}
              </div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {wrongAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatTime(attempt.time_taken)}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Accuracy</span>
                <Badge variant={getScoreBadgeVariant()}>{percentage}%</Badge>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    percentage >= 80
                      ? "bg-green-600"
                      : percentage >= 60
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Completed on:</span>
                  <div className="font-medium">
                    {attemptDate.toLocaleDateString()} at{" "}
                    {attemptDate.toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Average per question:
                  </span>
                  <div className="font-medium">
                    {formatTime(Math.round(attempt.time_taken / questionCount))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <Card>
          <CardHeader>
            <CardTitle>Questions Review</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {exam.question_data.map((question, index) => {
                const userAnswer = attempt.answers[index];
                const isCorrect = userAnswer.is_correct;
                const correctAnswer = question.correct_answer;
                const selectedAnswer = userAnswer.answer;

                return (
                  <AccordionItem key={index} value={`question-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium">
                            Question {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 text-sm text-muted-foreground line-clamp-1">
                          <LaTeXRenderer>{question.question}</LaTeXRenderer>
                        </div>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? "Correct" : "Wrong"}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {/* Question */}
                        <div>
                          <h4 className="font-medium mb-2">Question:</h4>
                          <div className="text-sm leading-relaxed">
                            <LaTeXRenderer>{question.question}</LaTeXRenderer>
                          </div>
                        </div>

                        {/* Answer Options */}
                        <div>
                          <h4 className="font-medium mb-2">Answer Options:</h4>
                          <div className="space-y-2">
                            {question.answers.map((answer, answerIndex) => {
                              const answerLetter = String.fromCharCode(
                                65 + answerIndex
                              ); // A, B, C, D
                              const isUserSelected =
                                selectedAnswer === answerLetter;
                              const isCorrectOption =
                                correctAnswer === answerLetter;

                              return (
                                <div
                                  key={answerIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    isCorrectOption
                                      ? "border-green-200 bg-green-50"
                                      : isUserSelected && !isCorrectOption
                                      ? "border-red-200 bg-red-50"
                                      : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCorrectOption
                                          ? "bg-green-600 text-white"
                                          : isUserSelected && !isCorrectOption
                                          ? "bg-red-600 text-white"
                                          : "bg-gray-300 text-gray-700"
                                      }`}
                                    >
                                      {answerLetter}
                                    </div>
                                    <span className="text-sm text-black">
                                      <LaTeXRenderer>{answer}</LaTeXRenderer>
                                    </span>
                                    <div className="ml-auto flex gap-2">
                                      {isCorrectOption && (
                                        <Badge
                                          variant="outline"
                                          className="text-green-600 border-green-600"
                                        >
                                          Correct
                                        </Badge>
                                      )}
                                      {isUserSelected && (
                                        <Badge
                                          variant="outline"
                                          className={
                                            isCorrectOption
                                              ? "text-green-600 border-green-600"
                                              : "text-red-600 border-red-600"
                                          }
                                        >
                                          Your Answer
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Result Summary */}
                        <div
                          className={`p-3 rounded-lg ${
                            isCorrect
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isCorrect ? "text-green-800" : "text-red-800"
                              }`}
                            >
                              {isCorrect
                                ? `Correct! You selected ${selectedAnswer}.`
                                : `Incorrect. You selected ${selectedAnswer}, but the correct answer is ${correctAnswer}.`}
                            </span>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div>
                          <h4 className="font-medium mb-2">Explanation:</h4>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm leading-relaxed text-blue-900">
                              <LaTeXRenderer>
                                {question.explanation}
                              </LaTeXRenderer>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Want to try again?</h3>
                <p className="text-sm text-muted-foreground">
                  Practice makes perfect. Take the exam again to improve your
                  score.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href={`/exam/${exam._id}`}>View Exam Details</Link>
                </Button>
                <Button asChild>
                  <Link href={`/exam/${exam._id}/test`}>Retake Exam</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MathJaxContext>
  );
}
