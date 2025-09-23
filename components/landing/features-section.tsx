import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Clock, Target, Shield, Download, Repeat } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Advanced AI Processing",
    description:
      "Our state-of-the-art AI understands context and creates meaningful questions that test real comprehension.",
  },
  {
    icon: Clock,
    title: "Lightning Fast",
    description:
      "Generate comprehensive quizzes in under 2 minutes. No more hours spent creating questions manually.",
  },
  {
    icon: Target,
    title: "High Accuracy",
    description:
      "95% accuracy rate with questions that are relevant, challenging, and properly formatted.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your documents are processed securely and never stored. Complete privacy guaranteed.",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description:
      "Export your questions as PDF, Word, or integrate directly with popular quiz platforms.",
  },
  {
    icon: Repeat,
    title: "Unlimited Usage",
    description:
      "Process as many documents as you need. Perfect for students and educators alike.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            Why Choose ExamVjpPro?
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Powerful features designed to make studying and teaching more
            effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
