import { FileText, TrendingUp, DollarSign, Users, Target, PhoneCall } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricCard } from "./MetricCard";

interface ConfigurationPanelProps {
  selectedProject: string;
  onProjectChange: (value: string) => void;
  onMetricDrop: (metric: string) => void;
}

const projects = [
  { id: "1", name: "E-commerce Principal", active: true },
  { id: "2", name: "Campanha Verão 2024", active: true },
  { id: "3", name: "Geração de Leads", active: true },
  { id: "4", name: "Multi-canal 2024", active: false },
];

const integrations = [
  { name: "Meta Ads", icon: TrendingUp, color: "text-blue-500" },
  { name: "Kommo", icon: PhoneCall, color: "text-green-500" },
];

const metrics = [
  { id: "vendas", label: "Vendas", icon: DollarSign, category: "Kommo" },
  { id: "devolucoes", label: "Devoluções", icon: FileText, category: "Kommo" },
  { id: "investimento", label: "Investimento", icon: Target, category: "Meta Ads" },
  { id: "leads", label: "Leads", icon: Users, category: "Meta Ads" },
  { id: "custo_por_lead", label: "Custo por Lead", icon: DollarSign, category: "Meta Ads" },
  { id: "roas", label: "ROAS", icon: TrendingUp, category: "Meta Ads" },
];

export const ConfigurationPanel = ({
  selectedProject,
  onProjectChange,
  onMetricDrop,
}: ConfigurationPanelProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-card rounded-xl border p-6 card-elevated">
        <h2 className="text-xl font-semibold mb-4">Configuração</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Projeto Vinculado
            </label>
            <Select value={selectedProject} onValueChange={onProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {projects
                  .filter((p) => p.active)
                  .map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <>
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Integrações Disponíveis
                </label>
                <div className="flex gap-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.name}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary"
                    >
                      <integration.icon
                        className={`h-4 w-4 ${integration.color}`}
                      />
                      <span className="text-sm font-medium">
                        {integration.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Métricas Principais
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Arraste as métricas para o editor de mensagem
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((metric) => (
                    <MetricCard
                      key={metric.id}
                      metric={metric}
                      onDrop={onMetricDrop}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
