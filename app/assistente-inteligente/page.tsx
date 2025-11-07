"use client";
import AiChat from "@/components/chat-ai/AiChat";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Protected from "@/components/protected";
import * as React from "react";
import { trackFeatureInterest } from "@/lib/featureInterest";
import { Lock } from "lucide-react";

export default function Page() {
  const [locked, setLocked] = React.useState(true); // mantém bloqueio da página
  const [showModal, setShowModal] = React.useState(true); // controla exibição do modal

  React.useEffect(() => {
    // registra abertura da página (click no menu)
    trackFeatureInterest("assistente_inteligente", "menu_open");
  }, []);

  async function acceptBeta() {
    trackFeatureInterest("assistente_inteligente", "cta_accept");
    setShowModal(false); // esconde modal, mantém fundo bloqueado
    try { localStorage.setItem('k2on.lock.assistente_inteligente', '1') } catch {}
  }

  async function dismiss() {
    trackFeatureInterest("assistente_inteligente", "cta_dismiss");
    setShowModal(false); // esconde modal, mantém fundo bloqueado
    try { localStorage.setItem('k2on.lock.assistente_inteligente', '1') } catch {}
  }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Assistente inteligente" />
          <div className="relative flex flex-1 min-h-0">
            {/* Conteúdo com blur reduzido quando bloqueado */}
            <div className={locked ? "blur-[1px] pointer-events-none select-none flex-1" : "flex-1"}>
              <AiChat />
            </div>

            {/* Overlay permanente enquanto locked=true; modal é opcional */}
            {locked && (
              <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-background/40">
                {/* Cadeado persistente para indicar recurso bloqueado */}
                {!showModal && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-md border bg-card/80 px-2.5 py-1.5 text-xs shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Recurso em desenvolvimento</span>
                  </div>
                )}

                <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">Funcionalidade em desenvolvimento</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estamos preparando o Assistente Inteligente. Quer ser um dos primeiros a testar quando abrirmos o beta?
                  </p>
                  {showModal ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={dismiss} className="px-3 py-2 text-sm rounded-md border">Agora não</button>
                      <button onClick={acceptBeta} className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground">Quero participar</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Agradecemos seu retorno! Em breve novidades.</span>
                      <button disabled className="px-3 py-2 text-xs rounded-md border">Aguardando liberação</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}
