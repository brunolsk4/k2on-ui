"use client"
import * as React from "react"

type PopoverProps = { children: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean)=>void }
export function Popover({ children }: PopoverProps) { return <>{children}</> }
export function PopoverTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) { return <>{children}</> }
export function PopoverContent({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) {
  return <div className={className} data-align={align}>{children}</div>
}
