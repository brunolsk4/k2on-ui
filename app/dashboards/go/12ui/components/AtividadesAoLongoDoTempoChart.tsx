import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, differenceInDays, eachDayOfInterval, eachMonthOfInterval, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateRange {
  from: Date;
  to: Date;
}

interface AtividadesAoLongoDoTempoChartProps {
  dateRange: DateRange;
}

// Mock data generator com tipos de atividades
const generateMockData = (dateRange: DateRange) => {
  const daysDiff = differenceInDays(dateRange.to, dateRange.from);
  
  if (daysDiff > 45) {
    // Agrupar por mês
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    return months.map((month) => ({
      date: format(month, "MMM/yy", { locale: ptBR }),
      fullDate: month,
      Reunião: Math.floor(Math.random() * 150) + 80,
      "E-mail": Math.floor(Math.random() * 120) + 70,
      Ligação: Math.floor(Math.random() * 100) + 60,
      Tarefa: Math.floor(Math.random() * 80) + 40,
      WhatsApp: Math.floor(Math.random() * 50) + 20,
    }));
  } else {
    // Agrupar por dia
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    return days.map((day) => ({
      date: format(day, "dd/MM", { locale: ptBR }),
      fullDate: day,
      Reunião: Math.floor(Math.random() * 15) + 8,
      "E-mail": Math.floor(Math.random() * 12) + 7,
      Ligação: Math.floor(Math.random() * 10) + 6,
      Tarefa: Math.floor(Math.random() * 8) + 4,
      WhatsApp: Math.floor(Math.random() * 5) + 2,
    }));
  }
};

const COLORS = {
  Reunião: "hsl(var(--metric-pink))",
  "E-mail": "hsl(var(--metric-pink) / 0.8)",
  Ligação: "hsl(var(--metric-pink) / 0.6)",
  Tarefa: "hsl(var(--metric-pink) / 0.4)",
  WhatsApp: "hsl(var(--metric-pink) / 0.2)",
};

export function AtividadesAoLongoDoTempoChart({ dateRange }: AtividadesAoLongoDoTempoChartProps) {
  const data = generateMockData(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades ao longo do tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="square"
              formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
            <Bar dataKey="Reunião" stackId="a" fill={COLORS.Reunião} radius={[0, 0, 0, 0]} />
            <Bar dataKey="E-mail" stackId="a" fill={COLORS["E-mail"]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Ligação" stackId="a" fill={COLORS.Ligação} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Tarefa" stackId="a" fill={COLORS.Tarefa} radius={[0, 0, 0, 0]} />
            <Bar dataKey="WhatsApp" stackId="a" fill={COLORS.WhatsApp} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
