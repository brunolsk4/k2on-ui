import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export function SettingsDialog() {
  const [visibleColumns, setVisibleColumns] = useState({
    // Dashboard Executivo
    oportunidades: true,
    ganhos: true,
    conversao: true,
    cicloVendas: true,
    ganhosRS: true,
    ticketMedio: true,
    
    // Leads Ativos
    nomeEmpresa: true,
    valorNegocio: true,
    estagio: true,
    responsavel: true,
    dataAbertura: true,
    ultimaInteracao: true,
    
    // Leads Perdidos
    motivoPerda: true,
    dataPerda: true,
    tempoFunil: true,
    
    // Atividades
    tipoAtividade: true,
    dataAtividade: true,
    duracao: true,
    status: true,
  });

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Dashboard</DialogTitle>
          <DialogDescription>
            Configure as opções de visualização e análise dos seus dados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Dashboard Executivo */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Dashboard Executivo - Cards</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oportunidades"
                    checked={visibleColumns.oportunidades}
                    onCheckedChange={() => toggleColumn('oportunidades')}
                  />
                  <Label htmlFor="oportunidades" className="text-sm font-normal cursor-pointer">
                    Novas Oportunidades
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ganhos"
                    checked={visibleColumns.ganhos}
                    onCheckedChange={() => toggleColumn('ganhos')}
                  />
                  <Label htmlFor="ganhos" className="text-sm font-normal cursor-pointer">
                    Ganhos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conversao"
                    checked={visibleColumns.conversao}
                    onCheckedChange={() => toggleColumn('conversao')}
                  />
                  <Label htmlFor="conversao" className="text-sm font-normal cursor-pointer">
                    Taxa de Conversão
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cicloVendas"
                    checked={visibleColumns.cicloVendas}
                    onCheckedChange={() => toggleColumn('cicloVendas')}
                  />
                  <Label htmlFor="cicloVendas" className="text-sm font-normal cursor-pointer">
                    Ciclo de Vendas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ganhosRS"
                    checked={visibleColumns.ganhosRS}
                    onCheckedChange={() => toggleColumn('ganhosRS')}
                  />
                  <Label htmlFor="ganhosRS" className="text-sm font-normal cursor-pointer">
                    Ganhos R$
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ticketMedio"
                    checked={visibleColumns.ticketMedio}
                    onCheckedChange={() => toggleColumn('ticketMedio')}
                  />
                  <Label htmlFor="ticketMedio" className="text-sm font-normal cursor-pointer">
                    Ticket Médio
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Leads Ativos */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Leads Ativos - Colunas da Tabela</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nomeEmpresa"
                    checked={visibleColumns.nomeEmpresa}
                    onCheckedChange={() => toggleColumn('nomeEmpresa')}
                  />
                  <Label htmlFor="nomeEmpresa" className="text-sm font-normal cursor-pointer">
                    Nome da Empresa
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="valorNegocio"
                    checked={visibleColumns.valorNegocio}
                    onCheckedChange={() => toggleColumn('valorNegocio')}
                  />
                  <Label htmlFor="valorNegocio" className="text-sm font-normal cursor-pointer">
                    Valor do Negócio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estagio"
                    checked={visibleColumns.estagio}
                    onCheckedChange={() => toggleColumn('estagio')}
                  />
                  <Label htmlFor="estagio" className="text-sm font-normal cursor-pointer">
                    Estágio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="responsavel"
                    checked={visibleColumns.responsavel}
                    onCheckedChange={() => toggleColumn('responsavel')}
                  />
                  <Label htmlFor="responsavel" className="text-sm font-normal cursor-pointer">
                    Responsável
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dataAbertura"
                    checked={visibleColumns.dataAbertura}
                    onCheckedChange={() => toggleColumn('dataAbertura')}
                  />
                  <Label htmlFor="dataAbertura" className="text-sm font-normal cursor-pointer">
                    Data de Abertura
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ultimaInteracao"
                    checked={visibleColumns.ultimaInteracao}
                    onCheckedChange={() => toggleColumn('ultimaInteracao')}
                  />
                  <Label htmlFor="ultimaInteracao" className="text-sm font-normal cursor-pointer">
                    Última Interação
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Leads Perdidos */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Leads Perdidos - Campos Adicionais</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="motivoPerda"
                    checked={visibleColumns.motivoPerda}
                    onCheckedChange={() => toggleColumn('motivoPerda')}
                  />
                  <Label htmlFor="motivoPerda" className="text-sm font-normal cursor-pointer">
                    Motivo da Perda
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dataPerda"
                    checked={visibleColumns.dataPerda}
                    onCheckedChange={() => toggleColumn('dataPerda')}
                  />
                  <Label htmlFor="dataPerda" className="text-sm font-normal cursor-pointer">
                    Data da Perda
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tempoFunil"
                    checked={visibleColumns.tempoFunil}
                    onCheckedChange={() => toggleColumn('tempoFunil')}
                  />
                  <Label htmlFor="tempoFunil" className="text-sm font-normal cursor-pointer">
                    Tempo no Funil
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Atividades */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Atividades - Campos da Tabela</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tipoAtividade"
                    checked={visibleColumns.tipoAtividade}
                    onCheckedChange={() => toggleColumn('tipoAtividade')}
                  />
                  <Label htmlFor="tipoAtividade" className="text-sm font-normal cursor-pointer">
                    Tipo de Atividade
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dataAtividade"
                    checked={visibleColumns.dataAtividade}
                    onCheckedChange={() => toggleColumn('dataAtividade')}
                  />
                  <Label htmlFor="dataAtividade" className="text-sm font-normal cursor-pointer">
                    Data da Atividade
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="duracao"
                    checked={visibleColumns.duracao}
                    onCheckedChange={() => toggleColumn('duracao')}
                  />
                  <Label htmlFor="duracao" className="text-sm font-normal cursor-pointer">
                    Duração
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status"
                    checked={visibleColumns.status}
                    onCheckedChange={() => toggleColumn('status')}
                  />
                  <Label htmlFor="status" className="text-sm font-normal cursor-pointer">
                    Status
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            // Reset to defaults
            setVisibleColumns({
              oportunidades: true,
              ganhos: true,
              conversao: true,
              cicloVendas: true,
              ganhosRS: true,
              ticketMedio: true,
              nomeEmpresa: true,
              valorNegocio: true,
              estagio: true,
              responsavel: true,
              dataAbertura: true,
              ultimaInteracao: true,
              motivoPerda: true,
              dataPerda: true,
              tempoFunil: true,
              tipoAtividade: true,
              dataAtividade: true,
              duracao: true,
              status: true,
            });
          }}>
            Restaurar Padrões
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
