"use client";
import * as React from "react";
import Protected from "@/components/protected";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [items, setItems] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/team/invites/transfer-requests', { credentials:'include' });
      const j = await r.json().catch(()=>null);
      if (j && j.ok && Array.isArray(j.items)) setItems(j.items);
    } finally { setLoading(false) }
  }
  React.useEffect(()=>{ load() },[]);

  async function approve(id:number){
    await fetch('/api/team/invites/transfer-approve', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ id }) });
    await load();
  }
  async function reject(id:number){
    await fetch('/api/team/invites/transfer-reject', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ id }) });
    await load();
  }

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Pedidos de Transferência" />
          <div className="p-4 lg:p-6">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitações pendentes</CardTitle>
                  <CardDescription> Aprove ou rejeite pedidos de transferência de convites</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (<div className="text-sm text-muted-foreground">Carregando...</div>) : null}
                  {!loading && items.length===0 ? (<div className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</div>) : null}
                  {items.map((it:any)=>(
                    <div key={it.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{it.email}</div>
                        <div className="text-xs text-muted-foreground">Convite #{it.id} • status: {it.transfer_status || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={()=>approve(it.id)}>Aprovar</Button>
                        <Button size="sm" variant="ghost" onClick={()=>reject(it.id)}>Rejeitar</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}

