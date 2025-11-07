"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/apiClient"
import Protected from "@/components/protected"

export default function ActiveCampaignConnectPage() {
  const [baseUrl, setBaseUrl] = React.useState("")
  const [token, setToken] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit() {
    if (!baseUrl || !token) { alert("Preencha todos os campos."); return }
    setLoading(true)
    try {
      await apiClient.request("/api/activecampaign/conectar", {
        method: "POST",
        body: { base_url: baseUrl, token_api: token },
        withAuth: true,
      })
      alert("ActiveCampaign conectado com sucesso!")
    } catch (e) {
      alert("Erro ao conectar ActiveCampaign.")
    } finally { setLoading(false) }
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar ActiveCampaign" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar ActiveCampaign</CardTitle>
              <CardDescription>Insira as credenciais da sua conta para ativar a integração.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/9aNIX9GpOZs" title="Como conectar ActiveCampaign" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="base">URL da conta (ex: k2o.api-us1.com)</Label>
                  <Input id="base" value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="k2o.api-us1.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="token">Token da API</Label>
                  <Input id="token" value={token} onChange={e=>setToken(e.target.value)} placeholder="123abc456def..." />
                </div>
                <div className="flex items-center justify-center">
                  <Button disabled={loading} onClick={onSubmit}>{loading? 'Conectando…' : 'Conectar'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
