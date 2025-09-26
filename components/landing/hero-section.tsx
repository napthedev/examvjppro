import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import LinkButton from "../link-button";

export function HeroSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex items-center space-x-1 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>AI-Powered</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6">
            Transform PDFs into
            <span className="text-primary"> Smart Quizzes</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload your lecture PDFs and let our AI generate comprehensive
            multiple-choice questions instantly. Perfect for students studying
            and educators creating assessments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <LinkButton
              href="/dashboard"
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              Start Creating Questions
              <ArrowRight className="ml-2 h-5 w-5" />
            </LinkButton>
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Questions Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2min</div>
              <div className="text-muted-foreground">Average Processing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
