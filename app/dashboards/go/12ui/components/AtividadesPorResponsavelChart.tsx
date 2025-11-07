import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const mockData = [
  { nome: "David Vélez", atividades: 4521 },
  { nome: "Youssef Lahrech", atividades: 3189 },
  { nome: "Guilherme Lago", atividades: 1876 },
  { nome: "(Em branco)", atividades: 547 },
].sort((a, b) => b.atividades - a.atividades);

export function AtividadesPorResponsavelChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Por Responsável</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              dataKey="nome" 
              type="category" 
              width={150}
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
            <Bar dataKey="atividades" fill="hsl(var(--metric-pink))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
