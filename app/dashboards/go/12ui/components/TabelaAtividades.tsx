import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

// Mock data
const mockAtividades = [
  {
    id: "12345",
    tipo: "Reunião",
    link: "https://meet.google.com/abc-defg-hij",
    tarefa: "Apresentação do produto para cliente X",
    criado: "15/10/2024",
    prazo: "20/10/2024",
    conclusao: "19/10/2024",
    status: "Concluído",
  },
  {
    id: "12346",
    tipo: "E-mail",
    link: "",
    tarefa: "Enviar proposta comercial",
    criado: "16/10/2024",
    prazo: "18/10/2024",
    conclusao: "",
    status: "Em aberto",
  },
  {
    id: "12347",
    tipo: "Ligação",
    link: "",
    tarefa: "Follow-up com lead qualificado",
    criado: "17/10/2024",
    prazo: "19/10/2024",
    conclusao: "18/10/2024",
    status: "Concluído",
  },
  {
    id: "12348",
    tipo: "Tarefa",
    link: "",
    tarefa: "Atualizar informações no CRM",
    criado: "18/10/2024",
    prazo: "22/10/2024",
    conclusao: "",
    status: "Em aberto",
  },
  {
    id: "12349",
    tipo: "Reunião",
    link: "https://meet.google.com/xyz-abcd-efg",
    tarefa: "Alinhamento interno do time comercial",
    criado: "19/10/2024",
    prazo: "21/10/2024",
    conclusao: "20/10/2024",
    status: "Concluído",
  },
];

export function TabelaAtividades() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Conclusão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAtividades.map((atividade) => (
              <TableRow key={atividade.id}>
                <TableCell className="font-medium">{atividade.id}</TableCell>
                <TableCell>{atividade.tipo}</TableCell>
                <TableCell>
                  {atividade.link ? (
                    <a
                      href={atividade.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Link
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">{atividade.tarefa}</TableCell>
                <TableCell>{atividade.criado}</TableCell>
                <TableCell>{atividade.prazo}</TableCell>
                <TableCell>{atividade.conclusao || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={atividade.status === "Concluído" ? "default" : "secondary"}
                    className={
                      atividade.status === "Concluído"
                        ? "bg-[hsl(var(--metric-pink))] hover:bg-[hsl(var(--metric-pink))]"
                        : ""
                    }
                  >
                    {atividade.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
