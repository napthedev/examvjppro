"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AttemptReview } from "@/components/exam/attempt-review";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import TriggerSignIn from "@/components/trigger-sign-in";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQueryWithError } from "@/hooks/use-query-with-error";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AttemptPage() {
  const { isLoading, isAuthenticated, error: userError } = useCurrentUser();
  const params = useParams();
  const examId = params.id as Id<"exams">;
  const attemptId = params.attempt_id as Id<"attempts">;

  const { data: exam, error: examError } = useQueryWithError(
    api.exams.getExamById,
    isAuthenticated && examId ? { examId } : "skip"
  );

  const { data: attempt, error: attemptError } = useQueryWithError(
    api.exams.getAttemptById,
    isAuthenticated && attemptId ? { attemptId } : "skip"
  );

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">Loading attempt...</p>
        </div>
      </>
    );
  }

  // If user is not logged in, trigger login immediately
  if (!isAuthenticated) {
    return <TriggerSignIn />;
  }

  // Handle Convex connection errors
  if (userError) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Authentication Error
                </h2>
                <p className="text-muted-foreground mb-6">
                  Unable to verify your authentication status. {userError}
                </p>
                <div className="space-x-2">
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (examError || attemptError) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
                <p className="text-muted-foreground mb-6">
                  Unable to connect to the database. {examError || attemptError}
                </p>
                <div className="space-x-2">
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Handle loading state
  if (exam === undefined || attempt === undefined) {
    return (
      <>
        <DashboardNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2 text-muted-foreground">Loading attempt...</p>
        </div>
      </>
    );
  }

  // Handle invalid IDs
  if (
    !examId ||
    !attemptId ||
    typeof examId !== "string" ||
    typeof attemptId !== "string"
  ) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Invalid URL</h2>
                <p className="text-muted-foreground mb-6">
                  The exam or attempt ID in the URL is not valid.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Handle exam or attempt not found
  if (exam === null || attempt === null) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {exam === null ? "Exam Not Found" : "Attempt Not Found"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {exam === null
                    ? "The exam you're looking for doesn't exist or you don't have permission to access it."
                    : "The attempt you're looking for doesn't exist or you don't have permission to access it."}
                </p>
                <Button asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Verify that the attempt belongs to the exam
  if (attempt.exam_id !== examId) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Mismatched Data</h2>
                <p className="text-muted-foreground mb-6">
                  This attempt doesn't belong to the specified exam.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <AttemptReview exam={exam} attempt={attempt} />
        </div>
      </div>
    </>
  );
}
