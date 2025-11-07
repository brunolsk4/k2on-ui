"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Protected from "@/components/protected"

function isPublicPath(p?: string) {
  if (!p) return true
  return (
    p.endsWith('/login') ||
    p.endsWith('/signup') ||
    p.endsWith('/forgot-password') ||
    p.endsWith('/reset-password') ||
    p.endsWith('/auth-success') ||
    p.endsWith('/otp')
  )
}

export default function AuthGate({ children }: { children: React.ReactNode }){
  const pathname = usePathname()
  if (!pathname || isPublicPath(pathname)) return <>{children}</>
  return <Protected>{children}</Protected>
}
