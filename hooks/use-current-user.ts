"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useQueryWithError } from "./use-query-with-error";

export function useCurrentUser() {
  const { data: user, error } = useQueryWithError(api.users.current);

  return {
    isLoading: user === undefined && !error,
    isAuthenticated: user !== null && !error,
    error,
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
