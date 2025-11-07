"use client"
import * as React from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import apiClient from "@/lib/apiClient";

type ApiTemplate = {
  id: number;
  nome: string;
  descricao?: string;
  imagem?: string;
  // Campos opcionais, se existirem na API
  ativo?: boolean | string;
  instalacoes?: number; // tentativa de campo conhecido
  installs?: number;    // fallback
}

function useTemplatesOrdenados() {
  const [items, setItems] = React.useState<ApiTemplate[]>([])
  React.useEffect(() => { (async () => {
    try {
      const data = await apiClient.request<ApiTemplate[]>("/api/templates") as any
      const isAtivo = (t: ApiTemplate) => {
        const v: any = (t as any).ativo
        if (typeof v === 'boolean') return v
        if (typeof v === 'string') return v.toLowerCase() === 'ativo' || v.toLowerCase() === 'active' || v === '1'
        return true // se não há campo, assume ativo
      }
      const count = (t: ApiTemplate) => {
        const c = (t as any).instalacoes ?? (t as any).installs ?? (t as any).installations ?? 0
        return Number(c) || 0
      }
      const ativos = (data || []).filter(isAtivo)
      const ordenados = ativos.sort((a: ApiTemplate, b: ApiTemplate) => count(b) - count(a))
      setItems(ordenados)
    } catch {
      setItems([])
    }
  })() }, [])
  return items
}

export function DashboardsSection() {
  const templates = useTemplatesOrdenados()
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Explorar Dashboards</h2>
          <p className="text-muted-foreground mt-1">Templates mais instalados (ativos)</p>
        </div>
        <Button variant="default" size="sm">
          Ver catálogo completo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs">
        {templates.map((t) => (
          <Card key={t.id} className="cursor-pointer transition-all group">
            <CardHeader>
              <div className="rounded-lg bg-primary/10 p-3 w-fit group-hover:bg-primary/20 transition-colors">
                {t.imagem ? (
                  // Imagem de capa do template
                  <img src={t.imagem} alt={t.nome} className="h-6 w-6 object-cover rounded" />
                ) : (
                  <BarChart3 className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg mt-3">{t.nome}</CardTitle>
              <CardDescription>{t.descricao || ""}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
