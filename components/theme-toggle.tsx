"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { IconMoon, IconSun } from "@tabler/icons-react"
import * as React from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = (resolvedTheme || theme) === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")

  if (!mounted) return null
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
      {isDark ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
    </Button>
  )
}

