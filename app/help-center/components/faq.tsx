"use client"

import { useState } from "react"

type Item = { id: string; question: string; answer: string }
export default function FAQ({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <div className="mx-auto grid max-w-4xl gap-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-md border bg-background">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            onClick={() => setOpenId(openId === it.id ? null : it.id)}
            aria-expanded={openId === it.id}
          >
            <span className="font-medium">{it.question}</span>
            <span className="text-muted-foreground text-xs">{openId === it.id ? "Ocultar" : "Ver resposta"}</span>
          </button>
          {openId === it.id && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              {it.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

