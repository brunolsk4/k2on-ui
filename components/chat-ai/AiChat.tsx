"use client";

import { useMemo, useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";
import { ChatInterface } from "./ChatInterface";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatSidebar } from "./ChatSidebar";
import type { ChatItem, Message } from "./types";
import { AiTypingIndicator } from "./AiTypingIndicator";
import { useRef } from "react";

type Project = { id: number; name: string; empresa_id: number };
type Integration = { name: string; status: string; expires_at: string | null; accounts?: any[]; pipelines?: any[]; customers?: any[] };

export default function AiChat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);

  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(true);
  const [hasAnnouncedContext, setHasAnnouncedContext] = useState(false);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const autoTimers = useRef<number[]>([]);

  const messages: Message[] = useMemo(() => {
    const key = selectedChatId ?? "__welcome";
    return messagesByChat[key] ?? [];
  }, [messagesByChat, selectedChatId]);

  function ensureChat(chatId: string) {
    setMessagesByChat((prev) => (prev[chatId] ? prev : { ...prev, [chatId]: [] }));
  }

  const handleNewChat = () => {
    // Se já existe uma conversa vazia, apenas seleciona ela para evitar múltiplos rascunhos
    const draft = chats.find((c) => (messagesByChat[c.id]?.length ?? 0) === 0);
    if (draft) {
      ensureChat(draft.id);
      setSelectedChatId(draft.id);
      return draft.id;
    }

    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const item: ChatItem = { id, title: "Nova conversa", preview: "", timestamp: new Date() };
    setChats((prev) => [item, ...prev]);
    ensureChat(id);
    setSelectedChatId(id);
    return id;
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
    async function loadProjects() {
      try {
        const resp = await apiClient.request<{ projects: Project[] }>("/api/ai/projects", { withAuth: true });
        if (canceled) return;
        setProjects(resp.projects || []);
        if (resp.projects?.length && !selectedProjectId) {
          setShowProjectModal(true);
        }
      } catch (err) {
        console.warn("Falha ao carregar projetos", err);
      }
    }
    loadProjects();
    return () => {
      canceled = true;
    };
  }, [selectedProjectId]);

  // helper para empurrar mensagens com atraso, simulando digitação
  function enqueueAssistantMessages(chatId: string, items: Message[], gapMs = 1000) {
    autoTimers.current.forEach((t) => clearTimeout(t));
    autoTimers.current = [];
    setIsAutoTyping(true);
    items.forEach((msg, idx) => {
      const timer = window.setTimeout(() => {
        setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), msg] }));
        if (idx === items.length - 1) {
          setIsAutoTyping(false);
        }
      }, gapMs * idx);
      autoTimers.current.push(timer);
    });
  }

  useEffect(() => {
    let canceled = false;
    async function loadIntegrations(projectId?: number | null) {
      if (!projectId) return;
      try {
        const resp = await apiClient.request<{ integrations: Integration[] }>(`/api/ai/projects/${projectId}/integrations`, { withAuth: true });
        if (canceled) return;
        setIntegrations(resp.integrations || []);
        // gera mensagens automáticas informando integrações conectadas
        const connected = (resp.integrations || []).filter((i) => i.status === "connected");
        const names = connected.map((i) => i.name).join(" e ");
        const accountsSummary = connected
          .map((i) => {
            const acc = i.accounts?.[0];
            return acc ? `${i.name.toUpperCase()} (${acc.label || acc.page_id || acc.id})` : i.name.toUpperCase();
          })
          .join(", ");
        if (selectedProjectId && !hasAnnouncedContext) {
          const chatId = selectedChatId ?? handleNewChat();
          const now = Date.now();
          const autoMsgs: Message[] = [
            { id: String(now + 100), role: "assistant", content: "Estou analisando as integrações do projeto…" },
            {
              id: String(now + 101),
              role: "assistant",
              content: connected.length
                ? `Pronto! Encontrei ${names || "nenhuma"} conectados. ${accountsSummary ? `Usarei ${accountsSummary} como fonte padrão.` : ""}`
                : "Nenhuma integração conectada. Você pode conectar uma conta Meta para começar.",
            },
            { id: String(now + 102), role: "assistant", content: "Se quiser mudar a fonte das informações, me avise." },
          ];
          enqueueAssistantMessages(chatId, autoMsgs, 1200);
          setSelectedChatId(chatId);
          setHasAnnouncedContext(true);
        }
      } catch (err) {
        console.warn("Falha ao carregar integrações", err);
      }
    }
    loadIntegrations(selectedProjectId);
    return () => {
      canceled = true;
      autoTimers.current.forEach((t) => clearTimeout(t));
      autoTimers.current = [];
    };
  }, [selectedProjectId]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const chatId = selectedChatId ?? handleNewChat();
    if (!selectedProjectId) {
      const warning: Message = {
        id: String(Date.now() + 3),
        role: "assistant",
        content: "Selecione um projeto para continuar.",
      };
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), warning] }));
      return;
    }

    const userMsg: Message = { id: String(Date.now()), role: "user", content: text };
    setMessagesByChat((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), userMsg] }));
    setInput("");
    setIsLoading(true);
    try {
      const response = await apiClient.request<any>("/api/ai/sendMessage", {
        method: "POST",
        body: {
          message: text,
          project_id: selectedProjectId,
          chat_id: chatId,
          language: "pt-BR",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
        },
        withAuth: true,
      });
      const reply: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: response || { text: "Sem resposta do assistente." },
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

  const isTyping = isLoading || isAutoTyping;

  return (
    <div className="flex flex-1 min-h-0 relative h-screen">
      <ChatSidebar chats={chats} selectedChatId={selectedChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      <div className="flex flex-1 flex-col min-h-0">
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Projeto ativo</p>
            <p className="text-sm font-medium">{projects.find((p) => p.id === selectedProjectId)?.name || "Nenhum"}</p>
          </div>
          <button
            className="text-sm rounded-md border px-3 py-2"
            onClick={() => {
              setShowProjectModal(true);
              setSelectedProjectId(null);
              setIntegrations([]);
              setSelectedChatId(null);
              setMessagesByChat({});
            }}
          >
            Trocar projeto
          </button>
        </div>
        <div className="flex-1 min-h-0">
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
        {isTyping && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
            <AiTypingIndicator />
          </div>
        )}
      </div>
      {showProjectModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border bg-card p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-1">Selecione o projeto</h2>
            <p className="text-sm text-muted-foreground mb-6">Vamos organizar seu contexto antes de conversar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setHasAnnouncedContext(false);
                    setMessagesByChat({});
                    setSelectedChatId(null);
                    setIntegrations([]);
                    setShowProjectModal(false);
                  }}
                  className={
                    "border rounded-xl p-4 text-left hover:border-primary transition " +
                    (selectedProjectId === p.id ? "border-primary bg-primary/5" : "border-input")
                  }
                >
                  <div className="text-base font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Projeto #{p.id}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                disabled={!selectedProjectId}
                onClick={() => setShowProjectModal(false)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
