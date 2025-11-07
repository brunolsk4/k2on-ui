import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
// Removido toggle de tema e configurações no contexto do dashboard
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Dados mockados - valores para os gráficos
const responsaveisValorData = [{
  name: "David Vélez",
  value: 8500000
}, {
  name: "Youssef Lahrech",
  value: 3200000
}, {
  name: "Guilherme Lago",
  value: 950000
}, {
  name: "(Em branco)",
  value: 680000
}, {
  name: "Jagpreet Duggal",
  value: 720000
}, {
  name: "Cristina Junqueira",
  value: 180000
}, {
  name: "Henrique Fragelli",
  value: 65000
}];

const funilValorData = [{
  name: "Atendimento",
  value: 5800000
}, {
  name: "Clientes",
  value: 3200000
}, {
  name: "Instagram",
  value: 980000
}, {
  name: "Inativos",
  value: 1500000
}, {
  name: "Comunicação",
  value: 4100000
}, {
  name: "Marketing",
  value: 7500000
}];

const etapaValorData = [{
  name: "Interação",
  value: 3800000
}, {
  name: "Novos Clientes",
  value: 2100000
}, {
  name: "Etapa Inicial",
  value: 1900000
}, {
  name: "Atenta lá",
  value: 980000
}, {
  name: "Qualificação",
  value: 650000
}];

// Dados mockados
const leadsData = [{
  id: "71312335",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 7.500",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312389",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312445",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312539",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Atenta lá",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312601",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312603",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312611",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 6.995",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312651",
  nomeLead: "Informação sensível",
  funil: "Clientes",
  etapa: "Novos Clientes",
  valor: "R$ 997",
  responsavel: "Guilherme Lago",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312745",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Etapa Inicial",
  valor: "R$ 1.997",
  responsavel: "Jagpreet Duggal",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71312879",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Interação",
  valor: "R$ 0",
  responsavel: "Youssef Lahrech",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}, {
  id: "71313007",
  nomeLead: "Informação sensível",
  funil: "Atendimento",
  etapa: "Etapa Inicial",
  valor: "R$ 1.297",
  responsavel: "",
  dataCriacao: "14/03/2025",
  diasAberto: 56,
  lead: "56"
}];
const responsaveisData = [{
  name: "David Vélez",
  value: 18614
}, {
  name: "Youssef Lahrech",
  value: 5332
}, {
  name: "Guilherme Lago",
  value: 1325
}, {
  name: "(Em branco)",
  value: 1013
}, {
  name: "Jagpreet Duggal",
  value: 1002
}, {
  name: "Cristina Junqueira",
  value: 212
}, {
  name: "Henrique Fragelli",
  value: 98
}];
const funilData = [{
  name: "Atendimento",
  value: 8420
}, {
  name: "Clientes",
  value: 4418
}, {
  name: "Instagram",
  value: 1544
}, {
  name: "Inativos",
  value: 2042
}, {
  name: "Comunicação",
  value: 6130
}, {
  name: "Marketing",
  value: 10600
}];

const etapaData = [{
  name: "Interação",
  value: 5234
}, {
  name: "Novos Clientes",
  value: 3187
}, {
  name: "Etapa Inicial",
  value: 2899
}, {
  name: "Atenta lá",
  value: 1432
}, {
  name: "Qualificação",
  value: 987
}];
type SortField = "id" | "nomeLead" | "funil" | "etapa" | "valor" | "responsavel" | "dataCriacao" | "diasAberto" | "lead";
type SortDirection = "asc" | "desc" | null;

