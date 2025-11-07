"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import Protected from "@/components/protected"
import ProfileHeader from "@/components/profile-page/components/profile-header"
import ProfileContent from "@/components/profile-page/components/profile-content"

export default function PerfilPage() {
  return (
    <Protected>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="container mx-auto space-y-6 px-4 py-6">
            <ProfileHeader />
            <ProfileContent />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  )
}
