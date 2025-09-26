"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Calendar,
  BookOpen,
  ChevronLeft,
  Play,
  User,
  Clock,
  Target,
  TrendingUp,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface ExamDisplayProps {
  exam: Doc<"exams">;
}

export function ExamDisplay({ exam }: ExamDisplayProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(exam.exam_name);
  const [isUpdating, setIsUpdating] = useState(false);

  const createdAt = new Date(exam.creation_date);
  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true });
  const questionCount = exam.question_data.length;

  const attempts = useQuery(api.exams.getAttemptsByExam, { examId: exam._id });
  const updateExamName = useMutation(api.exams.updateExamName);

  const handleStartEdit = () => {
    setIsEditingName(true);
    setEditedName(exam.exam_name);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(exam.exam_name);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      toast.error("Exam name cannot be empty");
      return;
    }

    if (editedName.trim() === exam.exam_name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateExamName({
        examId: exam._id,
        examName: editedName.trim(),
      });

      setIsEditingName(false);
      toast.success("Exam name updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update exam name"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getBestScore = () => {
    if (!attempts || attempts.length === 0) return null;
    return Math.max(...attempts.map((attempt) => attempt.score));
  };

  const getAverageScore = () => {
    if (!attempts || attempts.length === 0) return null;
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    return Math.round(totalScore / attempts.length);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" asChild className="mb-4">
        <Link href="/dashboard">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Exam Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="text-2xl font-semibold h-auto py-1 border-primary/50 focus:border-primary"
                        autoFocus
                        disabled={isUpdating}
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={isUpdating}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">
                        {exam.exam_name}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleStartEdit}
                        className="h-8 w-8 p-0 ml-2 opacity-60 hover:opacity-100"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
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
                    {questionCount} question{questionCount !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Personal Exam
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant="secondary">{questionCount} Questions</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exam Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About This Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Exam Details</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Contains {questionCount} multiple-choice questions</li>
                <li>• Each question has 4 answer options (A, B, C, D)</li>
                <li>• Includes detailed explanations for each answer</li>
                <li>• No time limit - take as long as you need</li>
                <li>• You can retake the exam as many times as you want</li>
              </ul>
            </div>

            {exam.exam_description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exam.exam_description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Ready to start?</h3>
              <p className="text-sm text-muted-foreground">
                Take your time and do your best. Good luck!
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href={`/exam/${exam._id}/test`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Exam
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attempts History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Attempts {attempts !== undefined && `(${attempts.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts === undefined ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-pulse">Loading attempts...</div>
            </div>
          ) : attempts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attempts.map((attempt, index) => {
                const percentage = Math.round(
                  (attempt.score / questionCount) * 100
                );
                const attemptDate = new Date(attempt.attempt_date);

                return (
                  <Link
                    key={attempt._id}
                    href={`/exam/${exam._id}/attempt/${attempt._id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={percentage >= 70 ? "default" : "secondary"}
                        >
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {attempt.score}/{questionCount} ({percentage}%)
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {attemptDate.toLocaleDateString()} at{" "}
                            {attemptDate.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(attempt.time_taken)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Click to review
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No attempts yet</p>
              <p className="text-sm">
                Take your first exam to see your progress here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{questionCount}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {attempts && attempts.length > 0 ? attempts.length : 0}
            </div>
            <div className="text-sm text-muted-foreground">Attempts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {getBestScore() !== null
                ? `${getBestScore()}/${questionCount}`
                : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Best Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {getAverageScore() !== null
                ? `${getAverageScore()}/${questionCount}`
                : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Average</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
