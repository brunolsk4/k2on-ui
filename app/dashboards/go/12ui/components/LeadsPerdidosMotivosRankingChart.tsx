import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { motivo: "BFJ25 - Não respondeu", quantidade: 8934 },
  { motivo: "BC9 - Preço alto", quantidade: 6723 },
  { motivo: "BD12 - Sem interesse", quantidade: 4567 },
  { motivo: "BG8 - Concorrente", quantidade: 3456 },
  { motivo: "BH5 - Sem budget", quantidade: 2890 },
  { motivo: "BK3 - Timing ruim", quantidade: 1987 },
];

const chartConfig = {
  quantidade: {
    label: "Quantidade",
    color: "hsl(var(--destructive))",
  },
};

export function LeadsPerdidosMotivosRankingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Motivos de Perda (Ranking)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 150 }}>
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                dataKey="motivo"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={150}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quantidade" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
