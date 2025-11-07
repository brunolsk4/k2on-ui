"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import React from "react"
import apiClient from "@/lib/apiClient"
import { useRouter } from "next/navigation"
import { PhoneInput } from "@/components/phone-input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [telefone, setTelefone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError("As senhas não conferem")
      return
    }
    setLoading(true)
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: company,
        password,
        telefone,
      }
      const res = await apiClient.signup(payload)
      if (res?.verification_sent) {
        router.replace("/login?signup=ok")
      } else {
        router.replace("/login")
      }
    } catch (err: any) {
      setError(err?.message || "Falha no cadastro")
    } finally {
      setLoading(false)
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={onSubmit} {...props}>
      <FieldGroup className="gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Preencha os dados abaixo para começar
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="first-name">Nome</FieldLabel>
          <Input id="first-name" type="text" placeholder="Seu nome" required value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="h-8" />
        </Field>
        <Field>
          <FieldLabel htmlFor="last-name">Sobrenome</FieldLabel>
          <Input id="last-name" type="text" placeholder="Seu sobrenome" required value={lastName} onChange={(e)=>setLastName(e.target.value)} className="h-8" />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e)=>setEmail(e.target.value)} className="h-8" />
        </Field>
        <Field>
          <FieldLabel htmlFor="company">Empresa</FieldLabel>
          <Input id="company" type="text" placeholder="Nome da empresa" required value={company} onChange={(e)=>setCompany(e.target.value)} className="h-8" />
        </Field>
        <Field>
          <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
          <PhoneInput
            value={telefone}
            onChange={(v)=>setTelefone(v || "")}
            className="h-8"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="h-8" />
          <FieldDescription>Mínimo de 8 caracteres.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar senha</FieldLabel>
          <Input id="confirm-password" type="password" required value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="h-8" />
          <FieldDescription>Repita a senha para confirmar.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>{loading ? "Criando…" : "Criar conta"}</Button>
        </Field>
        {error && (
          <div className="rounded-md bg-red-600/90 px-3 py-2 text-sm text-white">{error}</div>
        )}
        <FieldSeparator>ou</FieldSeparator>
        {/* Botões sociais para cadastro via Google/Meta */}
        <Field className="grid gap-4 sm:grid-cols-2">
          <SocialButtons />
        </Field>
      </FieldGroup>
    </form>
  )
}

function SocialButtons() {
  const [remember] = React.useState(true)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || ""
  function openExternal(url: string) {
    try { localStorage.setItem("k2on_use_react", "true") } catch {}
    window.location.href = url
  }
  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          const url = `${apiBase}/auth/facebook?rememberMe=${remember ? "true" : "false"}`
          openExternal(url)
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
            fill="currentColor"
          />
        </svg>
        Entre com Meta
      </Button>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          const clientId = "600017068006-oj4k6rplf6du4425r56ag6gimljc24ed.apps.googleusercontent.com"
          const redirectUri = `${apiBase}/auth/google/callback`
          const scopes = ["openid","email","profile"].join(" ")
          const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`
          openExternal(url)
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Entre com Google
      </Button>
    </>
  )
}
