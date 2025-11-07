"use client"
import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cropper, ImageCropContent, ImageCropApply, ImageCropReset, ImageCrop } from "@/components/ui/shadcn-io/image-crop"
import { projectSchema, type ProjectFormData } from "./validation"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

type Template = { id: number; nome: string; descricao?: string; imagem?: string }
type Empresa = { id: number; nome: string }

function useTemplates() {
  const [items, setItems] = React.useState<Template[]>([])
  React.useEffect(() => { (async()=>{
    try { const data = await apiClient.request<Template[]>("/api/templates") as any; setItems(data||[]) } catch {}
  })() }, [])
  return items
}

function useEmpresas() {
  const [items, setItems] = React.useState<Empresa[]>([])
  React.useEffect(()=>{ (async()=>{ try { const data = await apiClient.request<Empresa[]>("/api/empresas/minhas", { withAuth: true }) as any; setItems(data||[]) } catch {} })() }, [])
  return items
}

export default function ProjectCreatePage() {
  // Acessa search params de forma lazy no cliente para evitar exigência de Suspense no build
  const [projectId, setProjectId] = React.useState<number | null>(null)
  const [templateId, setTemplateId] = React.useState<number | null>(null)
  React.useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const id = Number(sp.get('id') || 0) || null
      setProjectId(id)
      const tid = Number(sp.get('templateId') || 0) || null
      setTemplateId(tid)
    } catch {}
  }, [])
  const isEdit = Boolean(projectId)
  const templates = useTemplates()
  const empresas = useEmpresas()
  const [empresaId, setEmpresaId] = React.useState<number | null>(null)
  const [form, setForm] = React.useState<ProjectFormData>({ nome: "", descricao: "", imagemBg: "" })
  const [saving, setSaving] = React.useState(false)
  const [cover, setCover] = React.useState<File | null>(null)
  const [cropFile, setCropFile] = React.useState<File | null>(null)
  const [cropping, setCropping] = React.useState(false)

  function update<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  React.useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const p = await apiClient.request<any>(`/api/projects/${projectId}`, { withAuth: true })
        setForm((f) => ({ ...f, nome: p?.nome || '', descricao: '', ...(p?.capa_url ? { capa_url: p.capa_url } : {}) } as any))
      } catch {}
    })()
  }, [isEdit, projectId])

  async function onSubmit() {
    try {
      // validação leve via zod no cliente (com trim)
      const payload = { ...form, nome: (form.nome || '').trim() } as ProjectFormData
      const parsed = projectSchema.safeParse(payload)
      if (!parsed.success) {
        // Mostra o primeiro erro de forma destacada
        const issue = parsed.error.issues?.[0]
        const msg = issue?.message || 'Preencha os campos obrigatórios'
        // fallback simples
        alert(msg)
        return
      }
      const data = parsed.data
      setSaving(true)
      let id = projectId
      if (isEdit) {
        await apiClient.request(`/api/projects/${projectId}`, { method: 'PUT', body: { nome: data.nome, icone: '📁' }, withAuth: true })
        if (cover) {
          const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
          const fd = new FormData(); fd.append('cover', cover)
          await fetch(`${API}/api/projetos/${projectId}/capa`, { method: 'POST', body: fd, credentials: 'include', headers: { Authorization: `Bearer ${apiClient.getAccessToken()}` } }).catch(()=>{})
        }
      } else {
        // valida empresa na criação
        if (!empresaId) {
          // se houver só uma empresa conhecida, seleciona automaticamente; senão, exige
          if (empresas.length === 1) {
            setEmpresaId(empresas[0].id); // define e continua
          } else {
            alert('Selecione a empresa');
            return;
          }
        }
        if (cover) {
          const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
          const fd = new FormData();
          fd.append('projectName', data.nome);
          if (empresaId) fd.append('empresaId', String(empresaId));
          fd.append('cover', cover);
          const r = await fetch(`${API}/api/projects-with-cover`, { method: 'POST', body: fd, credentials: 'include', headers: { Authorization: `Bearer ${apiClient.getAccessToken()}` } });
          const resp = await r.json().catch(()=>({}));
          id = Number((resp as any)?.id)
        } else {
          // Cria sem capa
          const res = await apiClient.request<any>("/api/projects", { method: "POST", body: { projectName: data.nome, empresaId }, withAuth: true })
          id = Number((res as any)?.id)
        }
      }
      if (id && form.templateId) {
        // TODO: associar template ao projeto se houver endpoint específico
      }
      // Redirecionar para o início do wizard após criar projeto novo
      if (!isEdit && id && typeof window !== 'undefined') {
        // Se veio com templateId, associar ao projeto antes de ir para o farol
        try {
          if (templateId) {
            await apiClient.request('/api/projetos/selecionar-template', { method:'POST', withAuth:true, body:{ projeto_id:id, template_id: templateId } })
          }
        } catch {}
        // Feedback visual forçando breve atraso para exibir o toast
        try { toast.success('Projeto criado com sucesso'); } catch {}
        setTimeout(()=>{
          if (templateId) {
            const q = new URLSearchParams({ projetoId: String(id), templateId: String(templateId) }).toString()
            window.location.href = `/app/wizard/step-integrations?${q}`
          } else {
            const q = new URLSearchParams({ projetoId: String(id) }).toString()
            window.location.href = `/app/wizard/step-template?${q}`
          }
        }, 300)
      } else if (typeof window !== 'undefined') {
        window.location.href = "/app/home"
      }
    } catch (e) {
      // manter simples por enquanto
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={isEdit ? "Editar Projeto" : "Novo Projeto"} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6 grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEdit ? 'Editar informações' : 'Informações'}</CardTitle>
                    <CardDescription>{isEdit ? 'Atualize os dados do projeto' : 'Defina o nome e descrição do projeto'}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do projeto</Label>
                      <Input id="nome" value={form.nome} onChange={(e)=> update('nome', e.target.value)} placeholder="Ex.: E-commerce Analytics" />
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Select value={empresaId ? String(empresaId) : undefined} onValueChange={(v)=> setEmpresaId(Number(v))} disabled={isEdit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map(e => (
                            <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isEdit ? (
                        <p className="text-xs text-muted-foreground">A empresa do projeto não pode ser alterada após a criação.</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea id="descricao" rows={4} value={form.descricao || ''} onChange={(e)=> update('descricao', e.target.value)} placeholder="Opcional" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Imagem de capa</CardTitle>
                    <CardDescription>Envie uma imagem para a capa do projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CoverPicker onPick={(file)=>{ setCropFile(file); setCropping(true); }} />
                    <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WebP. Até 6MB.</p>
                    {cropFile && cropping && (
                      <div className="rounded-md border p-3">
                        <ImageCrop file={cropFile} aspect={21/9} onCrop={async (dataUrl)=>{
                          try {
                            const res = await fetch(dataUrl)
                            const blob = await res.blob()
                            const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' })
                            setCover(file)
                          } catch {}
                        }}>
                          <ImageCropContent className="w-full" />
                          <div className="mt-3 flex items-center justify-end gap-3">
                            <ImageCropReset asChild onClick={()=>{ setCropping(false); setCropFile(null) }}>
                              <Button variant="secondary" size="sm">Cancelar</Button>
                            </ImageCropReset>
                            <ImageCropApply asChild onClick={()=>{ setCropping(false); setCropFile(null) }}>
                              <Button size="sm">Aplicar</Button>
                            </ImageCropApply>
                          </div>
                        </ImageCrop>
                      </div>
                    )}
                    { (cover || (isEdit && form && (form as any).capa_url)) ? (
                      <div>
                        <Label>Pré-visualização da capa</Label>
                        <img
                          src={cover ? URL.createObjectURL(cover) : (((form as any).capa_url && (/^https?:\/\//.test((form as any).capa_url) || (form as any).capa_url.startsWith('/'))) ? (form as any).capa_url : `/app/project-covers/${(form as any).capa_url}`)}
                          alt="Prévia da capa"
                          className="mt-1 w-full rounded-md border object-cover"
                          style={{ aspectRatio: '21 / 9' }}
                        />
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="px-4 lg:px-6 flex gap-3">
                <Button onClick={onSubmit} disabled={saving} className="min-w-28">{saving? 'Salvando...' : 'Salvar'}</Button>
                <Button variant="secondary" onClick={()=> history.back()}>Cancelar</Button>
              </div>

              <div className="px-4 lg:px-6 grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                    <CardDescription>Assinatura do projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {projectId ? (
                      <ProjetoStatus projetoId={projectId} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Salve o projeto para ver o status.</p>
                    )}
                  </CardContent>
                </Card>

                {projectId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Organize e filtre seus dashboards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjetoTags projetoId={projectId} />
                  </CardContent>
                </Card>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}

function ProjetoStatus({ projetoId }: { projetoId: number }) {
  const [status, setStatus] = React.useState<{ tipo?: string; status?: string; iniciado_em?: string; expira_em?: string } | null>(null)
  React.useEffect(()=>{ (async()=>{ try { const s = await apiClient.request<any>(`/api/projetos/${projetoId}/assinatura`, { withAuth: true }); setStatus(s||{}) } catch {} })() }, [projetoId])

  const now = Date.now()
  const exp = status?.expira_em ? new Date(status.expira_em).getTime() : 0
  const inTrial = (status?.tipo === 'pro') && (status?.status === 'ativo') && exp > now
  const remaining = exp > now ? exp - now : 0
  const remainingLabel = remaining
    ? (()=>{ const d=Math.floor(remaining/86400000); if(d>0) return `${d}d`; const h=Math.floor(remaining/3600000); if(h>0) return `${h}h`; const m=Math.floor(remaining/60000); return `${m}min`})()
    : null

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm flex items-center gap-2">
          <span>Plano:</span>
          {inTrial ? (
            <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">TRIAL {remainingLabel ? `• ${remainingLabel}` : ''}</span>
          ) : (
            <span className="font-medium uppercase">{(status?.tipo||'free')}</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">Status: {(status?.status||'desconhecido')}</div>
      </div>
      <Button size="sm" onClick={async ()=>{
        try {
          const r = await apiClient.request<{ url: string }>("/api/stripe/checkout", { method: 'POST', body: { projetoId, tipo: 'pro' }, withAuth: true })
          if (r?.url) window.location.href = r.url
        } catch (e) {
          console.error(e)
        }
      }}>Assinar Pro</Button>
    </div>
  )
}

function ProjetoTags({ projetoId }: { projetoId: number }) {
  const [tags, setTags] = React.useState<Array<{id:number; nome:string}>>([])
  const [value, setValue] = React.useState('')
  const load = React.useCallback(async ()=>{ try { const t = await apiClient.request<any[]>(`/api/projetos/${projetoId}/tags`, { withAuth: true }); setTags(t||[]) } catch {} }, [projetoId])
  React.useEffect(()=>{ load() }, [load])
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={value} onChange={(e)=> setValue(e.target.value)} placeholder="Adicionar tag" />
        <Button size="sm" onClick={async ()=>{ if (!value.trim()) return; await apiClient.request(`/api/projetos/${projetoId}/tags`, { method:'POST', body:{ nome: value.trim() }, withAuth: true }); setValue(''); load(); }}>Adicionar</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(t => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
            {t.nome}
            <button className="text-muted-foreground hover:text-foreground" onClick={async ()=>{ await apiClient.request(`/api/projetos/${projetoId}/tags/${t.id}`, { method:'DELETE', withAuth: true }); load(); }}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

function CoverPicker({ onPick }: { onPick: (f: File) => void }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) onPick(f) }} />
      <Button type="button" variant="outline" onClick={()=> inputRef.current?.click()}>Selecionar imagem</Button>
      <span className="text-xs text-muted-foreground">Clique para escolher a capa</span>
    </div>
  )
}
