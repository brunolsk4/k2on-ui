"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/lib/apiClient"
import { trackFeatureInterest } from "@/lib/featureInterest"

type Integracao = { id:number; nome:string; icone?:string|null; conectado?:boolean }

function deriveSlug(nome:string){
  const n = nome.toLowerCase()
  if (n.includes('google') && n.includes('ads')) return 'googleads'
  if (n.includes('activecampaign')) return 'activecampaign'
  if (n.includes('pipedrive')) return 'pipedrive'
  if (n.includes('bitrix')) return 'bitrix'
  if (n.includes('hotmart')) return 'hotmart'
  if (n.includes('kiwify')) return 'kiwify'
  if (n.includes('api4com')) return 'api4com'
  if (n.includes('kommo')) return 'kommo'
  if (n.includes('meta') || n.includes('facebook')) return 'meta'
  return 'default'
}

function connectHref(slug:string, redirectTo:string): string {
  switch (slug) {
    case 'meta': return `/app/meta-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'googleads': return `/app/googleads-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'kommo': return `/app/kommo-conectar-oauth?redirect=${encodeURIComponent(redirectTo)}`
    case 'activecampaign': return `/app/activecampaign-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'pipedrive': return `/app/pipedrive-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'bitrix': return `/app/bitrix-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'hotmart': return `/app/hotmart-conectar?redirect=${encodeURIComponent(redirectTo)}`
    case 'kiwify': return `/kiwify-conectar.html`
    case 'api4com': return `/app/api4com-conectar?redirect=${encodeURIComponent(redirectTo)}`
    default: return '#'
  }
}

export default function WizardStepIntegrations(){
  const [projetoNome, setProjetoNome] = React.useState<string>("Status das integrações")
  const [templateId, setTemplateId] = React.useState<number | null>(null)
  const [projetoId, setProjetoId] = React.useState<number | null>(null)
  const [items, setItems] = React.useState<Integracao[]>([])
  const [loading, setLoading] = React.useState(true)
  const [kommoError, setKommoError] = React.useState<string| null>(null)

  const redirectTo = React.useMemo(()=>{
    if (typeof window === 'undefined') return '/app/wizard/step-integrations'
    return `${window.location.origin}/app/wizard/step-integrations${window.location.search || ''}`
  }, [])

  React.useEffect(()=>{ try{ const sp = new URLSearchParams(window.location.search); setTemplateId(Number(sp.get('templateId')||0)||null); const pid=Number(sp.get('projetoId')||0)||null; setProjetoId(pid); const ke=sp.get('kommoError'); if (ke) { setKommoError(ke); trackFeatureInterest('kommo_oauth','menu_open',{ error: ke, page:'wizard_step_integrations' }).catch(()=>{}) } }catch{} },[])
  // Exige projetoId; se não houver, usuário deve criá-lo na tela de criação

  React.useEffect(()=>{ (async()=>{
    try{
      if (projetoId) { const p = await apiClient.request<any>(`/api/projects/${projetoId}`, { withAuth: true }); setProjetoNome(p?.nome ? `Projeto: ${p.nome}` : 'Status das integrações') }
    } catch {}
  })() },[projetoId])

  React.useEffect(()=>{ (async()=>{
    if (!templateId) { setItems([]); setLoading(false); return }
    setLoading(true)
    try{
      const data = await apiClient.request<Integracao[]>(`/api/templates/${templateId}/integracoes`, { withAuth: true }) as any
      setItems(Array.isArray(data)?data:[])
    } finally { setLoading(false) }
  })() },[templateId])

  const allConnected = items.length>0 && items.every(i=> i.conectado)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={projetoNome} />
        <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mt-2 mb-4 text-center">Status das integrações</h2>

          {kommoError === 'connected_to_other_company' ? (
            <div className="text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2">
              Essa conta do Kommo já está conectada em outra empresa. <a className="underline" href="https://wa.me/+5544988283140" target="_blank" rel="noreferrer">Fale com o nosso suporte</a>.
            </div>
          ) : null}

          {loading ? (<div className="text-sm text-muted-foreground">Verificando conexões…</div>) : (
            <div className="grid gap-3">
              {items.map((it)=>{
                const slug = deriveSlug(it.nome)
                const href = connectHref(slug, `/app/wizard/step-integrations?${new URLSearchParams({ templateId: String(templateId||''), ...(projetoId?{projetoId:String(projetoId)}:{} ) }).toString()}`)
                return (
                  <Card key={it.id} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{it.nome}</CardTitle>
                      <CardDescription className="text-xs">
                        {it.conectado ? (
                          <Badge variant="outline" className="bg-success/10 text-success">Conectado</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive">Desconectado</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{it.conectado ? 'Tudo certo com esta integração' : 'Clique em conectar para autenticar sua conta'}</div>
                      {!it.conectado ? (
                        <Button size="sm" onClick={()=> { window.location.href = href }}>Conectar</Button>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" onClick={()=>{
              const q = new URLSearchParams({ ...(projetoId?{projetoId:String(projetoId)}:{} ) }).toString()
              window.location.href = `/app/wizard/step-template${q?`?${q}`:''}`
            }}>← Voltar</Button>
            <Button disabled={!allConnected} onClick={()=>{
              const q = new URLSearchParams({ ...(projetoId?{projetoId:String(projetoId)}:{} ), ...(templateId?{templateId:String(templateId)}:{}) }).toString()
              window.location.href = `/app/wizard/step-accounts?${q}`
            }}>Avançar →</Button>
            <Button variant="ghost" onClick={()=> window.location.reload()}>Atualizar status</Button>
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