export default function LeadsAtivos() {
  const [pesquisaIdLead, setPesquisaIdLead] = useState("");
  const [idsSelecionados, setIdsSelecionados] = useState<string[]>([]);
  const [funisSelecionados, setFunisSelecionados] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showValorResponsavel, setShowValorResponsavel] = useState(false);
  const [showValorFunil, setShowValorFunil] = useState(false);
  const [showValorEtapa, setShowValorEtapa] = useState(false);
  
  const idLeadsUnicos = Array.from(new Set(leadsData.map(l => l.id)));
  const funisUnicos = Array.from(new Set(leadsData.map(l => l.funil)));

  const idsFiltradosPesquisa = pesquisaIdLead 
    ? idLeadsUnicos.filter(id => id.toLowerCase().includes(pesquisaIdLead.toLowerCase()))
    : idLeadsUnicos;

  const todosSelecionadosId = idsFiltradosPesquisa.length > 0 && idsFiltradosPesquisa.every(id => idsSelecionados.includes(id));
  const todosSelecionadosFunil = funisUnicos.length > 0 && funisUnicos.every(funil => funisSelecionados.includes(funil));

  const toggleTodosIds = () => {
    if (todosSelecionadosId) {
      setIdsSelecionados(idsSelecionados.filter(id => !idsFiltradosPesquisa.includes(id)));
    } else {
      setIdsSelecionados([...new Set([...idsSelecionados, ...idsFiltradosPesquisa])]);
    }
  };

  const toggleId = (id: string) => {
    setIdsSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTodosFunis = () => {
    if (todosSelecionadosFunil) {
      setFunisSelecionados([]);
    } else {
      setFunisSelecionados([...funisUnicos]);
    }
  };

  const toggleFunil = (funil: string) => {
    setFunisSelecionados(prev =>
      prev.includes(funil) ? prev.filter(f => f !== funil) : [...prev, funil]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  let dadosFiltrados = leadsData.filter(lead => {
    const matchId = idsSelecionados.length === 0 || idsSelecionados.includes(lead.id);
    const matchFunil = funisSelecionados.length === 0 || funisSelecionados.includes(lead.funil);
    return matchId && matchFunil;
  });

  if (sortField && sortDirection) {
    dadosFiltrados = [...dadosFiltrados].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "valor") {
        aVal = parseFloat(aVal.replace(/[R$\s.]/g, "").replace(",", "."));
        bVal = parseFloat(bVal.replace(/[R$\s.]/g, "").replace(",", "."));
      } else if (sortField === "diasAberto") {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }
  return <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Gestão de Leads Ativos</h1>
        
        <div className="flex gap-2" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        
        <div className="flex gap-4">
          {/* Filtro ID Lead */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">ID Lead</label>
            <Select>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={idsSelecionados.length > 0 ? `${idsSelecionados.length} selecionado(s)` : "Selecione IDs"} />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Input 
                      placeholder="Pesquisar ID..." 
                      value={pesquisaIdLead}
                      onChange={(e) => setPesquisaIdLead(e.target.value)}
                      className="h-8"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id="select-all-ids"
                      checked={todosSelecionadosId}
                      onCheckedChange={toggleTodosIds}
                    />
                    <label htmlFor="select-all-ids" className="text-sm font-medium cursor-pointer">
                      Selecionar tudo
                    </label>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-1">
                    {idsFiltradosPesquisa.map(id => (
                      <div key={id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`id-${id}`}
                          checked={idsSelecionados.includes(id)}
                          onCheckedChange={() => toggleId(id)}
                        />
                        <label htmlFor={`id-${id}`} className="text-sm cursor-pointer flex-1">
                          {id}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Funil de Vendas */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Funil vendas</label>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={funisSelecionados.length > 0 ? `${funisSelecionados.length} selecionado(s)` : "Selecione funis"} />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 space-y-2">
                  <div className="flex items-center space-x-2 py-1 border-b pb-2">
                    <Checkbox
                      id="select-all-funis"
                      checked={todosSelecionadosFunil}
                      onCheckedChange={toggleTodosFunis}
                    />
                    <label htmlFor="select-all-funis" className="text-sm font-medium cursor-pointer">
                      Selecionar tudo
                    </label>
                  </div>
                  <div className="space-y-1">
                    {funisUnicos.map(funil => (
                      <div key={funil} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`funil-${funil}`}
                          checked={funisSelecionados.includes(funil)}
                          onCheckedChange={() => toggleFunil(funil)}
                        />
                        <label htmlFor={`funil-${funil}`} className="text-sm cursor-pointer flex-1">
                          {funil}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-blue-500 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">27.596</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor R$
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 19.126.452</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">119,5 dias</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {/* Leads por Responsável */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Responsável</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="switch-responsavel" className="text-sm text-muted-foreground">
                  {showValorResponsavel ? "Valor" : "Quantidade"}
                </Label>
                <Switch
                  id="switch-responsavel"
                  checked={showValorResponsavel}
                  onCheckedChange={setShowValorResponsavel}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden p-4">
            <ChartContainer config={{
              value: {
                label: showValorResponsavel ? "Valor" : "Leads",
                color: "#3b82f6"
              }
            }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={showValorResponsavel ? responsaveisValorData : responsaveisData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Leads por Funil */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Funil de vendas</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="switch-funil" className="text-sm text-muted-foreground">
                  {showValorFunil ? "Valor" : "Quantidade"}
                </Label>
                <Switch
                  id="switch-funil"
                  checked={showValorFunil}
                  onCheckedChange={setShowValorFunil}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden p-4">
            <ChartContainer config={{
              value: {
                label: showValorFunil ? "Valor" : "Leads",
                color: "#3b82f6"
              }
            }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={showValorFunil ? funilValorData : funilData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Leads por Etapa de Vendas */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Etapa de vendas</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="switch-etapa" className="text-sm text-muted-foreground">
                  {showValorEtapa ? "Valor" : "Quantidade"}
                </Label>
                <Switch
                  id="switch-etapa"
                  checked={showValorEtapa}
                  onCheckedChange={setShowValorEtapa}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-hidden p-4">
            <ChartContainer config={{
              value: {
                label: showValorEtapa ? "Valor" : "Leads",
                color: "#3b82f6"
              }
            }} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={showValorEtapa ? etapaValorData : etapaData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de dados */}
      <Card className="animate-fade-in hover:shadow-lg transition-all duration-300" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle>Leads Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("id")} className="h-8 font-medium">
                      id
                      {getSortIcon("id")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("nomeLead")} className="h-8 font-medium">
                      Nome lead
                      {getSortIcon("nomeLead")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("funil")} className="h-8 font-medium">
                      Funil de vendas
                      {getSortIcon("funil")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("etapa")} className="h-8 font-medium">
                      Etapa
                      {getSortIcon("etapa")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("valor")} className="h-8 font-medium">
                      Valor
                      {getSortIcon("valor")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("responsavel")} className="h-8 font-medium">
                      Responsável
                      {getSortIcon("responsavel")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("dataCriacao")} className="h-8 font-medium">
                      Data criação
                      {getSortIcon("dataCriacao")}
                    </Button>
                  </TableHead>
                  <TableHead className="border-r">
                    <Button variant="ghost" onClick={() => handleSort("diasAberto")} className="h-8 font-medium">
                      Dias aberto
                      {getSortIcon("diasAberto")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("lead")} className="h-8 font-medium">
                      Lead
                      {getSortIcon("lead")}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.map(lead => <TableRow key={lead.id} className="border-b">
                    <TableCell className="font-medium border-r">{lead.id}</TableCell>
                    <TableCell className="border-r">{lead.nomeLead}</TableCell>
                    <TableCell className="border-r">{lead.funil}</TableCell>
                    <TableCell className="border-r">{lead.etapa}</TableCell>
                    <TableCell className="border-r">{lead.valor}</TableCell>
                    <TableCell className="border-r">{lead.responsavel}</TableCell>
                    <TableCell className="border-r">{lead.dataCriacao}</TableCell>
                    <TableCell className="border-r">{lead.diasAberto}</TableCell>
                    <TableCell>{lead.lead}</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>;
}
