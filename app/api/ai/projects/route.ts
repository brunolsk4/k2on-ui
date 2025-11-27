import { NextRequest, NextResponse } from "next/server";
import { extractAuthPayload } from "@/lib/auth";
import { getProjectsForUser } from "@/lib/aiProjects";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? undefined;
    const user = extractAuthPayload(auth);
    const projects = await getProjectsForUser(user.usuarioId);
    return NextResponse.json({ projects });
  } catch (error: any) {
    if (error instanceof Error && error.message?.toLowerCase().includes("token")) {
      return NextResponse.json({ error: "token inválido ou ausente" }, { status: 401 });
    }
    console.error("/api/ai/projects error", error);
    return NextResponse.json({ error: "não foi possível listar projetos" }, { status: 500 });
  }
}
