import Link from "next/link"

type Props = {
  title: string
  description: string
  linkText: string
  href: string
}

export default function ListItem({ title, description, linkText, href }: Props) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-4 text-sm">{description}</p>
      <Link href={href} className="text-primary hover:underline text-sm font-medium">
        {linkText}
      </Link>
    </div>
  )
}

