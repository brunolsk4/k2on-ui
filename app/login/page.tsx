"use client"

import { LoginForm } from "@/components/login-form"
import React from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"

export default function LoginPage() {
  const router = useRouter()
  React.useEffect(() => {
    const token = apiClient.getAccessToken()
    if (!token) return
    // Valida token no backend antes de redirecionar para evitar loops
    const nextParam = (() => {
      try {
        const url = new URL(window.location.href)
        // Middleware envia 'redirect', mas também aceitamos 'next' por compatibilidade
        return url.searchParams.get("redirect") || url.searchParams.get("next") || "/home"
      } catch {
        return "/home"
      }
    })()
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || (typeof window!== 'undefined' ? window.location.origin : ''))
    const postCookie = async () => {
      let valid = false
      try {
        // Primeiro checa o token com o backend
        await apiClient.me()
        valid = true
        if (API_URL) {
          await fetch(`${API_URL}/auth/token-cookie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token, remember: true }),
          }).catch(() => {})
        }
      } catch {
        // Token inválido: limpa e permanece no login (sem redirecionar)
        try { apiClient.logout() } catch {}
      }
      if (!valid) return
      // Evita replace desnecessário se já estamos no destino
      try {
        const curr = new URL(window.location.href)
        const dest = new URL(nextParam, curr.origin)
        if (curr.pathname + curr.search !== dest.pathname + dest.search) {
          router.replace(nextParam)
        }
      } catch {
        router.replace(nextParam)
      }
    }
    postCookie()
  }, [router])

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
