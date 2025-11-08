"use client"
import * as React from "react"

export default function AuthSuccessPage(){
  React.useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        // Compat: alguns provedores mandam fragmento
        if (!params.get('token') && window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
          if (hash.get('token')) params.set('token', String(hash.get('token')))
          if (hash.get('next') && !params.get('next')) params.set('next', String(hash.get('next')))
        }

        const token = params.get('token') || ''
        const next = params.get('next') || params.get('redirect') || params.get('redirectTo') || '/app/home'

        if (token) {
          try {
            localStorage.setItem('k2on.auth.token', token)
            sessionStorage.removeItem('k2on.auth.token')
          } catch {}

          // Cookie httpOnly para SSR/rotas protegidas do Next — aguarda resposta
        const api = ((process.env.NEXT_PUBLIC_API_URL || (typeof window!=='undefined'? window.location.origin : '')) as string).replace(/\/$/, '')
          if (api) {
            try {
              await fetch(`${api}/auth/token-cookie`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, remember: true })
              })
            } catch {}
          }
        }

        // Redirecionar somente depois de tentar setar o cookie
        setTimeout(() => { try{ window.location.replace(next || '/app/home') } catch { window.location.href = next || '/app/home' } }, 100)
      } catch {
        window.location.replace('/app/home')
      }
    })()
  }, [])

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted-foreground, #666)' }}>
        Autenticando…
      </div>
    </div>
  )
}
