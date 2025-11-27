import { NextRequest, NextResponse } from "next/server";
import { extractAuthPayload } from "@/lib/auth";
import { getIntegrationsForProject } from "@/lib/aiProjects";

export async function GET(req: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  try {
    const auth = req.headers.get("authorization") ?? undefined;
    const user = extractAuthPayload(auth);
    const { projectId: projectIdParam } = await context.params;
    const projectId = Number(projectIdParam);
    if (!projectId || Number.isNaN(projectId)) {
      return NextResponse.json({ error: "projectId inválido" }, { status: 400 });
    }

    const integrations = await getIntegrationsForProject(projectId, user.usuarioId);
    return NextResponse.json({ project_id: projectId, integrations });
  } catch (error: any) {
    if (error instanceof Error && error.message?.toLowerCase().includes("token")) {
      return NextResponse.json({ error: "token inválido ou ausente" }, { status: 401 });
    }
    console.error("/api/ai/projects/[projectId]/integrations error", error);
    return NextResponse.json({ error: "não foi possível listar integrações" }, { status: 500 });
  }
}
