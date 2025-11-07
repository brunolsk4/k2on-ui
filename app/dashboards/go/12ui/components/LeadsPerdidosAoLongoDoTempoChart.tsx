import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateRange {
  from: Date;
  to: Date;
}

interface LeadsPerdidosAoLongoDoTempoChartProps {
  dateRange: DateRange;
}

// Mock data generator based on date range
const generateChartData = (dateRange: DateRange) => {
  const daysDiff = differenceInDays(dateRange.to, dateRange.from);
  
  if (daysDiff > 45) {
    // Group by month
    return [
      { periodo: "Jan", perdidos: 2340, date: "Janeiro 2024" },
      { periodo: "Fev", perdidos: 2890, date: "Fevereiro 2024" },
      { periodo: "Mar", perdidos: 3120, date: "Março 2024" },
      { periodo: "Abr", perdidos: 2650, date: "Abril 2024" },
      { periodo: "Mai", perdidos: 3450, date: "Maio 2024" },
      { periodo: "Jun", perdidos: 2980, date: "Junho 2024" },
      { periodo: "Jul", perdidos: 3210, date: "Julho 2024" },
      { periodo: "Ago", perdidos: 2870, date: "Agosto 2024" },
      { periodo: "Set", perdidos: 3340, date: "Setembro 2024" },
      { periodo: "Out", perdidos: 2897, date: "Outubro 2024" },
    ];
  } else {
    // Group by day
    return [
      { periodo: "01/10", perdidos: 95, date: "01/10/2024" },
      { periodo: "02/10", perdidos: 112, date: "02/10/2024" },
      { periodo: "03/10", perdidos: 87, date: "03/10/2024" },
      { periodo: "04/10", perdidos: 134, date: "04/10/2024" },
      { periodo: "05/10", perdidos: 98, date: "05/10/2024" },
      { periodo: "06/10", perdidos: 76, date: "06/10/2024" },
      { periodo: "07/10", perdidos: 123, date: "07/10/2024" },
      { periodo: "08/10", perdidos: 145, date: "08/10/2024" },
      { periodo: "09/10", perdidos: 91, date: "09/10/2024" },
      { periodo: "10/10", perdidos: 108, date: "10/10/2024" },
    ];
  }
};

const chartConfig = {
  perdidos: {
    label: "Perdidos",
    color: "hsl(var(--destructive))",
  },
};

export function LeadsPerdidosAoLongoDoTempoChart({ dateRange }: LeadsPerdidosAoLongoDoTempoChartProps) {
  const chartData = generateChartData(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perdidos ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="periodo"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "hsl(var(--muted))" }}
              />
              <Bar dataKey="perdidos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
