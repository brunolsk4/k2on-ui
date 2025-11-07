"use client"
import * as React from "react"

export default function AuthSuccessPage(){
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      // Compat: alguns provedores mandam fragmento
      if (!params.get('token') && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        if (hash.get('token')) params.set('token', String(hash.get('token')))
        if (hash.get('next') && !params.get('next')) params.set('next', String(hash.get('next')))
      }

      const token = params.get('token') || ''
      const next = params.get('next') || params.get('redirect') || params.get('redirectTo') || '/app'

      if (token) {
        try {
          // Persistir no localStorage para a UI
          localStorage.setItem('k2on.auth.token', token)
          // Também limpar session para evitar conflito
          sessionStorage.removeItem('k2on.auth.token')
        } catch {}

        // Cookie httpOnly para SSR/rotas protegidas do Next
        const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
        if (api) {
          fetch(`${api}/auth/token-cookie`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, remember: true })
          }).catch(() => {})
        }
      }

      // Redirecionar
      const go = () => { window.location.replace(next || '/app') }
      // pequeno delay para gravar cookie
      const t = setTimeout(go, 150)
      return () => clearTimeout(t)
    } catch {
      // fallback
      window.location.replace('/app')
    }
  }, [])

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted-foreground, #666)' }}>
        Autenticando…
      </div>
    </div>
  )
}
