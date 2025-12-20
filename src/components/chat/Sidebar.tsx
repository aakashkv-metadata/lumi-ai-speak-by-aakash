import { Plus, MessageSquare, Settings, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  isCollapsed: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  isCollapsed,
  onNewChat,
  onSelectChat,
  onToggleCollapse,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">Lumina AI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className={cn(
            "w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border",
            isCollapsed ? "px-0" : "justify-start gap-3"
          )}
          variant="ghost"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>New chat</span>}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        {!isCollapsed && chats.length > 0 && (
          <div className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Your chats
          </div>
        )}
        <div className="space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "sidebar-item w-full",
                activeChatId === chat.id && "sidebar-item-active",
                isCollapsed && "justify-center px-0"
              )}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && (
                <span className="truncate text-left">{chat.title}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          className={cn(
            "sidebar-item w-full",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          onClick={onLogout}
          className={cn(
            "sidebar-item w-full text-destructive hover:text-destructive",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
