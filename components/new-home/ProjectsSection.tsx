"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/apiClient";

type Plano = "free" | "trial" | "pro" | null
type ProjetoView = { id: number; nome: string; templateId: number | null; templateNome: string | null; plano: Plano; bg?: string | null }
type Processo = { status?: 'pendente'|'executando'|'concluido'|'erro' }

async function fetchTemplateName(id: number | null): Promise<{ nome: string | null; imagem: string | null }> {
  if (!id) return { nome: null, imagem: null }
  try {
    const t = await apiClient.request<any>(`/api/templates/${id}`, { withAuth: true })
    return { nome: t?.nome || null, imagem: t?.imagem || null }
  } catch { return { nome: null, imagem: null } }
}

async function fetchPlanoProjeto(id: number): Promise<Plano> {
  try {
    const a = await apiClient.request<any>(`/api/projetos/${id}/assinatura`, { withAuth: true })
    const tipo = String(a?.tipo || '').toLowerCase()
    if (tipo.includes('trial')) return 'trial'
    if (tipo === 'pro' || tipo === 'pago' || tipo === 'premium') return 'pro'
    return 'free'
  } catch { return null }
}

function useProjetos(): { items: ProjetoView[]; reload: () => void } {
  const [items, setItems] = React.useState<ProjetoView[]>([])
  const normalizeCover = (u?: string | null) => {
    if (!u) return null
    if (/^https?:\/\//.test(u) || u.startsWith('/')) return u
    return `/app/project-covers/${u}`
  }
  const load = React.useCallback(async () => {
    try {
      const lista = await apiClient.request<any[]>("/api/projects", { withAuth: true })
      const enriched = await Promise.all((lista || []).map(async (p:any) => {
        const [{ nome: templateNome, imagem }, plano] = await Promise.all([
          fetchTemplateName(Number(p.template_id) || null),
          fetchPlanoProjeto(Number(p.id)),
        ])
        const bg = normalizeCover(p.capa_url) || imagem || null
        let processo: Processo = { status: 'pendente' }
        try { processo = await apiClient.request<Processo>(`/api/processos?projetoId=${Number(p.id)}`, { withAuth: true }) } catch {}
        return { id: Number(p.id), nome: p.nome, templateId: Number(p.template_id) || null, templateNome, plano, bg, processo }
      }))
      setItems(enriched)
    } catch {
      setItems([])
    }
  }, [])
  React.useEffect(()=>{ load() }, [load])
  return { items, reload: load }
}

const planoClass: Record<Exclude<Plano,null>, string> = {
  free: "bg-muted text-muted-foreground",
  trial: "bg-warning/10 text-warning",
  pro: "bg-success/10 text-success",
}

export function ProjectsSection() {
  const { items, reload } = useProjetos()
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Seus Projetos</h2>
          <p className="text-muted-foreground mt-1">Acompanhe seus dashboards em andamento</p>
        </div>
        <Button variant="default" size="sm" onClick={()=>{ window.location.href = '/app/home-projetos' }}>Ver todos os projetos</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((project: any) => (
          <Card key={project.id} className="cursor-pointer transition-all relative overflow-hidden h-full">
            {project.bg ? (
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:linear-gradient(to_top,rgba(0,0,0,.75),transparent_70%)]" style={{ backgroundImage: `url(${project.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            ) : null}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.nome}</CardTitle>
                    <CardDescription className="mt-1">
                      Template: {project.templateNome || "—"}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => {
                      window.location.href = `/app/wizard/step-template?projetoId=${project.id}`
                    }}>Instalar/Configurar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      window.location.href = `/app/project-create?id=${project.id}`
                    }}>Editar projeto</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={async () => {
                      if (!confirm('Excluir este projeto? Não é possível desfazer.')) return
                      try {
                        await apiClient.request(`/api/projects/${project.id}`, { method: 'DELETE', withAuth: true })
                        reload()
                      } catch {}
                    }}>Excluir projeto</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success">Ativo</Badge>
                  {project?.processo?.status === 'executando' ? (
                    <Badge variant="secondary">Em instalação</Badge>
                  ) : project?.processo?.status === 'concluido' ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Instalado</Badge>
                  ) : null}
                  {project.plano ? (
                    <Badge variant="outline" className={planoClass[project.plano as Exclude<Plano,null>]}>{project.plano}</Badge>
                  ) : null}
                </div>
                <Button size="sm" variant="default" className="flex-none">
                  Ver Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
