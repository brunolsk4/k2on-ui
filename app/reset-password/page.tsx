"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import apiClient from "@/lib/apiClient"
import { useRouter } from "next/navigation"

const STRONG_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

export default function ResetPasswordPage() {
  const router = useRouter()
  const token = React.useMemo(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('token') || ''
  }, [])
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const policy = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[\W_]/.test(password),
    match: password.length > 0 && password === confirm,
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) { setError("Token inválido"); return }
    if (!(policy.length && policy.lower && policy.upper && policy.digit && policy.symbol && policy.match)) {
      setError("A senha não atende aos requisitos");
      return
    }
    setLoading(true)
    try {
      await apiClient.resetPassword(token, password)
      setDone(true)
      setTimeout(()=> router.replace("/home"), 800)
    } catch (err: any) {
      setError(err?.message || "Erro ao redefinir")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Redefinir senha</h1>
              <FieldDescription>Digite sua nova senha abaixo</FieldDescription>
            </div>

            {done ? (
              <div className="rounded-md bg-emerald-600/90 px-3 py-2 text-sm text-white">Senha redefinida! Redirecionando…</div>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="password">Nova senha</FieldLabel>
                  <Input id="password" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm">Confirmar senha</FieldLabel>
                  <Input id="confirm" type="password" placeholder="Repita a senha" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />
                </Field>
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium mb-1">Requisitos da senha</div>
                  <ul className="grid gap-1">
                    <li className={policy.length ? 'text-green-600' : 'text-muted-foreground'}>Mínimo de 8 caracteres</li>
                    <li className={policy.upper ? 'text-green-600' : 'text-muted-foreground'}>Pelo menos 1 letra maiúscula (A-Z)</li>
                    <li className={policy.lower ? 'text-green-600' : 'text-muted-foreground'}>Pelo menos 1 letra minúscula (a-z)</li>
                    <li className={policy.digit ? 'text-green-600' : 'text-muted-foreground'}>Pelo menos 1 número (0-9)</li>
                    <li className={policy.symbol ? 'text-green-600' : 'text-muted-foreground'}>Pelo menos 1 símbolo (!@#...)</li>
                  </ul>
                </div>
                {error && (<div className="rounded-md bg-red-600/90 px-3 py-2 text-sm text-white">{error}</div>)}
                <Field>
                  <Button type="submit" disabled={loading || !policy.length || !policy.lower || !policy.upper || !policy.digit || !policy.symbol || !policy.match}>
                    {loading ? "Redefinindo…" : "Redefinir senha"}
                  </Button>
                </Field>
              </>
            )}
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
