"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"
import { IconCirclePlusFilled } from "@tabler/icons-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

function humanize(path: string) {
  const map: Record<string, string> = {
    home: "Home",
    perfil: "Perfil",
    "help-center": "Help Center",
    catalogo: "Catálogo",
    login: "Login",
    "reset-password": "Recuperar senha",
  }
  return map[path] || path.charAt(0).toUpperCase() + path.slice(1)
}

export function SiteHeader({ title }: { title?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  let current = title || ""
  if (!current) {
    const seg = (pathname || "/").replace(/\/+$/,'').split('/').filter(Boolean)
    // usa último segmento após /ui
    const last = seg[seg.lastIndexOf('ui') + 1] || seg[seg.length - 1] || "home"
    current = humanize(last || "home")
  }
  return (
    <header className="flex h-(--header-height) min-h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-semibold truncate min-w-0 flex-1">
          <span className="align-middle">{current}</span>
        </h1>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                size="sm"
                onClick={() => router.push('/project-create')}
              >
                <IconCirclePlusFilled className="mr-1" />
                <span>Criar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/project-create')}>
                Criar novo projeto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/integracoes')}>
                Nova integração
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
