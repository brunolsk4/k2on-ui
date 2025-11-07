"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Protected from "@/components/protected"
import apiClient from "@/lib/apiClient"
import { trackFeatureInterest } from "@/lib/featureInterest"

function useApiBase(){ return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") }

export default function KommoOAuthConnectPage(){
  const apiBase = useApiBase()
  const redirectTo = React.useMemo(() => {
    if (typeof window === 'undefined') return '/app/integracoes'
    const p = new URLSearchParams(window.location.search)
    const r = p.get('redirect')
    return r ? decodeURIComponent(r) : '/app/integracoes'
  }, [])
  const [kommoError, setKommoError] = React.useState<string | null>(null)

  React.useEffect(()=>{ try{ const sp = new URLSearchParams(window.location.search); const ke = sp.get('kommoError'); if (ke) { setKommoError(ke); trackFeatureInterest('kommo_oauth','menu_open',{ error: ke, page:'kommo_conectar_oauth' }).catch(()=>{}) } } catch{} }, [])

  function startKommoOAuth(){
    const token = apiClient.getAccessToken()
    const url = `${apiBase}/api/kommo/public/login?authToken=${encodeURIComponent(String(token||''))}&redirectTo=${encodeURIComponent(`${window.location.origin}${redirectTo}`)}`
    window.location.href = url
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Kommo (OAuth2)" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          {kommoError === 'connected_to_other_company' ? (
            <div className="mb-4 text-sm rounded-md border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2">
              Essa conta do Kommo já está conectada em outra empresa. <a className="underline" href="https://wa.me/+5544988283140" target="_blank" rel="noreferrer">Fale com o nosso suporte</a>.
            </div>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Kommo</CardTitle>
              <CardDescription>Inicie a autenticação via OAuth2 para vincular o Kommo à sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={startKommoOAuth}>Iniciar conexão Kommo</Button>
            </CardContent>
          </Card>
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
