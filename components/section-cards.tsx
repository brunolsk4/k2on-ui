import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { KpiCard } from "@/components/kpi-card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <KpiCard
        title="Total Revenue"
        value="$1,250.00"
        badge={<><IconTrendingUp /> +12.5%</>}
        footerPrimary={<><span>Trending up this month</span> <IconTrendingUp className="size-4" /></>}
        footerSecondary="Visitors for the last 6 months"
      />
      <KpiCard
        title="New Customers"
        value="1,234"
        badge={<><IconTrendingDown /> -20%</>}
        footerPrimary={<><span>Down 20% this period</span> <IconTrendingDown className="size-4" /></>}
        footerSecondary="Acquisition needs attention"
      />
      <KpiCard
        title="Active Accounts"
        value="45,678"
        badge={<><IconTrendingUp /> +12.5%</>}
        footerPrimary={<><span>Strong user retention</span> <IconTrendingUp className="size-4" /></>}
        footerSecondary="Engagement exceed targets"
      />
      <KpiCard
        title="Growth Rate"
        value="4.5%"
        badge={<><IconTrendingUp /> +4.5%</>}
        footerPrimary={<><span>Steady performance increase</span> <IconTrendingUp className="size-4" /></>}
        footerSecondary="Meets growth projections"
      />
    </div>
  )
}
