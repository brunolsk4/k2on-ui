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

export default function BitrixConnectPage() {
  const [webhookUrl, setWebhookUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit() {
    if (!webhookUrl) { alert("Informe a URL do webhook."); return }
    setLoading(true)
    try {
      await apiClient.request("/api/bitrix/conectar", { method: "POST", body: { webhook_url: webhookUrl }, withAuth: true })
      alert("Bitrix conectado com sucesso!")
    } catch { alert("Erro ao conectar Bitrix.") } finally { setLoading(false) }
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Bitrix24" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Bitrix24</CardTitle>
              <CardDescription>Use a URL do webhook gerado no Bitrix.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/abc123xyz" title="Como conectar Bitrix24" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="webhook">URL do Webhook</Label>
                  <Input id="webhook" value={webhookUrl} onChange={e=>setWebhookUrl(e.target.value)} placeholder="https://.../rest/USER_ID/TOKEN/" />
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
