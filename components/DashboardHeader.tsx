"use client"
import * as React from "react"
import { SiteHeader } from "@/components/site-header"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SettingsDialog } from "@/components/SettingsDialog"

export function DashboardHeader(){
  return (
    <div className="space-y-3">
      <SiteHeader title="Painel Executivo" />
      <div className="flex items-center justify-end gap-2 px-4 lg:px-6">
        <ThemeToggle />
        <SettingsDialog />
      </div>
    </div>
  )
}

