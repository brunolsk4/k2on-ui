"use client"

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    onClick?: () => void | Promise<void>
    disabled?: boolean
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.disabled ? (
                <SidebarMenuButton asChild tooltip={`${item.title} (bloqueado)`}>
                  <span className="flex items-center gap-2 opacity-60 cursor-not-allowed select-none">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link href={item.url} onClick={item.onClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
import Link from "next/link"
