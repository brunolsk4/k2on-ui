"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"

type GoogleStatus = {
  ok?: boolean
  conectado?: boolean
  connected?: boolean
  lastDisconnectedAt?: string | null
}

function useApiBase() {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  return base
}

function buildState(token: string | null, redirectTo: string) {
  const payload = { token, redirectTo }
  try { return btoa(JSON.stringify(payload)) } catch { return "" }
}

export default function GoogleAdsConnectPage() {
  const apiBase = useApiBase()
  const [status, setStatus] = React.useState<GoogleStatus | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)

  const redirectTo = React.useMemo(() => {
    if (typeof window === 'undefined') return '/app/integracoes'
    const p = new URLSearchParams(window.location.search)
    const r = p.get('redirect')
    return r ? decodeURIComponent(r) : '/app/integracoes'
  }, [])

  async function fetchStatus() {
    try {
      const d:any = await apiClient.request('/api/googleads/check', { withAuth: true })
      setStatus(d)
    } catch { setStatus(null) }
  }

  React.useEffect(()=>{ 
    fetchStatus();
    try{
      const p = new URLSearchParams(window.location.search);
      const err = p.get('error');
      const msg = err === 'already_linked' ? 'Esta conta do Google já está vinculada a outra empresa. Use outra conta ou peça para desvincular lá primeiro.'
        : err ? 'Não foi possível concluir a conexão com o Google.' : null;
      if (msg) setNotice(msg);
    } catch {}
  }, [])

  function startOAuth() {
    const token = apiClient.getAccessToken()
    const abs = /^https?:\/\//.test(redirectTo) ? redirectTo : `${window.location.origin}${redirectTo}`
    const state = buildState(token, abs)
    const url = `${apiBase}/api/auth/google/connect?state=${encodeURIComponent(state)}`
    try { localStorage.setItem('k2on_use_nextui', 'true') } catch {}
    window.location.href = url
  }

  async function disconnect() {
    setLoading(true)
    try {
      await apiClient.request('/api/googleads/disconnect', { method: 'DELETE', withAuth: true })
      await fetchStatus()
    } catch {}
    setLoading(false)
  }

  const connected = Boolean(status?.connected || status?.conectado)

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Google Ads" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
          {notice ? (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 text-yellow-900 px-3 py-2 text-sm">
              {notice}
            </div>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Google Ads</CardTitle>
              <CardDescription>Vincule sua conta do Google Ads para ativar dashboards e automações.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={startOAuth}>Iniciar conexão</Button>
              {connected ? (
                <Button variant="outline" onClick={disconnect} disabled={loading}>
                  {loading ? 'Desconectando…' : 'Desconectar'}
                </Button>
              ) : null}
              <span className="text-sm text-muted-foreground">
                {status ? (connected ? 'Conectado' : 'Desconectado') : '—'}
              </span>
            </CardContent>
          </Card>
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
