"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderKanban, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"

type Plano = "free" | "trial" | "pro" | null
type ProjetoView = { id:number; nome:string; templateId:number|null; templateNome:string|null; plano:Plano; bg?:string|null }

async function fetchTemplateName(id: number | null): Promise<{ nome: string | null; imagem: string | null }> {
  if (!id) return { nome: null, imagem: null }
  try { const t = await apiClient.request<any>(`/api/templates/${id}`, { withAuth: true }); return { nome: t?.nome || null, imagem: t?.imagem || null } } catch { return { nome: null, imagem: null } }
}
async function fetchPlanoProjeto(id: number): Promise<Plano> {
  try { const a = await apiClient.request<any>(`/api/projetos/${id}/assinatura`, { withAuth: true }); const tipo = String(a?.tipo || '').toLowerCase(); if (tipo.includes('trial')) return 'trial'; if (tipo==='pro'||tipo==='pago'||tipo==='premium') return 'pro'; return 'free' } catch { return null }
}

function useProjetos(): { items:ProjetoView[]; reload:()=>void }{
  const [items, setItems] = React.useState<ProjetoView[]>([])
  const normalizeCover = (u?:string|null) => { if(!u) return null; if(/^https?:\/\//.test(u) || u.startsWith('/')) return u; return `/app/project-covers/${u}` }
  const load = React.useCallback(async()=>{
    try{
      const lista = await apiClient.request<any[]>("/api/projects", { withAuth:true })
      const enriched = await Promise.all((lista||[]).map(async (p:any)=>{
        const [{ nome: templateNome, imagem }, plano] = await Promise.all([
          fetchTemplateName(Number(p.template_id)||null),
          fetchPlanoProjeto(Number(p.id)),
        ])
        const bg = normalizeCover(p.capa_url) || imagem || null
        return { id:Number(p.id), nome:p.nome, templateId:Number(p.template_id)||null, templateNome, plano, bg }
      }))
      setItems(enriched)
    } catch { setItems([]) }
  },[])
  React.useEffect(()=>{ load() },[load])
  return { items, reload: load }
}

const planoClass: Record<Exclude<Plano,null>, string> = {
  free: "bg-muted text-muted-foreground",
  trial: "bg-warning/10 text-warning",
  pro: "bg-success/10 text-success",
}

export default function HomeProjetosPage(){
  const { items, reload } = useProjetos()
  const [query, setQuery] = React.useState("")
  const [selPlanos, setSelPlanos] = React.useState<Plano[]>([])
  const planosAll: Plano[] = ['pro','trial','free']
  const templatesAll = React.useMemo(()=> Array.from(new Set(items.map(i=> i.templateNome || '—'))).sort(), [items])
  const [selTemplates, setSelTemplates] = React.useState<string[]>([])

  const filtered = React.useMemo(()=> items
    .filter(p => !query || p.nome.toLowerCase().includes(query.toLowerCase()))
    .filter(p => selPlanos.length===0 || (p.plano && selPlanos.includes(p.plano)))
    .filter(p => selTemplates.length===0 || selTemplates.includes(p.templateNome || '—'))
  , [items, query, selPlanos, selTemplates])

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Projetos" />
          <div className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <input placeholder="Buscar projetos..." value={query} onChange={e=> setQuery(e.target.value)} className="w-full max-w-md rounded-md border bg-background px-3 py-2 text-sm" />
            {(selPlanos.length>0 || selTemplates.length>0) && (
              <Button size="sm" variant="ghost" onClick={()=>{ setSelPlanos([]); setSelTemplates([]) }}>Limpar</Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {planosAll.map(p => (
              <button key={p as string} onClick={()=> setSelPlanos(v => v.includes(p!) ? v.filter(x=>x!==p) : [...v, p!])} className={`px-2.5 py-1 rounded-full text-xs border ${selPlanos.includes(p!)? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border'}`}>{p}</button>
            ))}
          </div>
          {templatesAll.length>0 && (
            <div className="flex flex-wrap items-center gap-2">
              {templatesAll.map(t => (
                <button key={t} onClick={()=> setSelTemplates(v => v.includes(t) ? v.filter(x=>x!==t) : [...v, t])} className={`px-2.5 py-1 rounded-full text-xs border ${selTemplates.includes(t)? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground border-border'}`}>{t}</button>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project)=> (
              <Card key={project.id} className="relative overflow-hidden h-full">
                {project.bg ? (
                  <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:linear-gradient(to_top,rgba(0,0,0,.75),transparent_70%)]" style={{ backgroundImage:`url(${project.bg})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                ) : null}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2"><FolderKanban className="h-5 w-5 text-primary" /></div>
                      <div>
                        <CardTitle className="text-lg">{project.nome}</CardTitle>
                        <CardDescription className="mt-1">Template: {project.templateNome || '—'}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={()=>{ window.location.href = `/ui/project-create?id=${project.id}` }}>Editar projeto</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={async()=>{ if(!confirm('Excluir este projeto?')) return; try{ await apiClient.request(`/api/projects/${project.id}`, { method:'DELETE', withAuth:true }); reload() } catch{} }}>Excluir projeto</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-success/10 text-success">Ativo</Badge>
                      {project.plano ? (<Badge variant="outline" className={planoClass[project.plano]}>{project.plano}</Badge>) : null}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="flex-none" onClick={()=>{ window.location.href = `/app/wizard/step-template?projetoId=${project.id}` }}>Selecionar dashboard</Button>
                      <Button size="sm" className="flex-none" onClick={()=>{ window.location.href = `/app/home?projeto=${project.id}` }}>Ver Dashboard</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
