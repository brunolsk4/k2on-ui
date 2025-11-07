"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CatalogoRedirect() {
  const router = useRouter()
  useEffect(() => {
    try {
      const search = window.location.search || "";
      router.replace(`/wizard/step-template${search}`)
    } catch {
      router.replace(`/wizard/step-template`)
    }
  }, [router])
  return null
}
