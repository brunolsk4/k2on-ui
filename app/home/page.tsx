"use client"
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { StatsCards } from "@/components/new-home/StatsCards"
import { ProjectsSection } from "@/components/new-home/ProjectsSection"
import { DashboardsSection } from "@/components/new-home/DashboardsSection"
import { IntegrationsSection } from "@/components/new-home/IntegrationsSection"
import apiClient from "@/lib/apiClient"

function Greeting() {
  const [firstName, setFirstName] = React.useState<string>("Usuário")
  const [period, setPeriod] = React.useState<"madrugada"|"manhã"|"tarde"|"noite">("manhã")
  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try { const me = await apiClient.me(); if (!cancel) {
        const full = (me as any).nomeCompleto || me.name || "";
        const fn = String(full).trim().split(/\s+/)[0] || ""; setFirstName(fn || "Usuário");
      } } catch {}
    })()
    function compute() { const h = new Date().getHours(); if (h<5) return "madrugada" as const; if (h<12) return "manhã" as const; if (h<18) return "tarde" as const; return "noite" as const }
    setPeriod(compute()); const id = setInterval(()=> setPeriod(compute()), 60000); return ()=> { cancel=true; clearInterval(id) }
  }, [])
  return (
    <p className="text-xl md:text-2xl text-foreground">Olá, <strong className="font-semibold">{firstName}</strong>, boa {period}. Vamos acompanhar seus resultados?</p>
  )
}

export default function NewHomePage() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Home" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6"><Greeting /></div>
              <StatsCards />
              <div className="px-4 lg:px-6"><ProjectsSection /></div>
              <div className="px-4 lg:px-6"><DashboardsSection /></div>
              <div className="px-4 lg:px-6"><IntegrationsSection /></div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
