"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Link as LinkIcon, Filter } from "lucide-react"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"
import { trackFeatureInterest } from "@/lib/featureInterest"

type Integracao = { id:number; nome:string; icone?:string|null; categorias?:string[] }
type View = Integracao & { status: 'connected'|'disconnected'|'connect'; count:number; connections:string[] }

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
  if (n.includes('meta')) return 'meta'
  return 'default'
}

async function fetchStatus(slug:string): Promise<{ count:number; ok:boolean; list:string[] } | null> {
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
  const token = apiClient.getAccessToken();
  const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
  const g = async (p:string) => { try{ const r = await fetch(`${API}${p}`, { headers }); return await r.json() } catch { return null } }
  switch(slug){
    case 'meta': { const d:any = await g('/api/facebook/status'); return { count: d&&d.conectado&&!d.expirado?1:0, ok:Boolean(d&&d.conectado), list: [] } }
    case 'googleads': {
      // Estratégia leve (usada no app antigo): usar /api/googleads/check para status rápido
      const d:any = await g('/api/googleads/check');
      const connected = Boolean(d?.ok && (d?.conectado === true || d?.connected === true));
      return { count: connected ? 1 : 0, ok: Boolean(d?.ok), list: [] }
    }
    case 'pipedrive': { const d:any = await g('/api/pipedrive/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.company_name||c.company_domain||`Pipedrive ${c.id}`) } }
    case 'bitrix': { const d:any = await g('/api/bitrix/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.nome || `Bitrix ${c.id}`) } }
    case 'activecampaign': { const d:any = await g('/api/activecampaign/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.nome || c.account_name || `Active ${c.id}`) } }
    case 'hotmart': { const d:any = await g('/api/hotmart/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.nome || `Hotmart ${c.id}`) } }
    case 'kiwify': { const d:any = await g('/api/kiwify/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.nome || `Kiwify ${c.id}`) } }
    case 'api4com': { const d:any = await g('/api/api4com/conexoes'); const a = Array.isArray(d?.conexoes)?d.conexoes:[]; return { count:a.length, ok:Boolean(d?.ok), list:a.map((c:any)=> c.token_api ? `Token •••${String(c.token_api).slice(-4)}` : `API4COM ${c.id}`) } }
    case 'kommo': { const d:any = await g('/api/kommo/conexoes'); const a = Array.isArray(d)?d:(Array.isArray(d?.conexoes)?d.conexoes:[]); return { count:a.length, ok:true, list:a.map((c:any)=> c.subdominio || `Kommo ${c.id}`) } }
    default: return null
  }
}

function connectHrefBySlug(slug: string): string {
  switch (slug) {
    case 'meta': return '/app/meta-conectar'
    case 'googleads': return '/app/googleads-conectar'
    // Kommo tem fluxo OAuth separado (OAuth2)
    case 'kommo': return '/app/kommo-conectar-oauth'
    // Demais usam páginas no Next (UI)
    case 'activecampaign': return '/app/activecampaign-conectar'
    case 'pipedrive': return '/app/pipedrive-conectar'
    case 'bitrix': return '/app/bitrix-conectar'
    case 'hotmart': return '/app/hotmart-conectar'
    case 'kiwify': return '/kiwify-conectar.html' // já existe estática
    case 'api4com': return '/app/api4com-conectar'
    default: return '#'
  }
}

export default function IntegracoesPage(){
  const [items, setItems] = React.useState<View[]>([])
  const [allCats, setAllCats] = React.useState<string[]>([])
  const [query, setQuery] = React.useState("")
  const [selCats, setSelCats] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({})
  const [kommoError, setKommoError] = React.useState<string | null>(null)

  async function disconnectBySlug(slug: string): Promise<{ ok: boolean; removed?: number; error?: string }>{
    try {
      const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
      const token = apiClient.getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      let endpoint = "";
      if (slug === 'meta') endpoint = '/api/facebook/disconnect';
      else if (slug === 'googleads') endpoint = '/api/googleads/disconnect';
      else return { ok: false, error: 'unsupported' };
      const resp = await fetch(`${API}${endpoint}`, { method: 'DELETE', headers });
      const data = await resp.json().catch(()=> ({}));
      return { ok: Boolean(resp.ok && (data?.ok !== false)), removed: Number(data?.removed||0) } as any;
    } catch (e:any) {
      return { ok: false, error: String(e?.message||e) };
    }
  }

  function markDisconnected(slug: string) {
    setItems((prev) => prev.map((it) => {
      const s = deriveSlug(it.nome);
      if (s === slug) return { ...it, status: 'disconnected', count: 0, connections: [] } as View;
      return it;
    }));
  }

  React.useEffect(()=>{ (async()=>{
    setLoading(true)
    try{
      try{ const sp = new URLSearchParams(window.location.search); const ke = sp.get('kommoError'); if (ke) setKommoError(ke) } catch{}
      const data = await apiClient.request<Integracao[]>("/api/integracoes") as any
      const cats = Array.from(new Set((data||[]).flatMap((d:any)=> d.categorias||[]))).map(String).sort()
      setAllCats(cats as string[])
      // cria views sem status e resolve status em paralelo
      const base: View[] = (data||[]).map((d:any)=> ({ ...d, categorias:d.categorias||[], status:'connect', count:0, connections:[] }))
      setItems(base)
      // resolve status por item
      base.forEach(async (it, idx)=>{
        const slug = deriveSlug(it.nome)
        const s = await fetchStatus(slug).catch(()=>null)
        setItems(prev=>{
          const arr = [...prev]
          const curr = arr[idx]
          if (!curr) return prev
          const connected = (s?.count||0) > 0
          arr[idx] = { ...curr, count: s?.count||0, connections: s?.list||[], status: connected ? 'connected' : (s && s.ok===false ? 'disconnected' : 'connect') }
          return arr
        })

        // background: se estiver conectado, buscar conexões detalhadas e atualizar sem travar a UI
        if (slug === 'googleads' && s && (s.count||0) > 0) {
          try {
            const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
            const token = apiClient.getAccessToken();
            const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
            const r = await fetch(`${API}/api/googleads/conexoes`, { headers })
            if (r.ok) {
              const d:any = await r.json().catch(()=>null)
              const a = Array.isArray(d?.conexoes) ? d.conexoes : []
              setItems(prev=>{
                const arr = [...prev]
                const curr = arr[idx]
                if (!curr) return prev
                arr[idx] = { ...curr, count: a.length || curr.count, connections: a.map((c:any)=> c.nome || c.account_id || String(c.id)) }
                return arr
              })
            }
          } catch {}
        }
      })
    } finally{ setLoading(false) }
  })() },[])

  const filtered = items
    .filter(i => !query || i.nome.toLowerCase().includes(query.toLowerCase()))
    .filter(i => !selCats.length || i.categorias?.some(c => selCats.includes(c)))
    .sort((a,b)=>{
      const ac = a.status==='connected'?1:0, bc=b.status==='connected'?1:0
      if (bc!==ac) return bc-ac
      if (b.count!==a.count) return b.count-a.count
      return a.nome.localeCompare(b.nome)
    })

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectores e Apps" />
          <div className="p-4 lg:p-6">
          {kommoError === 'connected_to_other_company' ? (
            <div className="mb-4 text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2">
              Essa conta do Kommo já está conectada em outra empresa. <a className="underline" href="https://wa.me/+5544988283140" target="_blank" rel="noreferrer">Fale com o nosso suporte</a>.
            </div>
          ) : null}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 max-w-md">
              <Input placeholder="Buscar integrações..." value={query} onChange={e=>setQuery(e.target.value)} />
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2"/>Filtros</Button>
          </div>

          {allCats.length ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {allCats.map(c => (
                <Badge key={c} variant={selCats.includes(c)?'default':'outline'} className="cursor-pointer" onClick={()=>{
                  setSelCats(s => s.includes(c) ? s.filter(x=>x!==c) : [...s, c])
                }}>{c}</Badge>
              ))}
              {selCats.length ? (
                <Button size="sm" variant="ghost" onClick={()=>setSelCats([])}>Limpar</Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
            {filtered.map((integration, i) => {
              const slug = deriveSlug(integration.nome)
              const href = connectHrefBySlug(slug)
              return (
              <Card key={`${integration.id}-${i}`} className="transition-all">
                <CardHeader>
                  <div className="connected-app-icon mb-2" data-app="default">
                    <img src={integration.icone || ''} alt={integration.nome} />
                  </div>
                  <CardTitle className="text-base">{integration.nome}</CardTitle>
                  <CardDescription className="text-xs">
                    {(integration.categorias||[]).join(' • ') || '—'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {integration.status === 'connected' ? (
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Conectado {integration.count? `(${integration.count})`:''}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={()=>{ window.location.href = `/app/integracoes/${slug}` }}>Gerenciar</Button>
                      </div>
                    </div>
                  ) : integration.status === 'disconnected' ? (
                    <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" /> Desconectado
                    </Badge>
                  ) : (
                    href !== '#' ? (
                      <Button size="sm" variant="default" onClick={()=>{ window.location.href = href }} className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> Conectar
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" /> Conectar
                      </Badge>
                    )
                  )}
                  {integration.count > 0 ? (
                    <div className="mt-2">
                      <button className="text-xs text-primary hover:underline" onClick={()=> setOpenMap((m)=> ({ ...m, [integration.id]: !m[integration.id] }))}>
                        {openMap[integration.id] ? 'Esconder conexões' : `Ver conexões (${integration.count})`}
                      </button>
                      {openMap[integration.id] ? (
                        <ul className="text-xs text-muted-foreground mt-2 max-h-28 overflow-auto">
                          {(integration.connections||[]).map((n, k)=>(<li key={k}>{n}</li>))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </CardContent>
              </Card>)
            })}
            {!loading && filtered.length===0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma integração encontrada.</div>
            ) : null}
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
