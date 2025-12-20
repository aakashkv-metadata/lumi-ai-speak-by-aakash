import { useRef, useEffect } from "react";
import { Chat } from "@/types/chat";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";

interface ChatAreaProps {
  chat: Chat | null;
  isLoading: boolean;
  userName?: string;
  onSendMessage: (message: string) => void;
}

export function ChatArea({
  chat,
  isLoading,
  userName,
  onSendMessage,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages, isLoading]);

  const hasMessages = chat && chat.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <WelcomeScreen userName={userName} />
        ) : (
          <div className="pb-4">
            {chat.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Lumina AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
