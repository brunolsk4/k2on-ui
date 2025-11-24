import { NextRequest, NextResponse } from "next/server";
import { extractAuthPayload } from "@/lib/auth";
import { getLatestMetaToken, getMetaConnectionForProject } from "@/lib/userMeta";
import { LLMClient } from "@/lib/llm";

const llmClient = new LLMClient();

export async function POST(req: NextRequest) {
  try {
    console.log("[/api/ai/sendMessage] Iniciando requisição");
    const auth = req.headers.get("authorization") ?? undefined;
    const user = extractAuthPayload(auth);
    console.log("[/api/ai/sendMessage] Usuário autenticado", user.usuarioId);
    const payload = await req.json();
    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const projectId = Number(payload?.projeto_id ?? payload?.projectId);
    if (!message) {
      return NextResponse.json({ error: "mensagem obrigatória" }, { status: 400 });
    }
    if (!projectId || Number.isNaN(projectId)) {
      return NextResponse.json({ error: "projeto_id obrigatório" }, { status: 400 });
    }
    console.log("[/api/ai/sendMessage] Projeto informado", projectId);

    const connection = await getMetaConnectionForProject(projectId, user.usuarioId);
    if (!connection) {
      return NextResponse.json({ error: "projeto sem conta Meta Ads conectada" }, { status: 404 });
    }

    const tokenRecord = await getLatestMetaToken(user.usuarioId);
    if (!tokenRecord) {
      return NextResponse.json(
        { error: "token Meta Ads não encontrado; reconecte a conta." },
        { status: 404 }
      );
    }
    const metaToken = typeof tokenRecord.token === "string" ? tokenRecord.token.trim() : "";
    if (!metaToken) {
      return NextResponse.json({ error: "token Meta Ads inválido" }, { status: 400 });
    }
    console.log("[/api/ai/sendMessage] Token sufixo", metaToken.slice(-6));

    const connectionWithToken = {
      ...connection,
      token: metaToken,
    };
    const result = await llmClient.sendMessage({ message, connection: connectionWithToken });
    console.log("[/api/ai/sendMessage] Resposta final", result.output);
    return NextResponse.json({ output: result.output });
  } catch (error) {
    console.error("Erro /api/ai/sendMessage:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro interno" },
      { status: 500 }
    );
  }
}
