import { useState } from "react";
import { subDays } from "date-fns";
import { DateRangeFilter, FilterSelect } from "@/components/dashboards/go/_shared";
import { LeadsPerdidosMetrics } from "@/components/dashboards/go/_shared/widgets/LeadsPerdidosMetrics";
import { LeadsPerdidosAoLongoDoTempoChart } from "@/components/dashboards/go/_shared/widgets/LeadsPerdidosAoLongoDoTempoChart";
import { LeadsPerdidosPorResponsavelChart } from "@/components/dashboards/go/_shared/widgets/LeadsPerdidosPorResponsavelChart";
import { LeadsPerdidosMotivosChart } from "@/components/dashboards/go/_shared/widgets/LeadsPerdidosMotivosChart";
import { LeadsPerdidosMotivosRankingChart } from "@/components/dashboards/go/_shared/widgets/LeadsPerdidosMotivosRankingChart";

interface DateRange {
  from: Date;
  to: Date;
}

// Mock data
const responsaveisOptions = ["David Vélez", "Youssef Lahrech", "Guilherme Lago", "(Em branco)"];
const motivosOptions = [
  "Não respondeu mensagens",
  "Preço alto",
  "Comprou concorrente",
  "Não tem orçamento",
  "Projeto cancelado",
];

export default function LeadsPerdidos() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>([]);
  const [motivosSelecionados, setMotivosSelecionados] = useState<string[]>([]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestão de Leads Perdidos</h1>
        <div className="flex gap-2" />
      </div>

      {/* Filtros */}
      <div className="flex items-end gap-4">
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
        <FilterSelect
          label="Responsável"
          placeholder="Todos"
          options={responsaveisOptions}
          selected={responsaveisSelecionados}
          onSelectionChange={setResponsaveisSelecionados}
        />
        <FilterSelect
          label="Motivo de Perda"
          placeholder="Todos"
          options={motivosOptions}
          selected={motivosSelecionados}
          onSelectionChange={setMotivosSelecionados}
          width="w-[220px]"
        />
      </div>

      {/* Cards de Métricas */}
      <LeadsPerdidosMetrics
        perdidos={28657}
        valorPerdido={4486117}
        taxaPerda={79.92}
        cicloPerdidos={36.1}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeadsPerdidosAoLongoDoTempoChart dateRange={dateRange} />
        <LeadsPerdidosPorResponsavelChart />
      </div>

      <LeadsPerdidosMotivosChart />
      
      <LeadsPerdidosMotivosRankingChart />
    </div>
  );
}
