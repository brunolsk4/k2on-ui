"use client"
import * as React from "react"

type CalendarProps = {
  mode?: 'single' | 'multiple' | 'range'
  selected?: any
  onSelect?: (value: any) => void
  initialFocus?: boolean
  locale?: any
  numberOfMonths?: number
  defaultMonth?: Date
  className?: string
}

export function Calendar({ className, children }: CalendarProps & { children?: React.ReactNode }) {
  // Placeholder calendar to allow build; replace with real implementation if needed.
  return <div className={className || "p-4 text-sm text-muted-foreground"}>{children || 'Calendário'}</div>
}
