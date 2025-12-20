import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { Chat, Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// Generate unique ID
const generateId = () => crypto.randomUUID();

// Generate chat title from first message
const generateTitle = (content: string) => {
  const words = content.split(" ").slice(0, 5).join(" ");
  return words.length > 30 ? words.substring(0, 30) + "..." : words;
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, isLoading: authLoading, signOut } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Load chats from database
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      setIsLoadingChats(true);
      try {
        const { data: chatsData, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .order("updated_at", { ascending: false });

        if (chatsError) throw chatsError;

        if (chatsData) {
          const chatsWithMessages: Chat[] = await Promise.all(
            chatsData.map(async (chat) => {
              const { data: messagesData } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", chat.id)
                .order("created_at", { ascending: true });

              return {
                id: chat.id,
                title: chat.title,
                messages: (messagesData || []).map((msg) => ({
                  id: msg.id,
                  role: msg.role as "user" | "assistant",
                  content: msg.content,
                  timestamp: new Date(msg.created_at),
                })),
                createdAt: new Date(chat.created_at),
                updatedAt: new Date(chat.updated_at),
              };
            })
          );
          setChats(chatsWithMessages);
        }
      } catch (error) {
        console.error("Error loading chats:", error);
        toast({
          title: "Error",
          description: "Failed to load chats.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, [user, toast]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null;

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const streamChat = async (
    messages: Array<{ role: string; content: string }>,
    onDelta: (deltaText: string) => void,
    onDone: () => void
  ) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !user) return;

      let currentChatId = activeChatId;
      let isNewChat = false;

      // Create new chat if none active
      if (!currentChatId) {
        isNewChat = true;
        const title = generateTitle(content);

        try {
          const { data: newChatData, error: chatError } = await supabase
            .from("chats")
            .insert({ user_id: user.id, title })
            .select()
            .single();

          if (chatError) throw chatError;

          const newChat: Chat = {
            id: newChatData.id,
            title: newChatData.title,
            messages: [],
            createdAt: new Date(newChatData.created_at),
            updatedAt: new Date(newChatData.updated_at),
          };

          setChats((prev) => [newChat, ...prev]);
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
        } catch (error) {
          console.error("Error creating chat:", error);
          toast({
            title: "Error",
            description: "Failed to create chat.",
            variant: "destructive",
          });
          return;
        }
      }

      // Add user message to database
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      try {
        const { error: msgError } = await supabase.from("messages").insert({
          chat_id: currentChatId,
          role: "user",
          content,
        });

        if (msgError) throw msgError;

        // Update local state
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  title: isNewChat ? generateTitle(content) : chat.title,
                  messages: [...chat.messages, userMessage],
                  updatedAt: new Date(),
                }
              : chat
          )
        );

        // Get AI response with streaming
        setIsLoading(true);

        const chatMessages = chats.find((c) => c.id === currentChatId)?.messages || [];
        const allMessages = [
          ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content },
        ];

        let assistantContent = "";
        const assistantId = generateId();

        await streamChat(
          allMessages,
          (chunk) => {
            assistantContent += chunk;
            setChats((prev) =>
              prev.map((chat) => {
                if (chat.id !== currentChatId) return chat;
                const existingAssistant = chat.messages.find((m) => m.id === assistantId);
                if (existingAssistant) {
                  return {
                    ...chat,
                    messages: chat.messages.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    ),
                  };
                }
                return {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantId,
                      role: "assistant" as const,
                      content: assistantContent,
                      timestamp: new Date(),
                    },
                  ],
                };
              })
            );
          },
          async () => {
            // Save assistant message to database
            if (assistantContent) {
              await supabase.from("messages").insert({
                chat_id: currentChatId,
                role: "assistant",
                content: assistantContent,
              });
            }
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send message.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [activeChatId, chats, user, session, toast]
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/login");
  }, [signOut, navigate, toast]);

  if (authLoading || isLoadingChats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          userName={user.email?.split("@")[0] || "User"}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
