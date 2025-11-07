"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import Atividades from "@/app/dashboards/go/12ui/pages/Atividades"
import { Navigation } from "@/app/dashboards/go/12ui/components/Navigation"
import { TopFilters } from "@/components/dashboards/go/_shared/TopFilters"

export default function AtividadesPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Atividades" />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Navigation />
            <div className="mt-4"><TopFilters /></div>
            <Atividades />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
