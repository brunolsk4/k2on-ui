"use client"
import * as React from "react"
import { KpiCard } from "@/components/kpi-card"
import { FolderKanban, Link } from "lucide-react"
import apiClient from "@/lib/apiClient"

async function countProjetosInstalados(): Promise<number> {
  try {
    const projetos = await apiClient.request<any[]>("/api/projects", { withAuth: true })
    const ids = (projetos || []).map((p:any) => p.id)
    if (!ids.length) return 0
    const mapa = await apiClient.request<Record<string, boolean>>("/api/projetos/status-multiplos", {
      method: "POST",
      body: { ids },
      withAuth: true,
    })
    return Object.values(mapa || {}).filter(Boolean).length
  } catch {
    return 0
  }
}

async function countIntegracoesAtivas(): Promise<number> {
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
  const token = apiClient.getAccessToken()
  const headers: Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
  async function g(path: string) {
    try { const r = await fetch(`${API}${path}`, { headers }); return await r.json() } catch { return null }
  }
  const checks = await Promise.all([
    g("/api/facebook/status").then((d:any)=> d && d.conectado && !d.expirado),
    g("/api/kommo/conexoes").then((d:any)=> Array.isArray(d) && d.length>0),
    g("/api/hotmart/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/activecampaign/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/bitrix/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/pipedrive/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/api4com/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/kiwify/conexoes").then((d:any)=> d?.ok && Array.isArray(d.conexoes) && d.conexoes.length>0),
    g("/api/googleads/check").then((d:any)=> d?.ok && d?.conectado === true),
  ])
  return checks.filter(Boolean).length
}

function useCounts() {
  const [projetos, setProjetos] = React.useState<number>(0)
  const [integracoes, setIntegracoes] = React.useState<number>(0)
  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      const [p, i] = await Promise.all([countProjetosInstalados(), countIntegracoesAtivas()])
      if (!cancel) { setProjetos(p); setIntegracoes(i) }
    })()
    return () => { cancel = true }
  }, [])
  return { projetos, integracoes }
}

export function StatsCards() {
  const { projetos, integracoes } = useCounts()
  const cards = [
    {
      title: "Projetos ativos",
      value: (
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <span>{projetos} instalados</span>
        </div>
      ),
      footerPrimary: <span>Projetos instalados</span>,
      footerSecondary: null as any,
    },
    {
      title: "Integrações conectadas",
      value: (
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          <span>{integracoes} ativas</span>
        </div>
      ),
      footerPrimary: <span>Apenas integrações válidas e ativas</span>,
      footerSecondary: null as any,
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {cards.map((c) => (
        <KpiCard
          key={c.title}
          title={c.title}
          value={c.value}
          footerPrimary={c.footerPrimary}
          footerSecondary={c.footerSecondary || undefined}
        />
      ))}
    </div>
  )
}
