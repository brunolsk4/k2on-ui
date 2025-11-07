import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const generateData = (days: number) => {
  const data = [];
  const today = new Date();
  for (let i = days * 2; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const baseValue = 3500 + Math.random() * 2000;
    const trend = (days * 2 - i) * 10;
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Math.round(baseValue + trend + (Math.random() - 0.5) * 1000),
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] text-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{payload[0].payload.date}</p>
        <p className="text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-[#f97316] mr-2"></span>
          Ganhos: R$ {payload[0].value.toLocaleString('pt-BR')}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueCard() {
  const [period, setPeriod] = useState("month");

  const periodDays: { [key: string]: number } = {
    "7days": 7,
    "30days": 30,
    "month": 30,
    "90days": 90,
  };

  const { data, currentTotal, percentChange, isPositive } = useMemo(() => {
    const days = periodDays[period];
    const fullData = generateData(days);
    
    const currentPeriodData = fullData.slice(days);
    const previousPeriodData = fullData.slice(0, days);
    
    const currentTotal = currentPeriodData.reduce((sum, item) => sum + item.value, 0);
    const previousTotal = previousPeriodData.reduce((sum, item) => sum + item.value, 0);
    
    const percentChange = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;
    
    return {
      data: currentPeriodData,
      currentTotal,
      percentChange: Math.abs(percentChange),
      isPositive: percentChange >= 0,
    };
  }, [period]);

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              GANHOS R$
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-foreground">
                R$ {Math.round(currentTotal).toLocaleString('pt-BR')}
              </p>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                <span className="text-xs font-semibold">
                  {percentChange.toFixed(1)}%
                </span>
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
              </div>
            </div>
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

        <div className="h-[90px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke="transparent" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
