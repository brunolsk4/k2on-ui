"use client"
import * as React from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link as LinkIcon } from "lucide-react";
import apiClient from "@/lib/apiClient";

type Item = { nome: string; icone?: string | null }
type View = { nome: string; icone: string; status: 'connected'|'disconnected'|'connect'; count: number; connections: string[] }

function deriveSlug(nome: string) {
  const n = String(nome || '').toLowerCase()
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

function connectHrefBySlug(slug: string): string {
  switch (slug) {
    case 'meta': return '/ui/meta-conectar'
    case 'googleads': return '/ui/googleads-conectar'
    case 'kommo': return '/ui/kommo-conectar-oauth'
    case 'activecampaign': return '/ui/activecampaign-conectar'
    case 'pipedrive': return '/ui/pipedrive-conectar'
    case 'bitrix': return '/ui/bitrix-conectar'
    case 'hotmart': return '/ui/hotmart-conectar'
    case 'kiwify': return '/kiwify-conectar.html'
    case 'api4com': return '/ui/api4com-conectar'
    default: return '#'
  }
}

function logoFor(slug: string) {
  const png = {
    googleads: '/logos/googleads.png', pipedrive: '/logos/pipedrive.png', bitrix: '/logos/bitrix24.png',
    activecampaign: '/logos/activecampaign.png', hotmart: '/logos/hotmart.png', kiwify: '/logos/kiwify.png',
    meta: '/logos/meta.png', api4com: '/logos/api4com.png', kommo: '/logos/kommo.png',
  } as Record<string,string|undefined>
  return png[slug] || '/logos/placeholder.svg'
}

async function fetchStatus(slug: string): Promise<{ count: number; ok: boolean; list: string[] } | null> {
  const token = apiClient.getAccessToken()
  const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
  const headers: Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
  const get = async (path:string) => { try { const r = await fetch(`${API}${path}`, { headers }); return await r.json() } catch { return null } }
  switch (slug) {
    case 'meta': {
      const d:any = await get('/api/facebook/status');
      return { count: d && d.conectado && !d.expirado ? 1 : 0, ok: Boolean(d && d.conectado), list: [] }
    }
    case 'googleads': {
      // Estratégia leve para status rápido
      const d:any = await get('/api/googleads/check');
      const connected = Boolean(d?.ok && (d?.conectado === true || d?.connected === true));
      return { count: connected ? 1 : 0, ok: Boolean(d?.ok), list: [] }
    }
    case 'pipedrive': {
      const d:any = await get('/api/pipedrive/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.company_name || c.company_domain || `Pipedrive ${c.id}`) }
    }
    case 'bitrix': {
      const d:any = await get('/api/bitrix/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.nome || `Bitrix ${c.id}`) }
    }
    case 'activecampaign': {
      const d:any = await get('/api/activecampaign/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.nome || c.account_name || `Active ${c.id}`) }
    }
    case 'hotmart': {
      const d:any = await get('/api/hotmart/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.nome || `Hotmart ${c.id}`) }
    }
    case 'kiwify': {
      const d:any = await get('/api/kiwify/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.nome || `Kiwify ${c.id}`) }
    }
    case 'api4com': {
      const d:any = await get('/api/api4com/conexoes');
      const arr = Array.isArray(d?.conexoes) ? d.conexoes : []
      return { count: arr.length, ok: Boolean(d?.ok), list: arr.map((c:any)=> c.token_api ? `Token •••${String(c.token_api).slice(-4)}` : `API4COM ${c.id}`) }
    }
    case 'kommo': {
      const d:any = await get('/api/kommo/conexoes');
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.conexoes) ? d.conexoes : [])
      return { count: arr.length, ok: true, list: arr.map((c:any)=> c.subdominio || `Kommo ${c.id}`) }
    }
    default: return null
  }
}

function useIntegrations(): View[] {
  const [items, setItems] = React.useState<View[]>([])
  React.useEffect(() => { (async () => {
    try {
      const lista = await apiClient.request<Item[]>("/api/integracoes", { withAuth: true })
      const enriched: View[] = []
      for (const it of (lista||[])) {
        const slug = deriveSlug(it.nome)
        const status = await fetchStatus(slug).catch(()=>null)
        const count = status?.count || 0
        const icone = (it.icone && typeof it.icone==='string' ? it.icone : '') || logoFor(slug)
        const connected = count > 0
        enriched.push({ nome: it.nome, icone, count, connections: status?.list || [], status: connected ? 'connected' : (status && status.ok===false ? 'disconnected' : 'connect') })
      }
      // ordena e limita
      enriched.sort((a,b)=>{ const ac=a.status==='connected'?1:0, bc=b.status==='connected'?1:0; if(bc!==ac) return bc-ac; if(b.count!==a.count) return b.count-a.count; return a.nome.localeCompare(b.nome) })
      const first = enriched.slice(0, 6)
      setItems(first)

      // background: para Google Ads conectada, buscar conexões detalhadas e atualizar
      const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
      const token = apiClient.getAccessToken();
      const headers: Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
      first.forEach(async (view, idx) => {
        if (deriveSlug(view.nome) === 'googleads' && view.status === 'connected') {
          try {
            const r = await fetch(`${API}/api/googleads/conexoes`, { headers })
            if (r.ok) {
              const d:any = await r.json().catch(()=>null)
              const a = Array.isArray(d?.conexoes) ? d.conexoes : []
              setItems(prev => {
                const arr = [...prev]
                if (!arr[idx]) return prev
                arr[idx] = { ...arr[idx], count: a.length || arr[idx].count, connections: a.map((c:any)=> c.nome || c.account_id || String(c.id)) }
                return arr
              })
            }
          } catch {}
        }
      })
    } catch { setItems([]) }
  })() }, [])
  return items
}

export function IntegrationsSection() {
  const items = useIntegrations()
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const toggle = (k:string) => setOpen((s)=> ({ ...s, [k]: !s[k] }))
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Integrações Conectadas</h2>
        <Button variant="default" size="sm" onClick={() => { window.location.href = '/ui/integracoes' }}>Gerenciar Integrações</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {items.map((integration) => {
          const slug = deriveSlug(integration.nome)
          const href = connectHrefBySlug(slug)
          return (
          <Card key={integration.nome} className="transition-all">
            <CardContent className="py-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="connected-app-icon" data-app="default">
                  <img src={integration.icone} alt={integration.nome} />
                </div>
                <h3 className="font-semibold">{integration.nome}</h3>
                {integration.status === 'connected' ? (
                  <Badge variant="outline" className="bg-success/10 text-success flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Conectado
                  </Badge>
                ) : href !== '#' ? (
                  <Button size="sm" variant="default" onClick={()=>{ window.location.href = href }} className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> Conectar
                  </Button>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" /> Conectar
                  </Badge>
                )}
                {integration.count > 0 ? (
                  <button className="text-xs text-primary hover:underline" onClick={() => toggle(integration.nome)}>
                    {open[integration.nome] ? 'Esconder conexões' : `Ver conexões (${integration.count})`}
                  </button>
                ) : null}
                {open[integration.nome] && integration.connections.length ? (
                  <ul className="text-xs text-muted-foreground max-h-28 overflow-auto">
                    {integration.connections.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </section>
  );
}
