"use client";

import TriggerSignIn from "@/components/trigger-sign-in";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Show loading spinner if auth state is not loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not logged in, trigger login immediately
  if (!isSignedIn) {
    return <TriggerSignIn />;
  }

  // If user is logged in, show welcome message
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to the Dashboard,{" "}
          {user.firstName || user.emailAddresses[0]?.emailAddress}!
        </h1>
        <p className="text-muted-foreground">
          This is your personalized dashboard. Here you can manage your exams,
          view your progress, and access all the tools you need.
        </p>
      </div>
    </div>
  );
}
