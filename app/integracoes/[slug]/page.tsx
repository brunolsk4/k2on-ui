"use client"
import * as React from "react"
import { useParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Link as LinkIcon } from "lucide-react"
import apiClient from "@/lib/apiClient"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type Conn = { id: number|string; label: string; googleads_id?: number; account_id?: string }

function connectHrefBySlug(slug: string): string {
  switch (slug) {
    case 'meta': return '/app/meta-conectar'
    case 'googleads': return '/app/googleads-conectar'
    case 'kommo': return '/app/kommo-conectar-oauth'
    case 'activecampaign': return '/app/activecampaign-conectar'
    case 'pipedrive': return '/app/pipedrive-conectar'
    case 'bitrix': return '/app/bitrix-conectar'
    case 'hotmart': return '/app/hotmart-conectar'
    case 'api4com': return '/app/api4com-conectar'
    default: return '#'
  }
}

async function fetchConnections(slug: string): Promise<Conn[]> {
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
  const token = apiClient.getAccessToken();
  const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
  const j = async (p:string) => { const r = await fetch(`${API}${p}`, { headers }); return r.ok ? (await r.json()) : null }
  switch (slug) {
    case 'kommo': {
      const d:any = await j('/api/kommo/conexoes');
      const arr = Array.isArray(d)?d:(Array.isArray(d?.conexoes)?d.conexoes:[]);
      return arr.map((c:any)=>({ id: c.id || c.pk_id || c.subdominio, label: c.subdominio || `Kommo ${c.id}` }))
    }
    case 'googleads': {
      const d:any = await j('/api/googleads/conexoes');
      const arr = Array.isArray(d?.conexoes)?d.conexoes:[];
      return arr.map((c:any)=>({ id: `${c.googleads_id}:${c.account_id}`, label: c.nome || c.account_id, googleads_id: Number(c.googleads_id), account_id: String(c.account_id) }))
    }
    case 'meta': {
      try {
        const status = await apiClient.request<{ conectado: boolean }>('/api/facebook/status', { withAuth: true });
        if (!status?.conectado) return [];
      } catch {
        return [];
      }
      try {
        const contas = await apiClient.request<Array<{ id: string; nome?: string }>>('/api/meta/accounts', { withAuth: true });
        if (Array.isArray(contas) && contas.length > 0) {
          return contas.map((c) => ({ id: c.id, label: c.nome || c.id }));
        }
      } catch (e) {
        console.warn('Falha ao carregar contas Meta:', e);
      }
      return [{ id: 'meta', label: 'Conta Meta conectada' }];
    }
    default:
      return []
  }
}

async function disconnectAll(slug: string): Promise<boolean> {
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
  const token = apiClient.getAccessToken();
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  let endpoint = ''
  if (slug==='meta') endpoint = '/api/facebook/disconnect'
  else if (slug==='googleads') endpoint = '/api/googleads/disconnect'
  else return false
  const r = await fetch(`${API}${endpoint}`, { method: 'DELETE', headers })
  return r.ok
}

