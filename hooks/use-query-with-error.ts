"use client";

import { useQuery } from "convex/react";
import { FunctionReference } from "convex/server";

/**
 * A wrapper around useQuery that provides error handling
 * Returns the query result with error information
 */
export function useQueryWithError<T>(
  functionReference: FunctionReference<"query", "public", any, T>,
  args?: any
): {
  data: T | null | undefined;
  error: string | null;
} {
  try {
    const result = useQuery(functionReference, args);
    return {
      data: result,
      error: null,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return {
      data: null,
      error: errorMessage,
    };
  }
}
