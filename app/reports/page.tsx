"use client";

import * as React from "react";
import Protected from "@/components/protected";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Lock, Plus } from "lucide-react";
import { ReportCard, type Report } from "@/components/reports/ReportCard";
import { trackFeatureInterest } from "@/lib/featureInterest";

export default function Page() {
  const [locked, setLocked] = React.useState(true);
  const [showModal, setShowModal] = React.useState(true);

  React.useEffect(() => {
    try { trackFeatureInterest('reports', 'menu_open') } catch {}
  }, []);

  // Mock local de relatórios
  const reports: Report[] = [
    { id: "1", name: "Resumo diário de vendas", status: "active", lastSent: "Hoje, 09:00", project: "E-commerce Principal" },
    { id: "2", name: "Performance Meta Ads - Semanal", status: "active", lastSent: "Ontem, 18:00", project: "Campanha Verão 2024" },
    { id: "3", name: "Leads Kommo - Diário", status: "paused", lastSent: "Há 3 dias, 10:00", project: "Geração de Leads" },
    { id: "4", name: "Análise de ROI Mensal", status: "error", lastSent: "Há 1 semana, 09:00", project: "E-commerce Principal" },
    { id: "5", name: "Conversões por Canal", status: "active", lastSent: "Hoje, 06:00", project: "Multi-canal 2024" },
    { id: "6", name: "Custos de Aquisição", status: "active", lastSent: "Hoje, 08:30", project: "Campanha Verão 2024" },
  ];

  function accept() { try { trackFeatureInterest('reports','cta_accept'); localStorage.setItem('k2on.lock.reports','1') } catch {}; setShowModal(false); }
  function dismiss() { try { trackFeatureInterest('reports','cta_dismiss'); localStorage.setItem('k2on.lock.reports','1') } catch {}; setShowModal(false); }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Relatórios" />
          <div className="relative p-4 lg:p-6">
            {/* Conteúdo com blur leve e bloqueio de interação quando locked */}
            <div className={locked ? "blur-[1px] pointer-events-none select-none" : ""}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Relatórios agendados</h2>
                  <p className="text-sm text-muted-foreground">Gerencie envios automáticos</p>
                </div>
                <Button className="gap-2" disabled>
                  <Plus className="h-4 w-4" />
                  Novo relatório
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((r, i) => (
                  <ReportCard key={r.id} report={r} style={{ animationDelay: `${i * 50}ms` }} />
                ))}
              </div>
            </div>

            {/* Overlay apenas sobre o conteúdo (não bloqueia sidebar/header) */}
            {locked && (
              <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-background/40">
                {/* Cadeado persistente quando modal fechado */}
                {!showModal && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-md border bg-card/80 px-2.5 py-1.5 text-xs shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Recurso em desenvolvimento</span>
                  </div>
                )}

                {/* Modal inicial */}
                {showModal && (
                  <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Funcionalidade em desenvolvimento</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Estamos preparando os Relatórios Agendados. Quer ser um dos primeiros a testar quando abrirmos o beta?
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={dismiss} className="px-3 py-2 text-sm rounded-md border">Agora não</button>
                      <button onClick={accept} className="px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground">Quero participar</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}
