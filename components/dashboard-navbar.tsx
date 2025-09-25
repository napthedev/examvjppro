"use client";

import { FileText } from "lucide-react";
import { Authenticated } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function DashboardNavbar() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              ExamVjpPro
            </span>
          </Link>

          <div className="flex items-center">
            <Authenticated>
              <UserButton />
            </Authenticated>
          </div>
        </div>
      </div>
    </header>
  );
}
