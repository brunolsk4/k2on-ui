"use client"

import * as React from "react"
import apiClient from "@/lib/apiClient"
import {
  IconCamera,
  IconHome,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconRobot,
  IconPlugConnected,
  IconCategory,
} from "@tabler/icons-react"
import { Link as IconLink } from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { trackFeatureInterest } from "@/lib/featureInterest"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconLock } from "@tabler/icons-react"

// Lista de usuários com acesso antecipado ao Assistente inteligente
const AI_BETA_USERS = new Set(["80"])

const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: IconHome,
    },
    {
      title: "Projetos",
      url: "/home-projetos",
      icon: IconFolder,
    },
    {
      title: "Equipe",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Catálogo",
      url: "/catalogo",
      icon: IconCategory,
    },
    {
      title: "Relatórios agendados",
      url: "/reports",
      icon: IconReport,
    },
    {
      title: "Assistente inteligente",
      url: "/assistente-inteligente",
      icon: IconRobot,
      onClick: async () => {
        // registra o clique explícito no menu
        trackFeatureInterest("assistente_inteligente", "menu_click")
      }
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/help-center",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Conectores e Apps",
      url: "/integracoes",
      icon: IconDatabase,
    },
    {
      name: "Relatórios agendados",
      url: "#",
      icon: IconReport,
    },
    
    {
      name: "Aplicativos conectados",
      url: "/integracoes",
      icon: IconPlugConnected,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(data.user)
  const [aiLocked, setAiLocked] = React.useState(true)
  const [reportsLocked, setReportsLocked] = React.useState(false)
  const [consultoriaEnabled, setConsultoriaEnabled] = React.useState(false)
  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const me = await apiClient.me()
        if (cancel) return
        setUser({
          name: (me as any).nomeCompleto || me.name || "",
          email: me.email || "",
          avatar: (me as any).avatar_url || (me as any).avatarUrl || "/app/favicon.ico",
        })
        const role = String((me as any).role || '').toLowerCase()
        setConsultoriaEnabled(role === 'consultoria' || role === 'admin')
        const userId = String((me as any).id ?? (me as any).userId ?? (me as any).usuarioId ?? "")
        const allowedAiUser = AI_BETA_USERS.has(userId)
        setAiLocked(!allowedAiUser)
      } catch {
        // mantém defaults
      }
    })()
    try {
      setReportsLocked(localStorage.getItem('k2on.lock.reports') === '1')
    } catch {}
    return () => { cancel = true }
  }, [])
  const navItems = React.useMemo(() => {
    // Base sem "Assistente inteligente" e "Relatórios agendados"
    const baseMain = data.navMain.filter(i => !['Assistente inteligente','Relatórios agendados','Equipe'].includes(i.title))
    // Adiciona Consultoria (Sales Check), se aplicável
    const consultoria = (consultoriaEnabled
      ? [{
          title: "Sales Check",
          url: "/consultoria/sales-check",
          icon: IconLink,
          visible: true,
        } as any]
      : [])
    // Reinsere "Equipe" por último nesta seção principal
    const equipeItem = data.navMain.find(i => i.title === 'Equipe')
    const mainSection = [...baseMain, ...consultoria, ...(equipeItem ? [equipeItem] : [])]

    const trailing = [
      {
        title: "Relatórios agendados",
        url: "/reports",
        icon: reportsLocked ? IconLock : IconReport,
        disabled: reportsLocked,
        onClick: async () => {
          try { (await import("@/lib/featureInterest")).trackFeatureInterest("reports", "menu_click") } catch {}
        }
      },
      {
        title: "Assistente inteligente",
        url: "/assistente-inteligente",
        icon: aiLocked ? IconLock : IconRobot,
        disabled: aiLocked,
        onClick: async () => {
          try { (await import("@/lib/featureInterest")).trackFeatureInterest("assistente_inteligente", "menu_click") } catch {}
        }
      }
    ]

    return [...mainSection, ...trailing]
  }, [aiLocked, reportsLocked, consultoriaEnabled])
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="/home" className="flex items-center gap-2">
                  <img src="/app/favicon.ico" alt="K2ON" className="size-5 rounded-sm" />
                  <span className="text-base font-semibold">K2ON</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems as any} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
