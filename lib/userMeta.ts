import { db } from "./db";

export interface MetaConnection {
  id: number;
  pageId: string;
  label: string;
  projectId: number;
  empresaId: number;
}

export async function getUserEmpresaIds(usuarioId: number): Promise<number[]> {
  const [rows] = await db.query("SELECT empresa_id FROM usuarios_empresas WHERE usuario_id = ?", [usuarioId]);
  return Array.isArray(rows) ? (rows as any[]).map((row) => row.empresa_id).filter(Boolean) : [];
}

export async function getProjectIdsForEmpresas(empresaIds: number[]): Promise<number[]> {
  if (empresaIds.length === 0) return [];
  const placeholders = empresaIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT id FROM projetos WHERE empresa_id IN (${placeholders})`,
    empresaIds
  );
  return Array.isArray(rows) ? (rows as any[]).map((row) => row.id) : [];
}

export async function getMetaConnectionsByEmpresas(empresaIds: number[]): Promise<MetaConnection[]> {
  if (empresaIds.length === 0) {
    return [];
  }
  const placeholders = empresaIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT
       pm.id,
       pm.projeto_id,
       pm.conta_id,
       pm.nome_conta,
       p.empresa_id
     FROM projetos_contas_meta pm
     JOIN projetos p ON p.id = pm.projeto_id
     WHERE p.empresa_id IN (${placeholders})
     ORDER BY pm.id DESC`,
    empresaIds
  );
  return Array.isArray(rows)
    ? (rows as any[]).map((row) => ({
        id: Number(row.id),
        pageId: String(row.conta_id),
        label: row.nome_conta || String(row.conta_id),
        projectId: Number(row.projeto_id),
        empresaId: Number(row.empresa_id),
      }))
    : [];
}

export async function getLatestMetaToken(usuarioId: number): Promise<{ token: string; expiresAt: string | null } | null> {
  const [rows] = await db.execute(
    "SELECT access_token, expires_at FROM meta WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 1",
    [usuarioId]
  );
  const record = Array.isArray(rows) && rows.length ? (rows[0] as any) : null;
  if (!record || !record.access_token) {
    return null;
  }
  return {
    token: String(record.access_token),
    expiresAt: record.expires_at ? String(record.expires_at) : null,
  };
}

export async function getMetaConnectionForProject(projectId: number, usuarioId: number): Promise<MetaConnection | null> {
  const [rows] = await db.query(
    `SELECT
       pm.id,
       pm.projeto_id,
       pm.conta_id,
       pm.nome_conta,
       p.empresa_id
     FROM projetos_contas_meta pm
     JOIN projetos p ON p.id = pm.projeto_id
     JOIN usuarios_empresas ue ON ue.empresa_id = p.empresa_id
     WHERE pm.projeto_id = ? AND ue.usuario_id = ?
     ORDER BY pm.id DESC
     LIMIT 1`,
    [projectId, usuarioId]
  );
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  const row = rows[0] as any;
  return {
    id: Number(row.id),
    pageId: String(row.conta_id),
    label: row.nome_conta || String(row.conta_id),
    projectId: Number(row.projeto_id),
    empresaId: Number(row.empresa_id),
  };
}
