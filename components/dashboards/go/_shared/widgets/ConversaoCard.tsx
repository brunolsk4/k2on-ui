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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const generateData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baseRate = 72;
    const variation = Math.sin(i / 3) * 8 + Math.random() * 5;
    const rate = Math.max(60, Math.min(85, baseRate + variation));
    
    data.push({
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: Math.round(rate * 10) / 10,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.date}</p>
        <p className="text-sm font-semibold text-[#8b5cf6]">
          {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function ConversaoCard() {
  const [period, setPeriod] = useState("month");

  const { data, currentAvg, percentChange, isPositive } = useMemo(() => {
    const days = period === "7days" ? 7 : period === "30days" ? 30 : period === "90days" ? 90 : 30;
    const currentData = generateData(days);
    const previousData = generateData(days);
    
    const currentSum = currentData.reduce((sum, item) => sum + item.value, 0);
    const currentAverage = currentSum / currentData.length;
    
    const previousSum = previousData.reduce((sum, item) => sum + item.value, 0);
    const previousAverage = previousSum / previousData.length;
    
    const change = ((currentAverage - previousAverage) / previousAverage) * 100;
    
    return {
      data: currentData,
      currentAvg: Math.round(currentAverage),
      percentChange: Math.abs(Math.round(change)),
      isPositive: change > 0,
    };
  }, [period]);

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              TAXA DE CONVERSÃO
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-semibold text-foreground">
                {currentAvg}%
              </p>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                <span className="font-semibold">{percentChange}%</span>
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[60, 85]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
