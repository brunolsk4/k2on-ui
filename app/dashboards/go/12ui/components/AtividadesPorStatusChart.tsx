import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Mock data
const mockData = [
  { name: "Concluído", value: 87.47, count: 9029 },
  { name: "Em aberto", value: 12.53, count: 1104 },
];

const COLORS = ["hsl(var(--metric-pink))", "hsl(var(--metric-pink) / 0.3)"];

export function AtividadesPorStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
              labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${props.payload.count} atividades)`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
