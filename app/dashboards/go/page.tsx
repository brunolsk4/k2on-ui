"use client"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import apiClient from "@/lib/apiClient"

type Loaded = {
  Component: React.ComponentType<{ searchParams?: { id?: string } }>
  templateId: number
}

export default function DashboardGoGeneric() {
  const sp = useSearchParams()
  const pid = sp?.get('id') || ''
  const projetoId = React.useMemo(()=> Number(pid || 0) || null, [pid])
  const [state, setState] = React.useState<Loaded | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function run(){
      if (!projetoId) { setError('Projeto inválido.'); return }
      try {
        const p:any = await apiClient.request(`/api/projects/${projetoId}`, { withAuth:true })
        const engine = String(p?.engine || '').toLowerCase()
        if (engine !== 'go') { setError('Projeto não é do tipo Go.'); return }
        const tid:number = Number(p?.template_id || p?.templateId || 0) || 0
        const mod = await (async()=>{
          switch (tid) {
            case 12:
              return await import('./12/page')
            case 13:
              return await import('./13/page')
            case 14:
              return await import('./14/page')
            case 15:
              return await import('./15/page')
            default:
              // fallback para 12 até existirem outros
              return await import('./12/page')
          }
        })()
        if (cancelled) return
        setState({ Component: (mod as any).default, templateId: tid || 12 })
      } catch (e:any) {
        if (!cancelled) setError('Falha ao carregar dashboard.')
      }
    }
    run()
    return () => { cancelled = true }
  }, [projetoId])

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-3xl mx-auto text-sm text-muted-foreground">Carregando dashboard…</div>
      </div>
    )
  }

  const Comp = state.Component
  return <Comp searchParams={{ id: String(projetoId || '') }} />
}
