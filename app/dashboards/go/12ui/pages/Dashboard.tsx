import { RevenueCard } from "@/components/RevenueCard";
import { GanhosCard } from "@/components/GanhosCard";
import { ConversaoCard } from "@/components/ConversaoCard";
import { CicloVendasCard } from "@/components/CicloVendasCard";
import { NovasOportunidadesCard } from "@/components/NovasOportunidadesCard";
import { TicketMedioCard } from "@/components/TicketMedioCard";
import { ZoomChartCard } from "@/components/ZoomChartCard";
import { FunnelCard } from "@/components/FunnelCard";
import { BarrasHorizontaisCard } from "@/components/BarrasHorizontaisCard";
import { TabelaCRM } from "@/components/TabelaCRM";
import { Navigation } from "@/app/dashboards/go/12ui/components/Navigation";
import { TopFilters } from "@/components/dashboards/go/_shared/TopFilters";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Navigation />
      <TopFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NovasOportunidadesCard />
        <GanhosCard />
        <ConversaoCard />
        <CicloVendasCard />
        <RevenueCard />
        <TicketMedioCard />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="lg:col-span-2">
          <ZoomChartCard />
        </div>
        <div className="lg:col-span-1">
          <FunnelCard />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <BarrasHorizontaisCard />
        <BarrasHorizontaisCard />
        <BarrasHorizontaisCard />
      </div>

      <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <TabelaCRM />
      </div>
    </div>
  );
}
