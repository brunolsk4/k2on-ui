"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import apiClient from "@/lib/apiClient"
import Dashboard from "@/app/dashboards/go/12/_parts/Dashboard"

export default function DashboardGoTemplate12({ searchParams }: { searchParams?: { id?: string } }) {
  const projetoId = React.useMemo(()=> Number(searchParams?.id || 0) || null, [searchParams?.id])
  const [projectName, setProjectName] = React.useState<string>("")

  React.useEffect(()=>{ (async()=>{ if(!projetoId) return; try{ const p:any = await apiClient.request(`/api/projects/${projetoId}`, { withAuth:true }); setProjectName(p?.nome || "Dashboard") }catch{} })() },[projetoId])

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={projectName || "Dashboard"} />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <Dashboard />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
