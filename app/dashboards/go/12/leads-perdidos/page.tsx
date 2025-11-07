"use client"
import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import LeadsPerdidos from "@/app/dashboards/go/12ui/pages/LeadsPerdidos"
import { Navigation } from "@/app/dashboards/go/12ui/components/Navigation"
import { TopFilters } from "@/components/dashboards/go/_shared/TopFilters"

export default function LeadsPerdidosPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Leads Perdidos" />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <Navigation />
            <div className="mt-4"><TopFilters /></div>
            <LeadsPerdidos />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
