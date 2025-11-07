import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CicloVendasCard() {
  const [period, setPeriod] = useState("month");

  const { cycleDays, change, progressValue, isPositive } = useMemo(() => {
    const cycles: { [key: string]: { days: number; change: number } } = {
      "7days": { days: 15, change: -12 },
      "30days": { days: 19, change: 8 },
      "month": { days: 18, change: 5 },
      "90days": { days: 17, change: 3 },
    };
    
    const data = cycles[period] || cycles["month"];
    
    const maxDays = 30;
    const minDays = 5;
    const normalizedProgress = ((maxDays - data.days) / (maxDays - minDays)) * 100;
    
    return {
      cycleDays: data.days,
      change: Math.abs(data.change),
      progressValue: Math.max(0, Math.min(100, normalizedProgress)),
      isPositive: data.change < 0,
    };
  }, [period]);

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              CICLO DE VENDAS
            </p>
            <p className="text-3xl font-semibold text-foreground">
              {cycleDays} dias
            </p>
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

        <div className="flex items-center justify-between mb-2 mt-3">
          <p className="text-sm text-muted-foreground">Tempo médio de fechamento</p>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            <span className="text-sm font-semibold">{change}%</span>
            {isPositive ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
        </div>

        <Progress value={progressValue} className="h-2" />
      </div>
    </Card>
  );
}
