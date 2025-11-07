"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import apiClient from "@/lib/apiClient"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProfileContent() {
  const router = useRouter()
  const [nome, setNome] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [empresa, setEmpresa] = React.useState("")
  const [salvando, setSalvando] = React.useState(false)

  const [senhaAtual, setSenhaAtual] = React.useState("")
  const [novaSenha, setNovaSenha] = React.useState("")
  const [trocando, setTrocando] = React.useState(false)

  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const me = await apiClient.me()
        if (cancel) return
        setNome((me as any).nomeCompleto || me.name || "")
        setEmail(me.email || "")
        setEmpresa((me as any).empresaNome || "")
      } catch {}
    })()
    return () => { cancel = true }
  }, [])

  async function salvarPerfil(e?: React.FormEvent) {
    e?.preventDefault()
    setSalvando(true)
    try {
      await apiClient.request("/api/me", { method: "PATCH", body: { nome, email } })
      if (empresa && empresa.trim()) {
        await apiClient.request("/api/empresa/detalhes", { method: "PATCH", body: { nome: empresa.trim() } })
      }
      toast.success("Dados atualizados com sucesso")
      try { router.refresh() } catch { /* noop */ }
      if (typeof window !== 'undefined') {
        setTimeout(() => { try { window.location.reload() } catch {} }, 250)
      }
    } catch (err:any) {
      const msg = err?.message || err?.data?.erro || "Não foi possível salvar as alterações"
      toast.error(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!senhaAtual || !novaSenha) return
    setTrocando(true)
    try {
      await apiClient.request("/api/me/change-password", { method: "POST", body: { senhaAtual, novaSenha } })
      setSenhaAtual("")
      setNovaSenha("")
    } finally {
      setTrocando(false)
    }
  }

  return (
    <Tabs defaultValue="pessoal" className="space-y-6" id="perfil-form">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="seguranca">Segurança</TabsTrigger>
      </TabsList>

      <TabsContent value="pessoal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações pessoais</CardTitle>
            <CardDescription>Atualize seu nome, e-mail e empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={salvarPerfil}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" value={nome} onChange={(e)=>setNome(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" value={empresa} onChange={(e)=>setEmpresa(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="conta" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Dados da sua conta</CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={email} readOnly />
            </div>
            {empresa && (
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input value={empresa} readOnly />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seguranca" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Troque sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:max-w-md" onSubmit={trocarSenha}>
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input id="senhaAtual" type="password" value={senhaAtual} onChange={(e)=>setSenhaAtual(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input id="novaSenha" type="password" value={novaSenha} onChange={(e)=>setNovaSenha(e.target.value)} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={trocando}>{trocando ? "Trocando…" : "Atualizar senha"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
