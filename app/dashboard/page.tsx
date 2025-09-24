"use client";

import TriggerSignIn from "@/components/trigger-sign-in";
import { MessagesDemo } from "@/components/messages-demo";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useCurrentUser();

  // Show loading spinner while checking auth state or storing user in Convex
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // If user is not logged in, trigger login immediately
  if (!isAuthenticated) {
    return <TriggerSignIn />;
  }

  // If user is logged in and stored in Convex, show welcome message
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to the Dashboard, {user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mb-4">
          This is your personalized dashboard. Here you can manage your exams,
          view your progress, and access all the tools you need.
        </p>
        {user && (
          <div className="bg-card/50 p-4 rounded-lg mt-6">
            <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            {user.email && (
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            )}
            <p>
              <strong>Member since:</strong>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <MessagesDemo />
      </div>
    </div>
  );
}
