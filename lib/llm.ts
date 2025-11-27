import { callMetaTool } from "./mcp";
import { AiIntegration, AiTool } from "./aiTools";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_ENDPOINT =
  process.env.OPENAI_BASE_URL?.replace(/\/$/, "") ||
  "https://api.openai.com/v1/chat/completions";

type OpenAIMessage = {
  role: string;
  content?: string;
  name?: string;
  function_call?: { name: string; arguments?: string };
};

export interface LLMContext {
  user: { id: number; name?: string; language?: string; timezone?: string };
  project: { id: number; name?: string; goals?: Record<string, unknown> };
  integrations: { name: AiIntegration; accounts?: any[]; pipelines?: any[]; customers?: any[]; status?: string }[];
  permissions: { mode: "read_only" };
  history?: { role: string; content: string }[];
}

export interface LLMSendMessageOptions {
  message: string;
  context: LLMContext;
  availableTools: AiTool[];
  toolAuth?: {
    meta?: { token: string; pageId?: string; wabaId?: string };
    kommo?: { token: string; baseUrl?: string };
    googleads?: { token: string; developerToken?: string; customerId?: string };
  };
}

export interface LLMResult {
  output: {
    type: "answer";
    mode: "read_only";
    chat_id?: string;
    text: string;
    data_blocks?: any[];
    tools_used?: string[];
    meta?: Record<string, unknown>;
  };
}

export class LLMClient {
  async sendMessage({ message, context, availableTools, toolAuth }: LLMSendMessageOptions): Promise<LLMResult> {
    const connectedNames = context.integrations.filter((i) => i.status === "connected").map((i) => i.name);

    // whitelist por integração para evitar ferramentas inexistentes
    const allowedByIntegration: Record<AiIntegration, string[]> = {
      meta: ["meta_getCampaigns", "meta_insights", "meta_getSpend", "meta_getCampaignSpend", "meta_getSpendPeriod", "meta_getSummary"],
    };

    const tools = availableTools.filter(
      (t) =>
        connectedNames.includes(t.integration) &&
        t.hasSideEffect === false &&
        allowedByIntegration[t.integration]?.includes(t.name)
    );

    const systemContext = [
      "Você é o Assistente Inteligente da K2ON, exclusivamente de leitura.",
      "Nunca proponha ou execute ações de escrita, alteração ou confirmação.",
      "Use apenas as ferramentas listadas como disponíveis; não invente novas ferramentas.",
      "Responda sempre em português.",
      `Contexto: ${JSON.stringify({
        user: context.user,
        project: context.project,
        integrations: context.integrations.map((i) => ({
          name: i.name,
          status: i.status,
          accounts: (i.accounts || []).map((a: any) => ({ id: a.id, label: a.label, page_id: a.page_id })),
        })),
        permissions: context.permissions,
      })}`,
      tools.length === 0
        ? "Não há integrações conectadas; informe isso ao usuário."
        : "Se houver múltiplas contas/pipelines, pergunte qual usar antes de consultar.",
    ].join(" \n");

    const openAiFunctions = tools.map((tool) => ({
      name: tool.name,
      description: `${tool.integration} read-only ${tool.name}`,
      parameters: tool.inputSchema,
    }));

    const messages: OpenAIMessage[] = [
      { role: "system", content: systemContext },
      ...(context.history || []).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    if (!OPENAI_API_KEY) {
      return this.simpleFallback({ message, context });
    }

    let loopCount = 0;
    const toolsUsed: string[] = [];
    try {
      while (loopCount < 4) {
        const response = await fetch(OPENAI_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages,
            functions: openAiFunctions,
            function_call: openAiFunctions.length ? "auto" : undefined,
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`OpenAI error ${response.status}: ${err}`);
        }

        const json = await response.json();
        const choice = json.choices?.[0];

        if (!choice?.message) {
          throw new Error("OpenAI não retornou mensagem válida");
        }

        if (choice.message.function_call) {
          const { name, arguments: args } = choice.message.function_call;
          toolsUsed.push(name);
          let parsed;
          try {
            parsed = args ? JSON.parse(args) : {};
          } catch {
            parsed = {};
          }

          let toolResult: any = { error: "tool não implementada" };
          if (name.startsWith("meta") && toolAuth?.meta?.token) {
            try {
              toolResult = await callMetaTool(name as any, parsed as Record<string, unknown>, toolAuth.meta.token, {
                pageId: toolAuth.meta.pageId,
                wabaId: toolAuth.meta.wabaId,
              });
            } catch (err) {
              toolResult = { error: "MCP Meta indisponível. Tente reconectar a conta e tente novamente." };
            }
          } else {
            toolResult = { error: "Ferramenta não suportada para este projeto." };
          }

          messages.push({ role: "assistant", function_call: { name, arguments: args } });
          messages.push({ role: "function", name, content: JSON.stringify(toolResult) });
          loopCount++;
          continue;
        }

        const text = choice.message.content?.trim() || "";
        return {
          output: {
            type: "answer",
            mode: "read_only",
            text,
            data_blocks: [],
            tools_used: toolsUsed,
            meta: { project_id: context.project.id, integrations: context.integrations.map((i) => i.name) },
          },
        };
      }
      throw new Error("Não foi possível obter resposta do LLM");
    } catch (err: any) {
      const friendly = err?.message?.includes("MCP") ? "MCP Meta indisponível. Tente reconectar a conta e tente novamente." : "Não foi possível responder agora. Tente novamente.";
      return {
        output: {
          type: "answer",
          mode: "read_only",
          text: friendly,
          data_blocks: [],
          tools_used: toolsUsed,
          meta: { project_id: context.project.id, integrations: context.integrations.map((i) => i.name) },
        },
      };
    }
  }

  private async simpleFallback({ message, context }: { message: string; context: LLMContext }): Promise<LLMResult> {
    const text = `Modo simplificado (sem LLM). Pergunta: ${message}`;
    return {
      output: {
        type: "answer",
        mode: "read_only",
        text,
        tools_used: [],
        data_blocks: [],
        meta: { project_id: context.project.id, integrations: context.integrations.map((i) => i.name) },
      },
    };
  }
}
