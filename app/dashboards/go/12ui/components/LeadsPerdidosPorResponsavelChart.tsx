import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { nome: "David Vélez", quantidade: 23119 },
  { nome: "Youssef Lahrech", quantidade: 4465 },
  { nome: "Guilherme Lago", quantidade: 507 },
  { nome: "(Em branco)", quantidade: 212 },
];

const chartConfig = {
  quantidade: {
    label: "Quantidade",
    color: "hsl(var(--destructive))",
  },
};

export function LeadsPerdidosPorResponsavelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Por Responsável</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                dataKey="nome"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
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
