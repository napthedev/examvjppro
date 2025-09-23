import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-accent" />
              <span className="text-accent font-medium">
                Ready to get started?
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">
              Start Creating Smarter Quizzes Today
            </h2>

            <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
              Join thousands of students and educators who are already using
              ExamVjpPro to enhance their learning experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Free trial available
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
