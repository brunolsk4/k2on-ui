"use client";

import * as React from "react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Dialog removed: using lightweight inline modals to avoid missing dependency
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Settings, Trash2 } from "lucide-react";

type MemberStatus = "active" | "pending" | "inactive";
type PermissionLevel = "read" | "none";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: MemberStatus;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  template: string;
}

interface ProjectPermission {
  projectId: string;
  permission: PermissionLevel;
}

export default function TeamManagement() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invites, setInvites] = useState<Array<{id:number; email:string; role:string|null; status:string; created_at:string}>>([]);

  const [permissions, setPermissions] = useState<Record<string, ProjectPermission[]>>({
    "1": [
      { projectId: "1", permission: "read" },
      { projectId: "2", permission: "read" },
      { projectId: "3", permission: "read" },
    ],
    "2": [
      { projectId: "1", permission: "read" },
      { projectId: "2", permission: "none" },
      { projectId: "3", permission: "read" },
    ],
  });

  function notify(msg: string, kind: 'success'|'error'|'info' = 'info') {
    setNotice(msg); setTimeout(()=> setNotice(null), 2000);
    if (kind==='success') toast.success(msg); else if (kind==='error') toast.error(msg); else toast(msg);
  }

  // Carrega membros e projetos no mount
  React.useEffect(()=>{ (async ()=>{
    try{
      const r = await fetch('/api/team/members', { credentials:'include' });
      const j = await r.json().catch(()=>null);
      if (j && j.ok && Array.isArray(j.members)) setMembers(j.members);
    } catch{}
    try{
      const r = await fetch('/api/projects', { credentials:'include' });
      const j = await r.json().catch(()=>null);
      if (j && Array.isArray(j)) setProjects(j.map((p:any)=> ({ id:String(p.id), name:p.nome, template: p.templateNome || '-' })));
    } catch{}
    try{
      const r = await fetch('/api/team/invites', { credentials:'include' });
      const j = await r.json().catch(()=>null);
      if (j && j.ok && Array.isArray(j.invites)) setInvites(j.invites);
    } catch{}
  })() }, [])

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      role: String(formData.get("role") || "member"),
      status: "pending",
    };
    try{
      // lookup antes de enviar
      const lk = await fetch(`/api/team/users/lookup?email=${encodeURIComponent(newMember.email)}`, { credentials:'include' });
      const jl = await lk.json().catch(()=>null);
      if (!lk.ok || !jl || jl.exists !== true) { notify('Usuário não encontrado. Peça para criar a conta primeiro.', 'error'); return }
      const r = await fetch('/api/team/invite', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ email: newMember.email, role: newMember.role }) });
      if (!r.ok) { notify('Não foi possível enviar o convite.', 'error'); return }
      setMembers((m) => [...m, newMember]);
      setInviteDialogOpen(false);
      notify(`Convite enviado para ${newMember.email}`, 'success');
    } catch { notify('Falha ao enviar convite', 'error') }
  }

  function handleRemoveMember(memberId: string) {
    setMembers((m) => m.filter((x) => x.id !== memberId));
    notify("Membro removido da equipe");
  }

  function handlePermissionChange(memberId: string, projectId: string, permission: PermissionLevel) {
    setPermissions((prev) => {
      const userPerms = prev[memberId] || projects.map((p) => ({ projectId: p.id, permission: "none" as PermissionLevel }));
      const next = userPerms.map((p) => (p.projectId === projectId ? { ...p, permission } : p));
      return { ...prev, [memberId]: next };
    });
  }

  function getPermissionForProject(memberId: string, projectId: string): PermissionLevel {
    const userPerms = permissions[memberId] || [];
    const found = userPerms.find((p) => p.projectId === projectId);
    return found ? found.permission : "none";
  }

  // Ao abrir o modal de permissões, carrega permissões reais do usuário
  React.useEffect(()=>{ (async ()=>{
    if (!permissionsDialogOpen || !selectedMember) return;
    try{
      const r = await fetch(`/api/team/permissions?usuarioId=${encodeURIComponent(selectedMember.id)}`, { credentials:'include' });
      const j = await r.json().catch(()=>null);
      if (j && j.ok && Array.isArray(j.permissions)) {
        setPermissions(prev => ({ ...prev, [selectedMember.id]: j.permissions }));
      }
    } catch{}
  })() }, [permissionsDialogOpen, selectedMember])

  async function savePermissions() {
    if (!selectedMember) return;
    const list = permissions[selectedMember.id] || projects.map(p=> ({ projectId:p.id, permission:'none' as PermissionLevel }));
    for (const perm of list) {
      try{ await fetch('/api/team/permissions', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ usuarioId: Number(selectedMember.id), projetoId: Number(perm.projectId), permission: perm.permission }) }); }catch{}
    }
    notify('Permissões salvas');
  }

  function getStatusBadge(status: MemberStatus) {
    const variants: Record<MemberStatus, { label: string; className: string }> = {
      active: { label: "Ativo", className: "bg-success/10 text-success" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
    };
    const v = variants[status];
    return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {notice ? (
        <div className="rounded-md border border-emerald-300/50 bg-emerald-100 text-emerald-900 px-3 py-2 text-sm">{notice}</div>
      ) : null}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Equipe</h2>
          <p className="text-sm text-muted-foreground">Gerencie membros e permissões por projeto</p>
        </div>
        <Button className="gap-2" onClick={()=> setInviteDialogOpen(true)}><UserPlus className="h-4 w-4"/>Convidar membro</Button>
      </div>

      {/* Convites pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Convites</CardTitle>
          <CardDescription>Gerencie convites pendentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convite pendente.</p>
          ) : invites.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{inv.email}</div>
                <div className="text-xs text-muted-foreground">{inv.role || 'Membro'} • {new Date(inv.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={async()=>{ try{ await fetch(`/api/team/invites/${inv.id}/resend`, { method:'POST', credentials:'include' }); notify('Convite reenviado', 'success'); }catch{ notify('Falha ao reenviar', 'error') } }}>Reenviar</Button>
                <Button size="sm" variant="ghost" onClick={async()=>{ if(!confirm('Cancelar convite?')) return; try{ await fetch(`/api/team/invites/${inv.id}`, { method:'DELETE', credentials:'include' }); setInvites(v=> v.filter(x=> x.id!==inv.id)); notify('Convite cancelado', 'success'); }catch{ notify('Falha ao cancelar', 'error') } }}>Cancelar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {members.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum membro</CardTitle>
            <CardDescription>Convide pessoas para colaborar em seus projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={()=> setInviteDialogOpen(true)} className="gap-2"><UserPlus className="h-4 w-4"/>Convidar</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Membros da equipe</CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "membro" : "membros"} na equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedMember(member); setPermissionsDialogOpen(true); }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {permissionsDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50">
          <div className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">Editar permissões</h3>
              <p className="text-sm text-muted-foreground">Gerencie as permissões de acesso de {selectedMember?.name} aos projetos</p>
            </div>
            <div className="space-y-4 py-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.template}</p>
                  </div>
                  <Select
                    value={selectedMember ? getPermissionForProject(selectedMember.id, project.id) : "none"}
                    onValueChange={(value) => { if (selectedMember) handlePermissionChange(selectedMember.id, project.id, value as PermissionLevel) }}
                  >
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Somente leitura</SelectItem>
                      <SelectItem value="none">Nenhum acesso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={()=> setPermissionsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={async () => { await savePermissions(); setPermissionsDialogOpen(false); }}>Salvar alterações</Button>
            </div>
          </div>
        </div>
      )}

      {inviteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">Convidar novo membro</h3>
              <p className="text-sm text-muted-foreground">Preencha os dados para enviar o convite</p>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required placeholder="Nome completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" required type="email" placeholder="usuario@empresa.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Papel</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={()=> setInviteDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Enviar convite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
