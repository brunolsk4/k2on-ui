"use client";

import { useMemo, useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatSidebar } from "./ChatSidebar";
import type { ChatItem, Message } from "./types";

export default function AiChat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([
    { id: "1", title: "Qual a melhor campanha?", preview: "A melhor campanha dos ultimos 30 dias...", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "2", title: "Meu resultado foi bom?", preview: "Foi bom em relação ao mês passado, porém...", timestamp: new Date(Date.now() - 1000 * 60 * 60) }
  ]);

  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messages: Message[] = useMemo(() => {
    const key = selectedChatId ?? "__welcome";
    return messagesByChat[key] ?? [];
  }, [messagesByChat, selectedChatId]);

  function ensureChat(chatId: string) {
    setMessagesByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: [] }));
  }

  const handleNewChat = () => {
    const id = String(Date.now());
    const item: ChatItem = { id, title: "Nova conversa", preview: "", timestamp: new Date() };
    setChats((prev) => [item, ...prev]);
    ensureChat(id);
    setSelectedChatId(id);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleNewChat();
    setInput(suggestion);
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!selectedChatId) handleNewChat();
    const chatId = selectedChatId ?? String(Date.now());

    const userMsg: Message = { id: String(Date.now()), role: "user", content: text };
    setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), userMsg] }));
    setInput("");
    setIsLoading(true);
    // Fake assistant response to keep it functional without external deps
    setTimeout(() => {
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: `Entendi: "${text}". Em breve responderemos com integrações reais.`
      };
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), reply] }));
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, preview: text, timestamp: new Date() } : c)));
      setIsLoading(false);
    }, 500);
  }

  return (
    <div className="flex flex-1 min-h-0">
      <ChatSidebar chats={chats} selectedChatId={selectedChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      <div className="flex flex-1 flex-col">
        {!selectedChatId ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ChatInterface
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
