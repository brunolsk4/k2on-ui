"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import Protected from "@/components/protected"
import apiClient from "@/lib/apiClient"

type LinkItem = { nome: string; url: string }

export default function ConsultoriaPage() {
  const [links, setLinks] = React.useState<LinkItem[]|null>(null)
  const [erro, setErro] = React.useState<string| null>(null)

  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const data = await apiClient.request<{ empresa: number|null, links: LinkItem[] }>("/api/consultoria/links", { withAuth: true })
        if (!cancel) setLinks(data.links || [])
      } catch (e: any) {
        if (!cancel) setErro(e?.message || "Falha ao carregar links")
      }
    })()
    return () => { cancel = true }
  }, [])

  const copy = async (txt: string) => {
    try { await navigator.clipboard.writeText(txt) } catch {}
  }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Consultoria" />
          <div className="flex flex-1 flex-col">
            <div className="px-4 lg:px-6 py-6">
              <h2 className="sr-only">Área da Consultoria</h2>
            {erro ? (
              <div className="text-sm text-destructive">{erro}</div>
            ) : links === null ? (
              <div className="text-sm text-muted-foreground">Carregando…</div>
            ) : links.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhum link disponível.</div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {links.map((it, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="font-medium">{it.nome}</div>
                    <div className="text-xs text-muted-foreground break-all mt-1">{it.url}</div>
                    <div className="mt-3 flex gap-2">
                      <a className="btn btn-sm btn-primary px-3 py-1.5 border rounded hover:bg-primary/90" href={it.url} target="_blank" rel="noreferrer">Abrir</a>
                      <button className="btn btn-sm px-3 py-1.5 border rounded" onClick={() => copy(it.url)}>Copiar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
