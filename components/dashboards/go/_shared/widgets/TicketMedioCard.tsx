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

export function TicketMedioCard() {
  const [period, setPeriod] = useState("month");

  const { ticketValue, change, progressValue, isPositive } = useMemo(() => {
    const tickets: { [key: string]: { value: number; change: number } } = {
      "7days": { value: 18500, change: -8 },
      "30days": { value: 21000, change: 12 },
      "month": { value: 20179, change: 7 },
      "90days": { value: 19800, change: 5 },
    };
    
    const data = tickets[period] || tickets["month"];
    
    const maxValue = 25000;
    const minValue = 10000;
    const normalizedProgress = ((data.value - minValue) / (maxValue - minValue)) * 100;
    
    return {
      ticketValue: data.value,
      change: Math.abs(data.change),
      progressValue: Math.max(0, Math.min(100, normalizedProgress)),
      isPositive: data.change > 0,
    };
  }, [period]);

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.5s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              TICKET-MÉDIO
            </p>
            <p className="text-3xl font-semibold text-foreground">
              R$ {ticketValue.toLocaleString('pt-BR')}
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
          <p className="text-sm text-muted-foreground">Valor médio por venda</p>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            <span className="text-sm font-semibold">{change}%</span>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        </div>

        <Progress value={progressValue} className="h-2" />
      </div>
    </Card>
  );
}