export default function IntegracaoEditarPage(){
  const routeParams = useParams() as { slug?: string }
  const slug = String(routeParams && routeParams.slug ? routeParams.slug : '').toLowerCase()
  const [loading, setLoading] = React.useState(true)
  const [connections, setConnections] = React.useState<Conn[]>([])
  const groups = React.useMemo(()=>{
    if (slug !== 'googleads') return null as any;
    const map: Record<string, { googleads_id: number, contas: Conn[] }> = {};
    for (const c of connections) {
      const gid = String(c.googleads_id||'');
      if (!gid) continue;
      if (!map[gid]) map[gid] = { googleads_id: Number(gid), contas: [] };
      map[gid].contas.push(c);
    }
    return Object.values(map);
  }, [slug, connections])
  const [status, setStatus] = React.useState<'connected'|'disconnected'|'unknown'>('unknown')

  React.useEffect(()=>{ (async()=>{
    setLoading(true)
    try{
      const list = await fetchConnections(slug)
      setConnections(list)
      setStatus(list.length>0 ? 'connected':'disconnected')
    } finally { setLoading(false) }
  })() },[slug])

  const nome = {
    kommo: 'Kommo CRM', googleads: 'Google Ads', meta: 'Meta Ads',
    activecampaign: 'ActiveCampaign', pipedrive: 'Pipedrive', bitrix: 'Bitrix24',
    hotmart: 'Hotmart', api4com: 'Api4com'
  }[slug] || 'Integração'

  const connectHref = connectHrefBySlug(slug)
  const canDisconnectAll = ['meta','googleads'].includes(slug)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={`Integração: ${nome}`} />
        <div className="p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/app/integracoes">Integracoes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{nome}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Tabs defaultValue="conexoes" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conexoes">Conexões</TabsTrigger>
                <TabsTrigger value="config">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="conexoes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status</CardTitle>
                    <CardDescription>Gerencie conexões, reconecte ou desconecte.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {status==='connected' ? (
                      <Badge variant="outline" className="bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4"/> Conectado {connections.length?`(${connections.length})`:''}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1">
                        <LinkIcon className="h-4 w-4"/> Desconectado
                      </Badge>
                    )}
                    <div className="flex items-center gap-2">
                      {canDisconnectAll && status==='connected' ? (
                        <Button size="sm" variant="outline" onClick={async()=>{
                          const ok = window.confirm('Isto irá desconectar todas as conexões desta integração. Continuar?')
                          if (!ok) return
                          const done = await disconnectAll(slug)
                          if (done) { setConnections([]); setStatus('disconnected') }
                          else { try{ alert('Falha ao desconectar.')}catch{} }
                        }}>Desconectar tudo</Button>
                      ) : null}
                      {connectHref !== '#' ? (
                        <Button size="sm" onClick={()=>{ window.location.href = connectHref }}>{status==='connected'?'Reconfigurar':'Conectar'}</Button>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Conexões</div>
                  <div className="rounded-md border divide-y">
                    {loading ? (
                      <div className="p-3 text-sm text-muted-foreground">Carregando…</div>
                    ) : slug==='googleads' && groups && groups.length ? (
                      groups.map((g: any)=> (
                        <div key={`ga-${g.googleads_id}`} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Login Google Ads #{g.googleads_id}</div>
                            <Button size="sm" variant="destructive" onClick={async()=>{
                              const ok = window.confirm('Desconectar este login do Google Ads? (remove vínculos de projetos)')
                              if (!ok) return
                              const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
                              const token = apiClient.getAccessToken();
                              const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
                              const r = await fetch(`${API}/api/googleads/disconnect/${encodeURIComponent(String(g.googleads_id))}`, { method: 'DELETE', headers })
                              if (r.ok) {
                                setConnections(connections.filter(c=> String(c.googleads_id)!==String(g.googleads_id)))
                                if (connections.filter(c=> String(c.googleads_id)!==String(g.googleads_id)).length===0) setStatus('disconnected')
                              } else { try{ alert('Falha ao desconectar login Google Ads.') }catch{} }
                            }}>Desconectar login</Button>
                          </div>
                          <ul className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-1">
                            {g.contas.map((c: any)=> (<li key={String(c.id)}>{c.label}</li>))}
                          </ul>
                        </div>
                      ))
                    ) : connections.length ? (
                      connections.map((c)=> (
                        <div key={String(c.id)} className="p-3 flex items-center justify-between">
                          <div className="text-sm">{c.label}</div>
                          {slug==='kommo' ? (
                            <Button size="sm" variant="destructive" onClick={async()=>{
                              const ok = window.confirm('Desconectar esta conta Kommo? Isto removerá vínculos de projetos.')
                              if (!ok) return
                              const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
                              const token = apiClient.getAccessToken();
                              const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
                              const r = await fetch(`${API}/api/kommo/disconnect/${encodeURIComponent(String(c.id))}`, { method: 'DELETE', headers })
                              if (r.ok) { setConnections(connections.filter(x=> String(x.id)!==String(c.id))); if (connections.length<=1) setStatus('disconnected') }
                              else { try{ alert('Falha ao desconectar conta Kommo.') }catch{} }
                            }}>Desconectar</Button>
                          ) : null}
                        </div>
                      ))
                    ) : (
                        <div className="p-3 text-sm text-muted-foreground">Nenhuma conexão.</div>
                      )}
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configurações</CardTitle>
                    <CardDescription>Preferências e informações da integração.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">Nenhuma configuração adicional disponível.</div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
