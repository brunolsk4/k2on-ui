"use client"

type Props = {
  value: string
  onChange: (v: string) => void
  onSubmit?: () => void
}

export default function Search({ value, onChange, onSubmit }: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.()
  }
  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-center gap-2">
      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder="Busque por um tópico ou dúvida (ex.: billing, suporte)"
        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
        Buscar
      </button>
    </form>
  )
}
