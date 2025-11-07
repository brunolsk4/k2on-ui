"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import apiClient from "@/lib/apiClient"

type Template = { id:number; nome:string; descricao?:string|null; imagem?:string|null; engine?:string|null; link_demonstracao?: string | null }
type Integracao = { id:number; nome:string; icone?:string|null; conectado?:boolean }

function normalizeImg(u?: string | null) {
  if (!u) return null
  // URL absoluta
  if (/^https?:\/\//.test(u)) return u
  // Caminho relativo começando com barra: honrar basePath '/app'
  if (u.startsWith('/')) return `/app${u}`
  // Caminho relativo sem barra
  return `/app/${u}`
}

export default function WizardStepTemplate() {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [projeto, setProjeto] = React.useState<{ id:number; nome:string } | null>(null)
  const [integrationsMap, setIntegrationsMap] = React.useState<Record<number, Integracao[]>>({})
  const [allTypes, setAllTypes] = React.useState<string[]>([])
  const [selTypes, setSelTypes] = React.useState<string[]>([])

  const [search, setSearch] = React.useState<{ projetoId:number|null }>({ projetoId: null })
  React.useEffect(()=>{ try{ const sp=new URLSearchParams(window.location.search); setSearch({ projetoId: Number(sp.get('projetoId')||0)||null }) }catch{} },[])

  React.useEffect(()=>{ (async()=>{
    setLoading(true)
    try {
      const list = await apiClient.request<Template[]>("/api/templates")
      setTemplates(list||[])
      // Carrega integrações por template e popula tipos disponíveis
      const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
      const token = apiClient.getAccessToken(); const headers:Record<string,string> = token ? { Authorization: `Bearer ${token}` } : {}
      ;(list||[]).forEach(async (t)=>{
        try{
          const r = await fetch(`${API}/api/templates/${t.id}/integracoes`, { headers })
          if (r.ok){
            const d:any = await r.json().catch(()=>null);
            if (Array.isArray(d)){
              setIntegrationsMap(m=> ({ ...m, [t.id]: d }))
              const nomes = d.map((i:any)=> String(i.nome||'').trim()).filter(Boolean)
              setAllTypes(prev => Array.from(new Set([...prev, ...nomes])).sort((a,b)=> a.localeCompare(b)))
            }
          }
        }catch{}
      })
    } finally { setLoading(false) }
  })() },[])

  React.useEffect(()=>{ (async()=>{
    if (!search.projetoId) return
    try { const p = await apiClient.request<any>(`/api/projects/${search.projetoId}`, { withAuth: true }); setProjeto({ id:p.id, nome:p.nome }) } catch {}
  })() },[search.projetoId])

  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={projeto?.nome ? `Projeto: ${projeto.nome}` : "Selecionar Template"} />
        <div className="p-4 lg:p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mt-2 mb-4 text-center">Escolha o dashboard para instalar</h2>
            {allTypes.length>0 ? (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {allTypes.map((t) => (
                  <Badge
                    key={t}
                    variant={selTypes.includes(t)?'default':'outline'}
                    className="cursor-pointer"
                    onClick={()=> setSelTypes(s => s.includes(t) ? s.filter(x=>x!==t) : [...s, t])}
                  >{t}</Badge>
                ))}
                {selTypes.length ? (
                  <Button size="sm" variant="ghost" onClick={()=> setSelTypes([])}>Limpar</Button>
                ) : null}
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 justify-center">
            {templates
              .filter(t => {
                if (selTypes.length===0) return true
                const ints = integrationsMap[t.id] || []
                const nomes = ints.map(i=> String(i.nome||''))
                // OR entre seleções: exibe se tiver qualquer tipo selecionado
                return selTypes.some(sel => nomes.some(n => n.toLowerCase().includes(sel.toLowerCase())))
              })
              .map(t => {
                const img = normalizeImg(t.imagem)
                return (
                <Card key={t.id} className="transition-all overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">{t.nome}</CardTitle>
                    <CardDescription className="line-clamp-2">{t.descricao || '—'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {img ? (
                      <img
                        src={img}
                        alt={t.nome}
                        className="w-full h-32 object-cover rounded-md border"
                        onError={(e)=>{ const el=e.currentTarget as HTMLImageElement; el.src='/app/images/templates/placeholder.png'; (el as any).onerror=null; }}
                      />
                    ) : (
                      <img src="/app/images/templates/placeholder.png" alt="placeholder" className="w-full h-32 object-cover rounded-md border" />
                    )}
                    <div className="flex items-center gap-2 pt-1 justify-between">
                      {t.link_demonstracao ? (
                        <Button size="sm" variant="outline" onClick={()=> window.open(t.link_demonstracao as string, '_blank')}>Ver demonstração</Button>
                      ) : null}
                      <Button
                        size="sm"
                        onClick={async ()=>{
                          // Se já temos projeto, segue para integrações; caso contrário, vai para criação de projeto mantendo o template
                          if (search.projetoId) {
                            const q = new URLSearchParams({ templateId: String(t.id), projetoId: String(search.projetoId) }).toString()
                            window.location.href = `/app/wizard/step-integrations?${q}`
                          } else {
                            window.location.href = `/app/project-create?templateId=${t.id}`
                          }
                        }}
                      >Selecionar Dashboard</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {(!loading && templates.length===0) ? (<div className="text-sm text-muted-foreground text-center">Nenhum template encontrado.</div>) : null}
            </div>
            <div className="flex items-center justify-center pt-6">
              <Button variant="outline" onClick={()=>{
                const back = search.projetoId ? '/app/home-projetos' : '/app/catalogo'
                window.location.href = back
              }}>← Voltar</Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
