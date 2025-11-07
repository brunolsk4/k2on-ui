import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const chartData = [
  {
    motivo: "Não respondeu mensagens",
    "David Vélez": 1113,
    "Youssef Lahrech": 482,
    "Guilherme Lago": 8,
    total: 1603,
  },
  {
    motivo: "Preço muito alto",
    "David Vélez": 890,
    "Youssef Lahrech": 356,
    "Guilherme Lago": 23,
    total: 1269,
  },
  {
    motivo: "Sem interesse",
    "David Vélez": 756,
    "Youssef Lahrech": 298,
    "Guilherme Lago": 45,
    total: 1099,
  },
  {
    motivo: "Escolheu concorrente",
    "David Vélez": 623,
    "Youssef Lahrech": 234,
    "Guilherme Lago": 12,
    total: 869,
  },
  {
    motivo: "Não tem budget",
    "David Vélez": 445,
    "Youssef Lahrech": 178,
    "Guilherme Lago": 34,
    total: 657,
  },
];

const responsaveis = ["David Vélez", "Youssef Lahrech", "Guilherme Lago"];
const colors = ["hsl(var(--destructive))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

const chartConfig = {
  "David Vélez": { label: "David Vélez", color: "hsl(var(--destructive))" },
  "Youssef Lahrech": { label: "Youssef Lahrech", color: "hsl(var(--chart-2))" },
  "Guilherme Lago": { label: "Guilherme Lago", color: "hsl(var(--chart-3))" },
};

export function LeadsPerdidosMotivosChart() {
  const [heatmapMode, setHeatmapMode] = useState(false);

  const getHeatmapColor = (value: number, max: number) => {
    const intensity = value / max;
    const hue = 0; // Red hue
    const saturation = 70;
    const lightness = 60 - intensity * 40; // Darker for higher values
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const maxValue = Math.max(...chartData.map((d) => d.total));

  if (heatmapMode) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Motivos de Perda por Responsável</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="heatmap-toggle" className="text-sm text-muted-foreground">
                Heatmap
              </Label>
              <Switch id="heatmap-toggle" checked={heatmapMode} onCheckedChange={setHeatmapMode} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium">
              <div>Motivo</div>
              {responsaveis.map((r) => (
                <div key={r}>{r}</div>
              ))}
            </div>
            {chartData.map((row) => (
              <div key={row.motivo} className="grid grid-cols-4 gap-2">
                <div className="text-sm">{row.motivo}</div>
                {responsaveis.map((resp) => (
                  <div
                    key={resp}
                    className="p-3 rounded text-center font-medium"
                    style={{ backgroundColor: getHeatmapColor(row[resp as keyof typeof row] as number, maxValue) }}
                  >
                    {row[resp as keyof typeof row]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Motivos de Perda por Responsável</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="heatmap-toggle" className="text-sm text-muted-foreground">
              Heatmap
            </Label>
            <Switch id="heatmap-toggle" checked={heatmapMode} onCheckedChange={setHeatmapMode} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
              {responsaveis.map((responsavel, index) => (
                <Bar
                  key={responsavel}
                  dataKey={responsavel}
                  fill={colors[index]}
                  radius={index === responsaveis.length - 1 ? [0, 4, 4, 0] : 0}
                  stackId="a"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
