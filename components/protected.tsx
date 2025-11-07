"use client"

import React from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"

// Usar rotas relativas; Next aplicará basePath automaticamente
const BASE = "";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = React.useState(false)

  React.useEffect(() => {
    const token = apiClient.getAccessToken()
    if (!token) {
      router.replace(`/login`)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await apiClient.me()
        if (!cancelled) setOk(true)
        // Registrar atividade diária após validar token no backend
        try {
          const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
          if (API && token) {
            fetch(`${API}/api/atividade/ping`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'include'
            }).catch(() => {})
          }
        } catch {}
      } catch {
        if (!cancelled) router.replace(`/login`)
      }
    })()
    return () => { cancelled = true }
  }, [router])

  if (!ok) return null
  return <>{children}</>
}
