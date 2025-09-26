"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.users.current);

  return {
    isLoading: user === undefined,
    isAuthenticated: user !== null,
    user: user
      ? {
          id: user._id,
          name: user.name || "Anonymous",
          email: user.email,
          imageUrl: user.image,
          _id: user._id,
          _creationTime: user._creationTime,
        }
      : null,
  };
}
