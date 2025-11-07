"use client"
import * as React from "react"
import { useParams } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import Protected from "@/components/protected"
import apiClient from "@/lib/apiClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type LinkItem = { nome_cliente: string; url: string; imagem?: string | null; capa_url?: string | null }

export default function ConsultoriaAgenciaPage() {
  const params = useParams<{ agenciaSlug?: string }>()
  const agenciaSlug = (params && (params.agenciaSlug as string)) || undefined
  const [links, setLinks] = React.useState<LinkItem[]|null>(null)
  const [erro, setErro] = React.useState<string| null>(null)
  const [visibleIdx, setVisibleIdx] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!agenciaSlug) {
      try { console.log("[consultoria/agencia] params:", params); console.log("[consultoria/agencia] agenciaSlug:", agenciaSlug) } catch {}
      setErro("Slug da agência ausente")
      return
    }
    let cancel = false
    ;(async () => {
      try {
        const data = await apiClient.request<{ agencia: string, links: LinkItem[] }>(`/api/consultoria/${encodeURIComponent(agenciaSlug)}/links`, { withAuth: true })
        if (!cancel) setLinks(data.links || [])
      } catch (e: any) {
        if (!cancel) setErro(e?.message || "Falha ao carregar links")
      }
    })()
    return () => { cancel = true }
  }, [agenciaSlug])

  const copy = async (txt: string) => { try { await navigator.clipboard.writeText(txt) } catch {} }

  const isPowerBIView = (url: string) => {
    try {
      const u = new URL(url)
      return (
        u.hostname === 'app.powerbi.com' &&
        u.pathname === '/view' &&
        (u.searchParams.has('r') || u.search.includes('='))
      )
    } catch {
      return false
    }
  }

  const normalizeImage = (u?: string | null) => {
    if (!u) return null
    if (/^https?:\/\//.test(u) || u.startsWith('/')) return u
    // Se vier apenas um caminho relativo salvo no banco, prefixa com /app/
    return `/app/${u}`
  }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Consultoria" />
          <div className="flex flex-1 flex-col">
            <div className="px-4 lg:px-6 py-6">
              <div className="text-sm text-muted-foreground mb-4">Agência: {agenciaSlug}</div>
            {erro ? (
              <div className="text-sm text-destructive">{erro}</div>
            ) : links === null ? (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            ) : links.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhum link disponível.</div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {links.map((it, idx) => {
                  const img = normalizeImage(it.imagem || it.capa_url || null)
                  return (
                  <Card key={idx} className="transition-all relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-lg truncate" title={it.nome_cliente}>{it.nome_cliente}</CardTitle>
                          <CardDescription>
                            {isPowerBIView(it.url) ? 'Dashboard Power BI' : 'Link externo'}
                          </CardDescription>
                        </div>
                        {img ? (
                          <div className="shrink-0 w-16 h-16 rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                            <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a className="btn btn-sm px-3 py-1.5 border rounded" href={it.url} target="_blank" rel="noreferrer">Abrir</a>
                        <Button size="sm" variant="secondary" onClick={() => copy(it.url)}>Copiar</Button>
                        {isPowerBIView(it.url) && (
                          visibleIdx === idx ? (
                            <Button size="sm" variant="outline" onClick={() => setVisibleIdx(null)}>Ocultar</Button>
                          ) : (
                            <Button size="sm" onClick={() => setVisibleIdx(idx)}>Ver Dashboard</Button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
            {links && visibleIdx !== null && links[visibleIdx] && isPowerBIView(links[visibleIdx].url) && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{links[visibleIdx].nome_cliente}</h3>
                  <Button size="sm" variant="outline" onClick={()=> setVisibleIdx(null)}>Fechar</Button>
                </div>
                <iframe
                  title={links[visibleIdx].nome_cliente}
                  className="w-full"
                  style={{ height: '80vh', border: 0 }}
                  src={links[visibleIdx].url}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
