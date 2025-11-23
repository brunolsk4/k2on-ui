import { callMetaTool, getMetaTools } from "./mcp";
import { MetaConnection } from "./userMeta";

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

export interface LLMSendMessageOptions {
  message: string;
  connection: MetaConnection & { token: string; wabaId?: string };
}

export interface LLMResult {
  output: string;
}

// tipagem simples para tools
type MetaTool = {
  name: string;
  description: string;
  parameters: any;
};

export class LLMClient {
  private async buildFunctionDescriptions() {
    const tools = await getMetaTools();

    return tools.map((tool: MetaTool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }

  async sendMessage({
    message,
    connection,
  }: LLMSendMessageOptions): Promise<LLMResult> {
    console.log("[LLM] Iniciando processamento", {
      projectId: connection.projectId,
      connection: connection.label,
    });

    // contexto fixo
    const context = [
      "Você é o Assistente Inteligente da K2ON, especialista em Meta Ads.",
      "O usuário está conectado ao Meta Ads pelo projeto informado. Utilize meta_getPages, meta_getForms, meta_getLeads, meta_sendWhatsApp quando necessário.",
      `Projeto selecionado: ${connection.projectId}. Conta/AdAccount: ${connection.label} (${connection.pageId}).`,
      "Responda sempre em português e não exponha tokens ou segredos. Explique claramente como obteve os dados.",
    ].join(" ");

    // fallback: sem API key
    if (!OPENAI_API_KEY) {
      return this.simpleFallback({ message, context, connection });
    }

    const functions = await this.buildFunctionDescriptions();

    const systemMessage: OpenAIMessage = { role: "system", content: context };
    const userMessage: OpenAIMessage = { role: "user", content: message };
    const messages: OpenAIMessage[] = [systemMessage, userMessage];

    let loopCount = 0;

    while (loopCount < 6) {
      const response = await fetch(OPENAI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages,
          functions,
          function_call: "auto",
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

      // === chamada de ferramenta ===
      if (choice.message.function_call) {
        const { name, arguments: args } = choice.message.function_call;

        let parsed;
        try {
          parsed = args ? JSON.parse(args) : {};
        } catch {
          parsed = {};
        }

        const toolResult = await callMetaTool(
          name as any,
          parsed as Record<string, unknown>,
          connection.token,
          {
            pageId: connection.pageId,
            wabaId: connection.wabaId,
          }
        );

        const functionContent = JSON.stringify(toolResult);

        messages.push({
          role: "assistant",
          function_call: { name, arguments: args },
        });

        messages.push({
          role: "function",
          name,
          content: functionContent,
        });

        loopCount++;
        continue;
      }

      // === resposta final ===
      const output = choice.message.content?.trim() ?? "";
      console.log("[LLM] Resposta final gerada:", output);
      return { output };
    }

    throw new Error("Não foi possível obter resposta do LLM");
  }

  private async simpleFallback({
    message,
    context,
    connection,
  }: {
    message: string;
    context: string;
    connection: MetaConnection & { token: string; wabaId?: string };
  }): Promise<LLMResult> {
    const lower = message.toLowerCase();

    // fallback para páginas
    if (lower.includes("página")) {
      const result = await callMetaTool(
        "meta_getPages",
        {},
        connection.token,
        { pageId: connection.pageId }
      );

      const pages = (result as any)?.data?.data || [];
      const summary =
        pages.length > 0
          ? pages.map((p: any) => `• ${p.name} (${p.id})`).join("\n")
          : "Nenhuma página encontrada.";

      return { output: `Páginas disponíveis:\n${summary}` };
    }

    // fallback para lead forms
    if (lower.includes("form") || lower.includes("lead form")) {
      const result = await callMetaTool(
        "meta_getForms",
        { pageId: connection.pageId },
        connection.token,
        { pageId: connection.pageId }
      );

      const forms = (result as any)?.data?.data || [];
      const summary =
        forms.length > 0
          ? forms.map((f: any) => `• ${f.name} (${f.id})`).join("\n")
          : "Nenhum lead form encontrado.";

      return { output: `Lead forms disponíveis:\n${summary}` };
    }

    return {
      output:
        "Desculpe, não consegui entender. Tente algo como “Liste minhas páginas do Meta Ads”.",
    };
  }
}