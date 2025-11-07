import { Card, CardContent } from "@/components/ui/card";

interface LeadsPerdidosMetricsProps {
  perdidos: number;
  valorPerdido: number;
  taxaPerda: number;
  cicloPerdidos: number;
}

export function LeadsPerdidosMetrics({ perdidos, valorPerdido, taxaPerda, cicloPerdidos }: LeadsPerdidosMetricsProps) {
  const metrics = [
    {
      label: "Perdidos",
      value: perdidos.toLocaleString('pt-BR'),
      borderColor: "border-t-red-500",
    },
    {
      label: "R$ Perdidos",
      value: `R$ ${valorPerdido.toLocaleString('pt-BR')}`,
      borderColor: "border-t-red-500",
    },
    {
      label: "Taxa de Perda",
      value: `${taxaPerda.toFixed(2)}%`,
      borderColor: "border-t-red-500",
    },
    {
      label: "Ciclo Perdidos",
      value: `${cicloPerdidos.toFixed(1)} dias`,
      borderColor: "border-t-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className={`border-t-4 ${metric.borderColor}`}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
