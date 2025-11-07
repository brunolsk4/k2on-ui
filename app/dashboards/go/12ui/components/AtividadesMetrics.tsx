import { Card, CardContent } from "@/components/ui/card";

interface AtividadesMetricsProps {
  atividades: number;
  concluidas: number;
  concluidasNoPrazo: number;
}

export function AtividadesMetrics({ atividades, concluidas, concluidasNoPrazo }: AtividadesMetricsProps) {
  const metrics = [
    {
      label: "Atividades",
      value: atividades.toLocaleString('pt-BR'),
      borderColor: "border-t-[hsl(var(--metric-pink))]",
    },
    {
      label: "Concluídas",
      value: concluidas.toLocaleString('pt-BR'),
      borderColor: "border-t-[hsl(var(--metric-pink))]",
    },
    {
      label: "Concluídas no prazo",
      value: `${concluidasNoPrazo.toFixed(2)}%`,
      borderColor: "border-t-[hsl(var(--metric-pink))]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
