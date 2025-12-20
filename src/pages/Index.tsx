import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("lumina_user");
    if (user) {
      navigate("/chat");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center glow-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Welcome to Lumina AI
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Your intelligent AI assistant for coding, writing, analysis, and creative problem-solving.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/signup")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary px-8"
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          title="Natural Conversations"
          description="Chat naturally with context-aware responses that understand your needs."
        />
        <FeatureCard
          title="Code Assistant"
          description="Get help with coding, debugging, and learning new programming concepts."
        />
        <FeatureCard
          title="Persistent Memory"
          description="Your conversations are saved and ready when you return."
        />
      </div>

      {/* Footer */}
      <p className="mt-16 text-sm text-muted-foreground">
        Powered by advanced AI technology
      </p>
    </div>
  );
};

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
