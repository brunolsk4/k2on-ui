"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default function DashboardGoTemplate14({ searchParams }: { searchParams?: { id?: string } }) {
  const projetoId = React.useMemo(()=> Number(searchParams?.id || 0) || null, [searchParams?.id])
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard Go — Template 14" />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <p className="text-sm text-muted-foreground">Projeto: {projetoId ?? '—'}</p>
            <div className="border rounded-md p-4">
              <p className="text-sm">Placeholder do template 14.</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
