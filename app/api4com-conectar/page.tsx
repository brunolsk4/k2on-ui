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

export default function Api4comConnectPage() {
  const [tokenApi, setTokenApi] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit() {
    if (!tokenApi) { alert("Informe o token de acesso."); return }
    setLoading(true)
    try {
      await apiClient.request("/api/api4com/conectar", { method: "POST", body: { token_api: tokenApi }, withAuth: true })
      alert("API4COM conectada com sucesso!")
    } catch { alert("Erro ao conectar API4COM.") } finally { setLoading(false) }
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar API4COM" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar API4COM</CardTitle>
              <CardDescription>Cole o token gerado na sua conta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Como conectar API4COM" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="token">Access Token</Label>
                  <Input id="token" value={tokenApi} onChange={e=>setTokenApi(e.target.value)} placeholder="Qj5bGr8xLdAdx5..." />
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
