import { useState } from "react";
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

const dataPorProduto = [
  { name: "Produto A", value: 85 },
  { name: "Produto B", value: 72 },
  { name: "Produto C", value: 58 },
  { name: "Produto D", value: 45 },
  { name: "Produto E", value: 32 },
];

const dataPorVendedor = [
  { name: "João Silva", value: 92 },
  { name: "Maria Santos", value: 78 },
  { name: "Pedro Costa", value: 65 },
  { name: "Ana Lima", value: 51 },
  { name: "Carlos Souza", value: 38 },
];

const dataPorFunil = [
  { name: "Novos negócios", value: 95 },
  { name: "Qualificação", value: 78 },
  { name: "Proposta", value: 62 },
  { name: "Negociação", value: 45 },
  { name: "Fechado", value: 28 },
];

const dataPorRegiao = [
  { name: "Sudeste", value: 88 },
  { name: "Sul", value: 71 },
  { name: "Nordeste", value: 54 },
  { name: "Centro-Oeste", value: 42 },
  { name: "Norte", value: 31 },
];

const dataPorEstado = [
  { name: "São Paulo", value: 90 },
  { name: "Rio de Janeiro", value: 76 },
  { name: "Minas Gerais", value: 63 },
  { name: "Paraná", value: 48 },
  { name: "Bahia", value: 35 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] text-white px-3 py-2 rounded-lg shadow-lg border border-border">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-sm">Valor: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function BarrasHorizontaisCard() {
  const [period, setPeriod] = useState("month");
  const [category, setCategory] = useState("produto");

  const getDataByCategory = () => {
    switch (category) {
      case "produto":
        return dataPorProduto;
      case "vendedor":
        return dataPorVendedor;
      case "funil":
        return dataPorFunil;
      case "regiao":
        return dataPorRegiao;
      case "estado":
        return dataPorEstado;
      default:
        return dataPorProduto;
    }
  };

  const data = getDataByCategory();

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-2">
              DESEMPENHO
            </p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px] h-9 text-sm border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="produto">Por produto</SelectItem>
                <SelectItem value="vendedor">Por vendedor</SelectItem>
                <SelectItem value="funil">Por funil de vendas</SelectItem>
                <SelectItem value="regiao">Por região</SelectItem>
                <SelectItem value="estado">Por estado</SelectItem>
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
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                animationDuration={1200}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
