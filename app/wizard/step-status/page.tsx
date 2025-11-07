"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import apiClient from "@/lib/apiClient"

type Etapa = { ordem:number; descricao:string; status:'pendente'|'em_andamento'|'concluido'|'erro' }

export default function WizardStepStatus(){
  const [projetoId, setProjetoId] = React.useState<number | null>(null)
  const [templateId, setTemplateId] = React.useState<number | null>(null)
  const [projeto, setProjeto] = React.useState<any>(null)
  const [etapas, setEtapas] = React.useState<Etapa[]>([])
  const [installStarted, setInstallStarted] = React.useState(false)
  const [done, setDone] = React.useState(false)

  React.useEffect(()=>{ try{ const sp=new URLSearchParams(window.location.search); const pid=Number(sp.get('projetoId')||0)||null; const tid=Number(sp.get('templateId')||0)||null; setProjetoId(pid); setTemplateId(tid) }catch{} },[])

  React.useEffect(()=>{ (async()=>{ if (!projetoId) return; try{ const p = await apiClient.request<any>(`/api/projects/${projetoId}`, { withAuth: true }); setProjeto(p) } catch {} })() },[projetoId])

  React.useEffect(()=>{ (async()=>{
    if (!projetoId || !templateId || installStarted) return
    setInstallStarted(true)
    try { await apiClient.request(`/api/wizard/execucao`, { method:'POST', body:{ projetoId, templateId }, withAuth:true }) } catch {}
  })() },[projetoId, templateId, installStarted])

  React.useEffect(()=>{
    let t: any
    async function tick(){
      if (!projetoId) return
      try {
        const e = await apiClient.request<Etapa[]>(`/api/wizard/etapas?projetoId=${projetoId}`, { withAuth: true })
        setEtapas(Array.isArray(e)?e:[])
      } catch {}
      try {
        const s:any = await apiClient.request(`/api/wizard/status?projetoId=${projetoId}`, { withAuth: true })
        if (s?.status === 'concluido') { setDone(true) }
      } catch {}
      t = setTimeout(tick, 1500)
    }
    tick()
    return ()=> { if (t) clearTimeout(t) }
  },[projetoId])

  const total = etapas.length || 1
  const concluidas = etapas.filter(e=> e.status==='concluido').length
  const progresso = Math.round((concluidas / total) * 100)

  function goToDashboard(){
    if (!projeto) return
    const engine = String(projeto.engine||'').toLowerCase()
    if (engine === 'go') {
      // Mantém URL genérica: resolve o template por trás dos panos
      window.location.href = `/app/dashboards/go?id=${projeto.id}`
    } else {
      window.location.href = `/dashboard-powerbi.html?id=${projeto.id}`
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={projeto?.nome ? `Projeto: ${projeto.nome}` : 'Instalação'} />
        <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mt-2 mb-4 text-center">Instalação em andamento</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progresso} />
              <ul className="text-sm space-y-1">
                {etapas.map((e)=> (
                  <li key={e.ordem} className="flex items-center justify-between">
                    <span>{e.descricao}</span>
                    <span className={`text-xs ${e.status==='concluido'?'text-emerald-600': e.status==='erro'?'text-red-600':'text-muted-foreground'}`}>{e.status.replace('_',' ')}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" onClick={()=>{
              const q = new URLSearchParams({ ...(projetoId?{projetoId:String(projetoId)}:{} ), ...(templateId?{templateId:String(templateId)}:{}) }).toString()
              window.location.href = `/ui/wizard/step-accounts?${q}`
            }}>← Voltar</Button>
            {done ? (
              <Button onClick={goToDashboard}>Ir para o Dashboard</Button>
            ) : (
              <Button disabled>Processando…</Button>
            )}
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
