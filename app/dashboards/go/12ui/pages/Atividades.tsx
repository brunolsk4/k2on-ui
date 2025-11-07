import { useState } from "react";
import { subDays } from "date-fns";
import { DateRangeFilter, FilterSelect } from "@/components/dashboards/go/_shared";
import { AtividadesMetrics } from "@/components/dashboards/go/_shared/widgets/AtividadesMetrics";
import { AtividadesAoLongoDoTempoChart } from "@/components/dashboards/go/_shared/widgets/AtividadesAoLongoDoTempoChart";
import { AtividadesPorResponsavelChart } from "@/components/dashboards/go/_shared/widgets/AtividadesPorResponsavelChart";
import { AtividadesPorStatusChart } from "@/components/dashboards/go/_shared/widgets/AtividadesPorStatusChart";
import { AtividadesPorTipoChart } from "@/components/dashboards/go/_shared/widgets/AtividadesPorTipoChart";
import { TabelaAtividades } from "@/components/dashboards/go/_shared/widgets/TabelaAtividades";

interface DateRange {
  from: Date;
  to: Date;
}

// Mock data
const responsaveisOptions = ["David Vélez", "Youssef Lahrech", "Guilherme Lago", "(Em branco)"];
const statusOptions = ["Concluído", "Em aberto", "Atrasado"];
const tipoOptions = ["Reunião", "E-mail", "Ligação", "Tarefa", "WhatsApp"];

export default function Atividades() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [responsaveisSelecionados, setResponsaveisSelecionados] = useState<string[]>([]);
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
  const [tipoSelecionados, setTipoSelecionados] = useState<string[]>([]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestão de Atividades</h1>
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
          label="Status da Tarefa"
          placeholder="Todos"
          options={statusOptions}
          selected={statusSelecionados}
          onSelectionChange={setStatusSelecionados}
          width="w-[220px]"
        />
        <FilterSelect
          label="Tipo de Atividade"
          placeholder="Todos"
          options={tipoOptions}
          selected={tipoSelecionados}
          onSelectionChange={setTipoSelecionados}
          width="w-[220px]"
        />
      </div>

      {/* Cards de Métricas */}
      <AtividadesMetrics
        atividades={10133}
        concluidas={9029}
        concluidasNoPrazo={82.37}
      />

      {/* Gráfico de Atividades ao longo do tempo - linha inteira */}
      <AtividadesAoLongoDoTempoChart dateRange={dateRange} />

      {/* Gráficos inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AtividadesPorResponsavelChart />
        <AtividadesPorStatusChart />
        <AtividadesPorTipoChart />
      </div>

      {/* Tabela de Atividades */}
      <TabelaAtividades />
    </div>
  );
}
