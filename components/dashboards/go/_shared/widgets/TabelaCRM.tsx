import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

const crmData = [
  {
    id: 1,
    cliente: "Empresa ABC Ltda",
    responsavel: "João Silva",
    valor: "R$ 25.000",
    status: "Em negociação",
    dataContato: "28/10/2025",
  },
  {
    id: 2,
    cliente: "Tech Solutions Inc",
    responsavel: "Maria Santos",
    valor: "R$ 45.000",
    status: "Proposta enviada",
    dataContato: "27/10/2025",
  },
  {
    id: 3,
    cliente: "Comércio XYZ",
    responsavel: "Pedro Costa",
    valor: "R$ 18.500",
    status: "Fechado",
    dataContato: "26/10/2025",
  },
  {
    id: 4,
    cliente: "Indústria Beta",
    responsavel: "Ana Lima",
    valor: "R$ 62.000",
    status: "Em negociação",
    dataContato: "25/10/2025",
  },
  {
    id: 5,
    cliente: "Serviços Alfa",
    responsavel: "Carlos Souza",
    valor: "R$ 33.200",
    status: "Novo lead",
    dataContato: "24/10/2025",
  },
  {
    id: 6,
    cliente: "Digital Corp",
    responsavel: "João Silva",
    valor: "R$ 51.000",
    status: "Proposta enviada",
    dataContato: "23/10/2025",
  },
  {
    id: 7,
    cliente: "Consultoria Gama",
    responsavel: "Maria Santos",
    valor: "R$ 28.700",
    status: "Fechado",
    dataContato: "22/10/2025",
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Fechado":
      return "default";
    case "Proposta enviada":
      return "secondary";
    case "Em negociação":
      return "outline";
    case "Novo lead":
      return "outline";
    default:
      return "outline";
  }
};

type SortField = "cliente" | "responsavel" | "valor" | "status" | "dataContato";
type SortDirection = "asc" | "desc";

export function TabelaCRM() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = [...crmData].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    // Remove R$ e converte para número se for valor
    if (sortField === "valor") {
      aValue = parseFloat(aValue.replace("R$ ", "").replace(".", "").replace(",", "."));
      bValue = parseFloat(bValue.replace("R$ ", "").replace(".", "").replace(",", "."));
    }

    // Converte data para timestamp se for dataContato
    if (sortField === "dataContato") {
      const [diaA, mesA, anoA] = (aValue as string).split("/");
      const [diaB, mesB, anoB] = (bValue as string).split("/");
      aValue = new Date(`${anoA}-${mesA}-${diaA}`).getTime();
      bValue = new Date(`${anoB}-${mesB}-${diaB}`).getTime();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Card className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '0.9s' }}>
      <div className="p-5">
        <p className="text-xs font-normal text-muted-foreground uppercase tracking-wider mb-4">
          DADOS CRM
        </p>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort("cliente")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Cliente
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("responsavel")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Responsável
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("valor")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Valor
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("dataContato")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Data Contato
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.cliente}</TableCell>
                  <TableCell>{item.responsavel}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.dataContato}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
