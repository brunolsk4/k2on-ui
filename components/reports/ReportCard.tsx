"use client";

import * as React from "react";
import { Edit, Trash2, Clock, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type Report = {
  id: string;
  name: string;
  status: "active" | "paused" | "error";
  lastSent: string;
  project: string;
};

export function ReportCard({ report, style }: { report: Report; style?: React.CSSProperties }) {
  const statusConfig: Record<Report["status"], { label: string; className: string }> = {
    active: { label: "Ativo", className: "bg-success text-success-foreground" },
    paused: { label: "Pausado", className: "bg-warning text-warning-foreground" },
    error: { label: "Erro", className: "bg-destructive text-destructive-foreground" },
  };

  return (
    <div className="bg-card rounded-xl border p-6 hover:border-primary/50 transition-all duration-200" style={style}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-card-foreground">{report.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Folder className="h-4 w-4" />
            <span>{report.project}</span>
          </div>
        </div>
        <Badge className={statusConfig[report.status].className}>{statusConfig[report.status].label}</Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Clock className="h-4 w-4" />
        <span>Último envio: {report.lastSent}</span>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" className="flex-1 gap-2" disabled title="Em breve">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" className="gap-2" disabled title="Em breve">
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

