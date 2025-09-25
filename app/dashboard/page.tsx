"use client";

import TriggerSignIn from "@/components/trigger-sign-in";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { PdfDropZone } from "@/components/pdf-drop-zone";
import { UserExams } from "@/components/user-exams";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useCurrentUser();

  const handleFileSelect = (file: File) => {
    console.log("Selected file:", file.name);
    // Here you can add your file processing logic
    // For example: upload to server, process with AI, etc.
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

          <div className="mb-8">
            <PdfDropZone onFileSelect={handleFileSelect} />
          </div>

          {/* User Exams Section */}
          <div className="mt-12">
            <UserExams userId={user?.id || ""} />
          </div>
        </div>
      </div>
    </>
  );
}
