import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content:
      "ExamVjpPro has revolutionized my study routine. I can now create practice questions from my lecture notes in minutes instead of hours.",
    rating: 5,
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Professor of Biology",
    content:
      "As an educator, this tool saves me countless hours. The questions generated are thoughtful and test real understanding.",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "Law Student",
    content:
      "The accuracy is incredible. The AI understands complex legal concepts and creates questions that actually help me learn.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            Loved by Students & Educators
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Join thousands who have transformed their learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
