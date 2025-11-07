"use client";
import * as React from "react";
import Protected from "@/components/protected";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [status, setStatus] = React.useState<"idle"|"loading"|"success"|"error"|"mismatch">("idle");
  const [message, setMessage] = React.useState<string>("Validando convite...");
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    const run = async () => {
      try {
        setStatus("loading");
        const sp = new URLSearchParams(window.location.search);
        const token = sp.get("token");
        if (!token) {
          setStatus("error");
          setMessage("Token ausente. Verifique o link do convite.");
          return;
        }
        const r = await fetch("/api/team/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
        const j = await r.json().catch(() => null);
        if (r.ok && j && j.ok) {
          setStatus("success");
          setMessage("Convite aceito com sucesso. Redirecionando para a equipe...");
          setTimeout(() => { window.location.href = "/app/team" }, 1500);
        } else if (j && j.error === "email_nao_confere") {
          setStatus("mismatch");
          setMessage("O e-mail do convite não confere com sua conta. Você pode verificar o e‑mail do convite ou trocar de conta.");
        } else {
          setStatus("error");
          setMessage("Não foi possível aceitar o convite. O link pode ter expirado ou já foi utilizado.");
        }
      } catch {
        setStatus("error");
        setMessage("Falha ao validar o convite. Tente novamente mais tarde.");
      }
    };
    run();
  }, []);

  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Aceitar convite" />
          <div className="p-4 lg:p-6">
            <div className="mx-auto max-w-xl">
              <Card>
                <CardHeader>
                  <CardTitle>Convite de equipe</CardTitle>
                  <CardDescription>Finalize o vínculo com a empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={status === "error" ? "text-destructive" : ""}>{message}</div>
                  {status === "mismatch" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Button onClick={async ()=>{
                          const sp = new URLSearchParams(window.location.search);
                          const token = sp.get('token');
                          if (!token) return;
                          try{ await fetch('/api/team/invites/verify-email', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ token }) }); setMessage('Código enviado para o e‑mail do convite.'); }catch{}
                        }}>Enviar código para o e‑mail do convite</Button>
                        <Button variant="outline" onClick={() => { window.location.href = "/app/login" }}>Trocar conta</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input value={code} onChange={(e)=> setCode(e.target.value)} placeholder="Código de 6 dígitos" className="w-44 rounded-md border bg-background px-3 py-2 text-sm" />
                        <Button onClick={async()=>{
                          const sp = new URLSearchParams(window.location.search);
                          const token = sp.get('token'); if (!token || !code) return;
                          try{
                            const r = await fetch('/api/team/invites/confirm-email', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ token, code }) });
                            const j = await r.json().catch(()=>null);
                            if (r.ok && j && j.ok) { setStatus('success'); setMessage('Convite aceito via verificação. Redirecionando...'); setTimeout(()=> window.location.href='/app/team', 1200) }
                            else setMessage('Código inválido ou expirado.');
                          }catch{ setMessage('Falha ao validar código.') }
                        }}>Confirmar código</Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={async()=>{
                          const sp = new URLSearchParams(window.location.search);
                          const token = sp.get('token'); if (!token) return;
                          try{ await fetch('/api/team/invites/transfer-request', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ token }) }); setMessage('Solicitação enviada ao administrador.'); }catch{}
                        }}>Solicitar transferência ao admin</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => { window.location.href = "/app/team" }}>Ir para equipe</Button>
                      <Button onClick={() => { window.location.href = "/app/login" }}>Trocar conta</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}
