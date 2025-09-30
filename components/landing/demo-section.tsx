import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Upload, ArrowRight, CheckCircle } from "lucide-react";
import LinkButton from "../link-button";

export function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            See ExamVjpPro in Action
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Watch how easy it is to transform your study materials into
            interactive quizzes
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Upload Your PDF</h3>
                  <p className="text-muted-foreground">
                    Simply drag and drop your lecture notes, textbook chapters,
                    or study materials
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Processing</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI analyzes the content and identifies key
                    concepts and facts
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Get Your Questions</h3>
                  <p className="text-muted-foreground">
                    Receive well-crafted multiple-choice questions with detailed
                    explanations
                  </p>
                </div>
              </div>

              <LinkButton
                href="/dashboard"
                className="bg-primary hover:bg-primary/90"
              >
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </LinkButton>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Drop your PDF here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>Supports PDF files up to 50MB</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>Processes in under 2 minutes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span>Generates 10-50 questions per document</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
