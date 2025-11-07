"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Protected from "@/components/protected";
import TeamManagement from "@/components/team/TeamManagement";

export default function Page() {
  return (
    <Protected>
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader title="Equipe" />
          <TeamManagement />
        </SidebarInset>
      </SidebarProvider>
    </Protected>
  );
}

