"use client"

import { useState } from "react"

type Item = { id: string; question: string; answer: string }

export default function FAQ({ items }: { items: Item[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-card shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              aria-expanded={openId === item.id}
            >
              <span className="text-lg font-medium">{item.question}</span>
              <span className="text-muted-foreground text-xs">{openId === item.id ? "Ocultar" : "Ver resposta"}</span>
            </button>
            {openId === item.id && (
              <div className="text-muted-foreground px-4 pb-5 text-base leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
