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

export default function KommoConnectPage() {
  const [subdominio, setSubdominio] = React.useState("")
  const [accessToken, setAccessToken] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit() {
    if (!subdominio || !accessToken) { alert("Preencha todos os campos."); return }
    setLoading(true)
    try {
      await apiClient.request("/api/kommo/conectar", { method: "POST", body: { subdominio, access_token: accessToken }, withAuth: true })
      alert("Kommo conectado com sucesso!")
    } catch { alert("Erro ao conectar Kommo.") } finally { setLoading(false) }
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Kommo" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Kommo</CardTitle>
              <CardDescription>Informe o subdomínio e o token de longa duração.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/lOUemS0F8uE" title="Como conectar Kommo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sub">Subdomínio</Label>
                  <Input id="sub" value={subdominio} onChange={e=>setSubdominio(e.target.value)} placeholder="Ex: se sua URL é https://k2on.kommo.com use apenas k2on" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tok">Token de longa duração</Label>
                  <Input id="tok" value={accessToken} onChange={e=>setAccessToken(e.target.value)} placeholder="eyJhbGciOi..." />
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
