import { db } from "./db";
import { getUserEmpresaIds } from "./userMeta";

export type IntegrationStatus = "connected" | "expiring" | "expired" | "never_connected";

export interface ProjectLite {
  id: number;
  name: string;
  empresa_id: number;
}

export interface IntegrationSummary {
  name: string;
  status: IntegrationStatus;
  expires_at: string | null;
  accounts?: { id: string; label: string; page_id?: string; ad_account_id?: string }[];
  pipelines?: { id: string; name: string }[];
  customers?: { id: string; descriptive_name: string }[];
}

export async function getProjectsForUser(usuarioId: number): Promise<ProjectLite[]> {
  const empresaIds = await getUserEmpresaIds(usuarioId);
  if (!empresaIds.length) return [];
  const placeholders = empresaIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT id, nome as name, empresa_id FROM projetos WHERE empresa_id IN (${placeholders}) ORDER BY nome ASC`,
    empresaIds
  );
  if (!Array.isArray(rows)) return [];
  return (rows as any[]).map((r) => ({ id: Number(r.id), name: r.name || String(r.nome || r.id), empresa_id: Number(r.empresa_id) }));
}

function computeStatus(expiresAt?: string | null): IntegrationStatus {
  if (!expiresAt) return "connected";
  const exp = new Date(expiresAt).getTime();
  const now = Date.now();
  if (Number.isNaN(exp)) return "connected";
  if (exp < now) return "expired";
  if (exp < now + 1000 * 60 * 60 * 24 * 2) return "expiring";
  return "connected";
}

export async function getIntegrationsForProject(projectId: number, usuarioId: number): Promise<IntegrationSummary[]> {
  const results: IntegrationSummary[] = [];

  // Meta Ads
  try {
    const [metaRows] = await db.query(
      `SELECT pm.id, pm.projeto_id, pm.conta_id, pm.nome_conta, p.empresa_id, m.expires_at
       FROM projetos_contas_meta pm
       JOIN projetos p ON p.id = pm.projeto_id
       JOIN usuarios_empresas ue ON ue.empresa_id = p.empresa_id
       LEFT JOIN meta m ON m.usuario_id = ue.usuario_id
       WHERE pm.projeto_id = ? AND ue.usuario_id = ?
       ORDER BY pm.id DESC`,
      [projectId, usuarioId]
    );

    if (Array.isArray(metaRows) && metaRows.length) {
      const metaList = metaRows as any[];
      const expiresAt = metaList[0]?.expires_at ? String(metaList[0].expires_at) : null;
      results.push({
        name: "meta",
        status: computeStatus(expiresAt),
        expires_at: expiresAt,
        accounts: metaList.map((row) => ({
          // use o ID real da conta (conta_id) para evitar passar o PK interno (ex.: 608)
          id: String(row.conta_id),
          label: row.nome_conta || String(row.conta_id),
          page_id: String(row.conta_id), // conta_id é a referência de conta/page no Meta conforme schema
        })),
      });
    } else {
      results.push({ name: "meta", status: "never_connected", expires_at: null, accounts: [] });
    }
  } catch (err) {
    console.warn("[aiProjects] meta query failed", err);
    results.push({ name: "meta", status: "never_connected", expires_at: null, accounts: [] });
  }

  return results;
}
