import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const generateData = (days: number) => {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseValue = 5 + Math.random() * 10;
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Math.round(baseValue),
    });
  }
  return data;
};

const metricColors: { [key: string]: string } = {
  oportunidades: "#3b82f6",
  ganhos: "#10b981",
  conversao: "#8b5cf6",
  ciclo: "#06b6d4",
  receita: "#f97316",
  ticket: "#ec4899",
};

const CustomTooltip = ({ active, payload, metric }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] text-white px-3 py-2 rounded-lg shadow-lg border border-border">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-sm">
          <span 
            className="inline-block w-2 h-2 rounded-full mr-2" 
            style={{ backgroundColor: metricColors[metric] }}
          ></span>
          Valor: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function ZoomChartCard() {
  const [period, setPeriod] = useState("month");
  const [metric, setMetric] = useState("oportunidades");

  const periodDays: { [key: string]: number } = {
    "7days": 7,
    "30days": 30,
    "month": 30,
    "90days": 90,
  };

  const data = useMemo(() => {
    const days = periodDays[period];
    return generateData(days);
  }, [period]);

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              ANÁLISE DETALHADA
            </p>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[180px] h-9 text-sm border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oportunidades">Novas Oportunidades</SelectItem>
                <SelectItem value="ganhos">Ganhos</SelectItem>
                <SelectItem value="conversao">Taxa Conversão</SelectItem>
                <SelectItem value="ciclo">Ciclo de Vendas</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="ticket">Ticket Médio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] h-8 text-xs border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês atual</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[280px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar
                dataKey="value"
                fill={metricColors[metric]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}