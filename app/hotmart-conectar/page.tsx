"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Protected from "@/components/protected"

export default function HotmartConnectPage() {
  const [tokenApi, setTokenApi] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit() {
    if (!tokenApi) { alert("Informe o token da Hotmart."); return }
    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""
      const r = await fetch(`${API}/hotmart/conectar`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')||''}` }, body: JSON.stringify({ token_api: tokenApi }) })
      const j = await r.json().catch(()=>({}))
      if (!r.ok || !j?.ok) throw new Error()
      alert("Hotmart conectada com sucesso!")
    } catch { alert("Erro ao conectar Hotmart.") } finally { setLoading(false) }
  }

  return (
    <Protected>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Conectar Hotmart" />
          <div className="p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Hotmart</CardTitle>
              <CardDescription>Informe o token da sua conta Hotmart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/9aNIX9GpOZs" title="Como conectar Hotmart" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="token">Token da API</Label>
                  <Input id="token" value={tokenApi} onChange={e=>setTokenApi(e.target.value)} placeholder="123abc456def..." />
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
