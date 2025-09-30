"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Settings, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface PdfSettings {
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  explanation: "brief" | "detailed";
}

interface PdfSettingsFormProps {
  file: File;
  onGenerate: (settings: PdfSettings) => void;
  onBack: () => void;
  isGenerating: boolean;
  generationProgress: string;
  error?: string;
}

export function PdfSettingsForm({
  file,
  onGenerate,
  onBack,
  isGenerating,
  generationProgress,
  error,
}: PdfSettingsFormProps) {
  const [settings, setSettings] = useState<PdfSettings>({
    numberOfQuestions: 10,
    difficulty: "mixed",
    explanation: "brief",
  });

  const [errors, setErrors] = useState<Partial<PdfSettings>>({});

  const validateSettings = (): boolean => {
    const newErrors: Partial<PdfSettings> = {};

    if (settings.numberOfQuestions < 1 || settings.numberOfQuestions > 20) {
      newErrors.numberOfQuestions = settings.numberOfQuestions;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    if (validateSettings()) {
      onGenerate(settings);
    }
  };

  const handleNumberOfQuestionsChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setSettings((prev) => ({ ...prev, numberOfQuestions: num }));
      // Clear error if value becomes valid
      if (num >= 1 && num <= 20 && errors.numberOfQuestions) {
        setErrors((prev) => ({ ...prev, numberOfQuestions: undefined }));
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Question Generation Settings</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isGenerating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Info */}
        <div className="p-4 rounded-lg bg-muted/20 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Settings Form */}
        <div className="space-y-4">
          {/* Number of Questions */}
          <div className="space-y-2">
            <Label htmlFor="numberOfQuestions" className="text-sm font-medium">
              Number of Questions
            </Label>
            <Input
              id="numberOfQuestions"
              type="number"
              min="1"
              max="20"
              value={settings.numberOfQuestions}
              onChange={(e) => handleNumberOfQuestionsChange(e.target.value)}
              className={errors.numberOfQuestions ? "border-destructive" : ""}
              disabled={isGenerating}
            />
            {errors.numberOfQuestions && (
              <p className="text-xs text-destructive">
                Please enter a number between 1 and 20
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Choose between 1-20 questions to generate from your PDF
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-medium">
              Difficulty Level
            </Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: PdfSettings["difficulty"]) =>
                setSettings((prev) => ({ ...prev, difficulty: value }))
              }
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="mixed">Mixed (Easy to Hard)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set the complexity level for the generated questions
            </p>
          </div>

          {/* Explanation Detail */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-sm font-medium">
              Explanation Detail
            </Label>
            <Select
              value={settings.explanation}
              onValueChange={(value: PdfSettings["explanation"]) =>
                setSettings((prev) => ({ ...prev, explanation: value }))
              }
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select explanation detail" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how comprehensive the answer explanations should be
            </p>
          </div>
        </div>

        <Separator />

        {/* Error Display */}
        {error && !isGenerating && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate Button or Progress */}
        {isGenerating ? (
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-primary font-medium">
                {generationProgress}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              This may take 30-60 seconds...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleGenerate} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              {error ? "Retry - " : ""}Generate {settings.numberOfQuestions}{" "}
              Question
              {settings.numberOfQuestions !== 1 ? "s" : ""}
            </Button>
            {error && (
              <p className="text-xs text-center text-muted-foreground">
                Check your PDF content and settings, then try again
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
