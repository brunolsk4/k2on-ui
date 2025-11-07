import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type KpiCardProps = {
  title: string
  value: React.ReactNode
  badge?: React.ReactNode
  footerPrimary?: React.ReactNode
  footerSecondary?: React.ReactNode
}

export function KpiCard({ title, value, badge, footerPrimary, footerSecondary }: KpiCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {badge ? (
          <CardAction>
            <Badge variant="outline">{badge}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      {(footerPrimary || footerSecondary) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {footerPrimary ? (
            <div className="line-clamp-1 flex gap-2 font-medium">{footerPrimary}</div>
          ) : null}
          {footerSecondary ? (
            <div className="text-muted-foreground">{footerSecondary}</div>
          ) : null}
        </CardFooter>
      )}
    </Card>
  )
}

