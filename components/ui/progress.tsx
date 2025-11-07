"use client"
import * as React from "react"

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & { value?: number }

export function Progress({ value = 0, className = "", ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`} {...props}>
      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

