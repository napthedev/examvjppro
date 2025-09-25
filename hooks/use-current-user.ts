"use client";

import { useUser } from "@clerk/nextjs";

export function useCurrentUser() {
  const { isLoaded, isSignedIn, user } = useUser();

  return {
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
    user: user
      ? {
          id: user.id,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "Anonymous",
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
          externalId: user.id,
          createdAt: user.createdAt
            ? new Date(user.createdAt).getTime()
            : Date.now(),
          updatedAt: user.updatedAt
            ? new Date(user.updatedAt).getTime()
            : Date.now(),
        }
      : null,
  };
}
