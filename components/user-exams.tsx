"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, BookOpen } from "lucide-react";
import { formatDistance } from "date-fns";

interface UserExamsProps {
  userId: string;
}

export function UserExams({ userId }: UserExamsProps) {
  const exams = useQuery(api.exams.getExamsByUser, {
    userId: userId,
  });

  if (exams === undefined) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Your Exams</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-[200px]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No exams yet</h2>
        <p className="text-muted-foreground mb-4">
          Upload a PDF document above to create your first AI-generated exam.
        </p>
        <p className="text-sm text-muted-foreground">
          Once you upload a document, we'll automatically generate comprehensive
          exam questions and study materials for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Exams</h2>
        <Badge variant="secondary" className="text-sm">
          {exams.length} exam{exams.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const createdAt = new Date(exam.creation_date);
          const timeAgo = formatDistance(createdAt, new Date(), {
            addSuffix: true,
          });

          return (
            <Card
              key={exam._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {exam.exam_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  Created {timeAgo}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {exam.exam_description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {exam.exam_description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    {exam.question_data.length} question
                    {exam.question_data.length !== 1 ? "s" : ""}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Exam
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
