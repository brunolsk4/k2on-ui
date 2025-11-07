"use client"
import * as React from "react"

export function Dialog({ children }: { children: React.ReactNode }) { return <>{children}</> }
export function DialogTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) { return <>{children}</> }
export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={className}>{children}</div> }
export function DialogHeader({ children }: { children: React.ReactNode }) { return <div className="mb-2">{children}</div> }
export function DialogTitle({ children }: { children: React.ReactNode }) { return <h3 className="text-lg font-semibold">{children}</h3> }
export function DialogDescription({ children }: { children: React.ReactNode }) { return <p className="text-sm text-muted-foreground">{children}</p> }

