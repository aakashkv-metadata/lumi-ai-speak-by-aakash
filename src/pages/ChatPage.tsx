import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { Chat, Message, User } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate chat title from first message
const generateTitle = (content: string) => {
  const words = content.split(" ").slice(0, 5).join(" ");
  return words.length > 30 ? words.substring(0, 30) + "..." : words;
};

// Mock AI response - will be replaced with Flowise integration
const mockAIResponse = async (message: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const responses = [
    `I understand you're asking about "${message.substring(0, 50)}...". Let me help you with that.\n\n**Here's what I can tell you:**\n\n1. First, it's important to consider the context\n2. Second, there are several approaches you might take\n3. Finally, I'd recommend starting with the basics\n\nWould you like me to elaborate on any of these points?`,
    `Great question! Let me break this down for you:\n\n\`\`\`javascript\n// Example code\nconst solution = () => {\n  return "Here's a helpful example";\n};\n\`\`\`\n\nThis approach works well because it keeps things simple and maintainable. Let me know if you need more details!`,
    `I'd be happy to help with that!\n\n> Key insight: The most effective approach often combines multiple strategies.\n\n**Steps to follow:**\n- Start by understanding the problem\n- Break it into smaller parts\n- Test each component individually\n- Combine and refine\n\nIs there a specific aspect you'd like me to focus on?`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("lumina_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Load chats from localStorage
  useEffect(() => {
    const storedChats = localStorage.getItem("lumina_chats");
    if (storedChats) {
      const parsed = JSON.parse(storedChats);
      setChats(parsed.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      })));
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("lumina_chats", JSON.stringify(chats));
    }
  }, [chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  const handleNewChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Create new chat if none active
    let currentChatId = activeChatId;
    if (!currentChatId) {
      const newChat: Chat = {
        id: generateId(),
        title: generateTitle(content),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChats((prev) => [newChat, ...prev]);
      currentChatId = newChat.id;
      setActiveChatId(currentChatId);
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? generateTitle(content) : chat.title,
              messages: [...chat.messages, userMessage],
              updatedAt: new Date(),
            }
          : chat
      )
    );

    // Get AI response
    setIsLoading(true);
    try {
      const response = await mockAIResponse(content);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : chat
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, toast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("lumina_user");
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  }, [navigate, toast]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isCollapsed={isSidebarCollapsed}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatArea
          chat={activeChat}
          isLoading={isLoading}
          userName={user.name}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
