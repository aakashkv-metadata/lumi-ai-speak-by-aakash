import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "chat-message animate-fade-in",
        isUser ? "chat-message-user" : "chat-message-assistant"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            isUser ? "bg-secondary" : "bg-primary"
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-foreground" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground mb-1">
            {isUser ? "You" : "Lumina AI"}
          </div>
          <div className="markdown-content">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="chat-message chat-message-assistant animate-fade-in">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-foreground mb-2">
            Lumina AI
          </div>
          <div className="flex gap-1.5 py-2">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
