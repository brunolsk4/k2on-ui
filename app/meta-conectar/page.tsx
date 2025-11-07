"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"

type FbStatus = { conectado?: boolean; expired?: boolean; lastDisconnectedAt?: string | null }

function useApiBase() { return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") }
function buildState(token:string|null, redirectTo:string){ try { return btoa(JSON.stringify({ token, redirectTo })) } catch { return "" } }

export default function MetaConnectPage(){
  const apiBase = useApiBase()
  const [status, setStatus] = React.useState<FbStatus | null>(null)
  const [loading, setLoading] = React.useState(false)

  const redirectTo = React.useMemo(() => {
    if (typeof window === 'undefined') return '/app/integracoes'
    const p = new URLSearchParams(window.location.search)
    const r = p.get('redirect')
    return r ? decodeURIComponent(r) : '/app/integracoes'
  }, [])

  async function fetchStatus(){
    try{ const d:any = await apiClient.request('/api/facebook/status', { withAuth: true }); setStatus(d) } catch { setStatus(null) }
  }
  React.useEffect(()=>{ fetchStatus() }, [])

  function startOAuth(){
    const token = apiClient.getAccessToken()
    const state = buildState(token, `${window.location.origin}${redirectTo}`)
    const url = `${apiBase}/auth/facebook/connect?state=${encodeURIComponent(state)}`
    try { localStorage.setItem('k2on_use_nextui', 'true') } catch {}
    window.location.href = url
  }

  async function disconnect(){
    setLoading(true)
    try { await apiClient.request('/api/facebook/disconnect', { method: 'DELETE', withAuth: true }); await fetchStatus() } catch {}
    setLoading(false)
  }

  const connected = Boolean(status?.conectado) && !status?.expired

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Meta (Facebook)" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facebook / Meta Ads</CardTitle>
              <CardDescription>Autorize a leitura de dados para relatórios e integrações.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={startOAuth}>Iniciar conexão</Button>
              {connected ? (
                <Button variant="outline" onClick={disconnect} disabled={loading}>
                  {loading ? 'Desconectando…' : 'Desconectar'}
                </Button>
              ) : null}
              <span className="text-sm text-muted-foreground">
                {status ? (connected ? 'Conectado' : (status?.expired ? 'Expirado' : 'Desconectado')) : '—'}
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
