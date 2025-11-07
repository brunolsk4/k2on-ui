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
    // Se já autenticado no client, garante cookie httpOnly e redireciona
    const nextParam = (() => {
      try {
        const url = new URL(window.location.href)
        return url.searchParams.get("next") || "/home"
      } catch {
        return "/home"
      }
    })()
    const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
    const postCookie = async () => {
      try {
        if (API_URL) {
          await fetch(`${API_URL}/auth/token-cookie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token, remember: true }),
          }).catch(() => {})
        }
      } catch {}
      router.replace(nextParam)
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
