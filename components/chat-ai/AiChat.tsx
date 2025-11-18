"use client";

import { useMemo, useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { ChatInterface } from "./ChatInterface";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatSidebar } from "./ChatSidebar";
import type { ChatItem, Message } from "./types";

type ConnectionInfo = { id: number; label: string; pageId: string; projectId: number };

export default function AiChat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([
    { id: "1", title: "Qual a melhor campanha?", preview: "A melhor campanha dos ultimos 30 dias...", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: "2", title: "Meu resultado foi bom?", preview: "Foi bom em relação ao mês passado, porém...", timestamp: new Date(Date.now() - 1000 * 60 * 60) }
  ]);

  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<number | null>(null);

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

  useEffect(() => {
    let canceled = false;
    async function loadConnections() {
      try {
        const response = await apiClient.request<{ connections: ConnectionInfo[] }>("/api/ai/connections", {
          withAuth: true,
        });
        if (canceled) return;
        const available = response.connections || [];
        setConnections(available);
        if (available.length) {
          setActiveConnectionId((prev) => prev ?? available[0].id);
        }
      } catch {
        console.warn("Falha ao carregar conexões Meta");
      }
    }
    loadConnections();
    return () => {
      canceled = true;
    };
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  const activeConnection = useMemo(
    () => connections.find((conn) => conn.id === activeConnectionId) ?? null,
    [connections, activeConnectionId]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!selectedChatId) handleNewChat();
    const chatId = selectedChatId ?? String(Date.now());
    if (!activeConnection) {
      const warning: Message = {
        id: String(Date.now() + 3),
        role: "assistant",
        content: "Selecione uma conta Meta na parte superior para continuar.",
      };
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), warning] }));
      return;
    }

    const userMsg: Message = { id: String(Date.now()), role: "user", content: text };
    setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), userMsg] }));
    setInput("");
    setIsLoading(true);
    try {
      const response = await apiClient.request<{ output: string }>("/api/ai/sendMessage", {
        method: "POST",
        body: { message: text, projeto_id: activeConnection.projectId },
        withAuth: true,
      });
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: response.output || "Sem resposta do assistente.",
      };
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), reply] }));
    } catch (error) {
      const errorMsg: Message = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: "Erro ao contatar o assistente. Tente novamente.",
      };
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), errorMsg] }));
    } finally {
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, preview: text, timestamp: new Date() } : c)));
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-0">
      <ChatSidebar chats={chats} selectedChatId={selectedChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      <div className="flex flex-1 flex-col">
        <div className="border-b px-6 py-4">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Conta Meta ativa</label>
          <div className="mt-2 flex gap-2">
            <select
            value={activeConnectionId ?? ""}
            onChange={(event) => {
              const id = Number(event.target.value);
              if (!id) return;
              setActiveConnectionId(id);
            }}
            disabled={!connections.length}
            className="rounded-md border border-input px-3 py-2 text-sm"
          >
            <option value="">Selecione uma conta</option>
            {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.label}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Escolha a conta Meta Ads que alimenta o assistente.</p>
        </div>
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
