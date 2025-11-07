"use client"
import * as React from "react"

type Variant = "default" | "destructive" | "warning" | "info"

export function Alert({ variant = "info", className = "", children }: { variant?: Variant; className?: string; children: React.ReactNode }) {
  const color = variant === 'destructive' ? 'border-red-300 bg-red-50 text-red-900'
    : variant === 'warning' ? 'border-yellow-300 bg-yellow-50 text-yellow-900'
    : variant === 'info' ? 'border-blue-300 bg-blue-50 text-blue-900'
    : 'border-border bg-muted text-foreground'
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${color} ${className}`}>{children}</div>
  )
}

