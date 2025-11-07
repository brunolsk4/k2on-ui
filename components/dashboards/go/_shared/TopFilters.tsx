"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"

export function TopFilters(){
  const [ano, setAno] = React.useState("2025")
  const [mes, setMes] = React.useState("Outubro")
  const [funil, setFunil] = React.useState("Todos os funis")
  const [resp, setResp] = React.useState("Todos os responsáveis")
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Select value={ano} onValueChange={setAno}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
        </SelectContent>
      </Select>
      <Select value={mes} onValueChange={setMes}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m=> (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={funil} onValueChange={setFunil}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos os funis">Todos os funis</SelectItem>
          <SelectItem value="Atendimento">Atendimento</SelectItem>
          <SelectItem value="Clientes">Clientes</SelectItem>
        </SelectContent>
      </Select>
      <Select value={resp} onValueChange={setResp}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Todos os responsáveis">Todos os responsáveis</SelectItem>
          <SelectItem value="Equipe A">Equipe A</SelectItem>
          <SelectItem value="Equipe B">Equipe B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

