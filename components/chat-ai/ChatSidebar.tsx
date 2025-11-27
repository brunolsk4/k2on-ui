"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import type { ChatItem } from "./types";

interface ChatSidebarProps {
  chats: ChatItem[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

// Lightweight scroll wrapper using div fallback if Radix is not styled
function ScrollContainer({ children }: { children: React.ReactNode }) {
  return <div className="h-full overflow-y-auto">{children}</div>;
}

export function ChatSidebar({ chats, selectedChatId, onNewChat, onSelectChat }: ChatSidebarProps) {
  return (
    <div className="border-r bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-64 shrink-0 flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm font-medium">Conversas</div>
        <Button size="sm" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <ScrollContainer>
        <div className="p-2 space-y-1">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectChat(c.id)}
              className={
                "w-full text-left rounded-md p-3 hover:bg-accent/60 transition-colors " +
                (selectedChatId === c.id ? "bg-accent" : "")
              }
            >
              <div className="text-sm font-medium truncate">{c.title}</div>
              <div className="text-xs text-muted-foreground truncate">{c.preview}</div>
            </button>
          ))}
        </div>
      </ScrollContainer>
    </div>
  );
}
