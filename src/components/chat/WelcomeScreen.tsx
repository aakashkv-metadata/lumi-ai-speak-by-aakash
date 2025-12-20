import { Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  userName?: string;
}

export function WelcomeScreen({ userName }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 glow-pulse">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 text-center">
        {userName ? `Hey, ${userName}. Ready to dive in?` : "How can I help you today?"}
      </h1>
      <p className="text-muted-foreground text-center max-w-md">
        Start a conversation with Lumina AI. I'm here to help with coding, writing, analysis, and more.
      </p>
    </div>
  );
}
