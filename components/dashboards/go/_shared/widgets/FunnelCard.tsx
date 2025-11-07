import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function FunnelCard() {
  const [period, setPeriod] = useState("month");

  const funnelData = [
    { label: "Novos negócios", value: 1250, percentage: 100 },
    { label: "Leads ativos", value: 875, percentage: 70 },
    { label: "Negócios fechados", value: 312, percentage: 25 },
  ];

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.7s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-6">
          <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
            FUNIL DE VENDAS
          </p>
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

        <div className="space-y-4">
          {funnelData.map((stage, index) => (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">{stage.label}</span>
                <span className="text-muted-foreground">{stage.value}</span>
              </div>
              <div className="relative h-12 bg-muted/30 rounded overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                  style={{
                    width: `${stage.percentage}%`,
                    background: `hsl(var(--primary) / ${1 - index * 0.25})`,
                  }}
                >
                  <div className="flex items-center justify-center h-full text-sm font-medium text-primary-foreground">
                    {stage.percentage}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
