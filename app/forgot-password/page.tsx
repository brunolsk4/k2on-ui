"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import apiClient from "@/lib/apiClient"
import { useRouter } from "next/navigation"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("E-mail inválido")
      }
      await apiClient.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err?.message || "Não foi possível enviar o e-mail")
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
              <h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
              <FieldDescription>
                Digite seu e-mail e enviaremos um link para recuperação
              </FieldDescription>
            </div>
            {sent ? (
              <div className="rounded-md bg-emerald-600/90 px-3 py-2 text-sm text-white">
                Enviamos um link de recuperação para seu e-mail.
              </div>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input id="email" type="email" placeholder="voce@email.com" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                </Field>
                {error && (
                  <div className="rounded-md bg-red-600/90 px-3 py-2 text-sm text-white">{error}</div>
                )}
                <Field>
                  <Button type="submit" disabled={loading}>{loading ? "Enviando…" : "Enviar link de recuperação"}</Button>
                </Field>
              </>
            )}
            <Button type="button" variant="ghost" onClick={()=>router.push("/login")}>Voltar para o login</Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}

