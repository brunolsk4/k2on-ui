import { NextRequest, NextResponse } from "next/server";
import { extractAuthPayload } from "@/lib/auth";
import { getLatestMetaToken } from "@/lib/userMeta";
import { getProjectsForUser, getIntegrationsForProject } from "@/lib/aiProjects";
import { aiToolsCatalog } from "@/lib/aiTools";
import { LLMClient } from "@/lib/llm";
import { ensureChat, saveMessage, loadRecentHistory } from "@/lib/aiPersistence";
import { v4 as uuidv4 } from "uuid";

const llmClient = new LLMClient();

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? undefined;
    const user = extractAuthPayload(auth);
    const payload = await req.json();

    const message = typeof payload?.message === "string" ? payload.message.trim() : "";
    const projectId = Number(payload?.project_id ?? payload?.projectId);
    const chatId = payload?.chat_id || payload?.chatId || uuidv4();
    const language = payload?.language || "pt-BR";
    const timezone = payload?.timezone || "America/Sao_Paulo";

    if (!message) return NextResponse.json({ error: "mensagem obrigatória" }, { status: 400 });
    if (!projectId || Number.isNaN(projectId)) return NextResponse.json({ error: "project_id obrigatório" }, { status: 400 });

    // valida projeto
    const projects = await getProjectsForUser(user.usuarioId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) return NextResponse.json({ error: "projeto não autorizado" }, { status: 403 });

    // integrações do projeto (usa todas para contexto)
    const integrations = await getIntegrationsForProject(projectId, user.usuarioId);
    const connected = integrations.filter((i) => i.status === "connected");
    // se nenhuma integração conectada, avisa
    if (!connected.length) {
      return NextResponse.json({ error: "projeto sem integrações conectadas" }, { status: 404 });
    }

    // contexto base
    const context = {
      user: { id: user.usuarioId, name: (user as any).nome ?? "", language, timezone },
      project: { id: projectId, name: project.name },
      integrations: integrations.map((i) => ({
        name: i.name as any,
        status: i.status,
        accounts: i.accounts,
        pipelines: i.pipelines,
        customers: i.customers,
        expires_at: i.expires_at,
      })),
      permissions: { mode: "read_only" as const },
      history: [] as { role: string; content: string }[],
    };

    // histórico curto
    const history = await loadRecentHistory(chatId);
    if (history?.length) {
      context.history = history.map((m: any) => ({ role: m.role, content: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }));
    }

    // preparar ferramentas e tokens (somente backend)
    const availableTools = aiToolsCatalog.filter((t) => connected.map((c) => c.name).includes(t.integration));
    const toolAuth: any = {};
    const metaIntegration = connected.find((c) => c.name === "meta");
    if (metaIntegration) {
      const tokenRecord = await getLatestMetaToken(user.usuarioId);
      if (tokenRecord?.token) {
        const firstAccount = metaIntegration.accounts?.[0] as any;
        const pageId = firstAccount?.page_id || firstAccount?.conta_id || firstAccount?.id;
        toolAuth.meta = { token: tokenRecord.token, pageId };
      }
    }

    // persiste chat + mensagem do usuário
    await ensureChat({ chat_id: chatId, user_id: user.usuarioId, project_id: projectId, integration: connected[0]?.name || "meta", account_id: null, status: connected[0]?.status });
    const userMessageId = uuidv4();
    await saveMessage({ id: userMessageId, chat_id: chatId, role: "user", content: message });

    // chama LLM
    const result = await llmClient.sendMessage({ message, context, availableTools, toolAuth });

    // salva resposta
    const assistantMessageId = uuidv4();
    await saveMessage({ id: assistantMessageId, chat_id: chatId, role: "assistant", content: result.output });

    return NextResponse.json(result.output);
  } catch (error: any) {
    if (error instanceof Error && error.message?.toLowerCase().includes("token")) {
      return NextResponse.json({ error: "token inválido ou ausente" }, { status: 401 });
    }
    console.error("Erro /api/ai/sendMessage:", error);
    const friendly =
      error instanceof Error && error.message?.toLowerCase().includes("mcp")
        ? "Meta indisponível no momento. Tente reconectar sua conta ou tentar novamente em instantes."
        : "erro interno";
    return NextResponse.json({ error: friendly }, { status: 503 });
  }
}
