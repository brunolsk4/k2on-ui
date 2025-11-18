const MCP_URL = (process.env.MCP_URL || "http://localhost:4000/mcp").replace(/\/$/, "");
const CLIENT_INFO = { name: "k2on-ui-mcp", version: "0.1.0" } as const;
const TARGET_PROTOCOL_VERSION = "2025-06-18";

let sessionId: string | null = null;
let negotiatedProtocol: string | null = null;
let requestCounter = 0;
let connectPromise: Promise<void> | null = null;
let sseController: AbortController | null = null;
let sseReaderActive = false;
let lastKnownSessionId: string | null = null;

function resetSession() {
  if (sessionId) {
    console.warn(`[MCP CLIENT] Resetting session. Previous sessionId=${sessionId}`);
    lastKnownSessionId = sessionId;
  }
  sessionId = null;
  negotiatedProtocol = null;
  if (sseController) {
    sseController.abort();
    sseController = null;
  }
  sseReaderActive = false;
}

function buildRequestId(prefix: string) {
  requestCounter += 1;
  return `${prefix}-${Date.now()}-${requestCounter}`;
}

async function startSseStream() {
  if (!sessionId || sseReaderActive) return;
  const controller = new AbortController();
  sseController = controller;
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
    "mcp-session-id": sessionId
  };
  if (negotiatedProtocol) headers["mcp-protocol-version"] = negotiatedProtocol;

  const response = await fetch(MCP_URL, {
    method: "GET",
    headers,
    signal: controller.signal
  });
  if (!response.ok) {
    sseController = null;
    throw new Error(`Falha ao abrir SSE (HTTP ${response.status})`);
  }
  sseReaderActive = true;
  const reader = response.body?.getReader();
  (async () => {
    try {
      console.log("[MCP CLIENT] SSE stream aberto. Começando leitura…");
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch (error) {
      console.warn("SSE stream encerrado", error);
    } finally {
      sseReaderActive = false;
      if (sseController === controller) {
        sseController = null;
      }
      sessionId = null;
      negotiatedProtocol = null;
    }
  })().catch(() => {
    sseReaderActive = false;
    sessionId = null;
    negotiatedProtocol = null;
    if (sseController === controller) {
      sseController = null;
    }
  });
}

async function initializeSession() {
  const id = `init-${++requestCounter}`;
  const payload = {
    jsonrpc: "2.0",
    id,
    method: "initialize",
    params: {
      protocolVersion: TARGET_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      clientInfo: CLIENT_INFO
    }
  };
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream"
    },
    body: JSON.stringify(payload)
  });

  let data: any = null;
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    try {
      const parsed = JSON.parse(text);
      raiseMcpError(parsed?.error ?? { message: text, code: -32000 });
    } catch {
      throw new Error(`Falha ao inicializar MCP (${response.status}): ${text}`);
    }
  } else {
    data = await response.json();
    if (data?.error) {
      raiseMcpError(data.error);
    }
  }

  const sid = response.headers.get("mcp-session-id");
  if (!sid) {
    throw new Error("MCP não retornou mcp-session-id");
  }
  sessionId = sid;
  lastKnownSessionId = sid;
  negotiatedProtocol = data?.result?.protocolVersion ?? TARGET_PROTOCOL_VERSION;
  console.log(`[MCP CLIENT] Sessão inicializada: sessionId=${sessionId}, protocol=${negotiatedProtocol}`);
  await startSseStream().catch(() => {
    /* SSE é opcional para fluxo síncrono; continuamos mesmo se falhar */
  });
}

async function ensureSession() {
  if (sessionId && negotiatedProtocol) return;
  if (!connectPromise) {
    connectPromise = (async () => {
      console.log("[MCP CLIENT] ensureSession: iniciando fluxo de conexão");
      try {
        await initializeSession();
      } catch (error: any) {
        if (isSessionAlreadyInitializedError(error)) {
          console.warn("[MCP CLIENT] Servidor já inicializado. Tentando reiniciar sessão…");
          await deleteSession();
          await initializeSession();
        } else {
          throw error;
        }
      }
    })()
      .catch((error) => {
        resetSession();
        throw error;
      })
      .finally(() => {
        connectPromise = null;
      });
  }
  return connectPromise;
}

async function sendRpc(payload: Record<string, unknown>) {
  if (!sessionId) throw new Error("Sessão MCP indisponível");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "mcp-session-id": sessionId
  };
  if (negotiatedProtocol) headers["mcp-protocol-version"] = negotiatedProtocol;

  try {
    console.log(`[MCP CLIENT] sendRpc -> id=${String(payload.id)} usando sessionId=${sessionId}`);
    const response = await fetch(MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Erro HTTP MCP ${response.status}: ${text}`);
    }
    return response.json();
  } catch (error) {
    const err = error as any;
    if (isSessionError(err)) {
      console.warn(`[MCP CLIENT] sendRpc detectou erro de sessão: ${err?.message}`);
      await deleteSession();
    }
    throw error;
  }
}

function isSessionError(error: any) {
  if (!error) return false;
  const message = String(error.message || "").toLowerCase();
  if (message.includes("not initialized") || message.includes("session")) return true;
  return isSessionAlreadyInitializedError(error);
}

function isSessionAlreadyInitializedError(error: any) {
  if (!error) return false;
  const message = String(error.message || "").toLowerCase();
  return message.includes("already initialized") || error.code === -32600;
}

async function deleteSession() {
  const targetSession = sessionId ?? lastKnownSessionId;
  if (!targetSession) {
    console.warn("[MCP CLIENT] deleteSession chamado sem sessionId conhecido");
    resetSession();
    lastKnownSessionId = null;
    return;
  }
  try {
    console.log(`[MCP CLIENT] deleteSession -> enviando DELETE para sessão ${targetSession}`);
    const headers: Record<string, string> = {
      Accept: "application/json, text/event-stream",
      "mcp-session-id": targetSession
    };
    if (negotiatedProtocol) headers["mcp-protocol-version"] = negotiatedProtocol;
    await fetch(MCP_URL, { method: "DELETE", headers }).catch(() => {});
  } finally {
    resetSession();
    lastKnownSessionId = null;
  }
}

export const metaTools = [
  {
    name: "meta_getPages",
    description: "Lista as páginas Meta Ads associadas ao token fornecido.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "meta_getForms",
    description: "Retorna os lead forms pertencentes a uma página Meta Ads.",
    parameters: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "ID da página Meta Ads." }
      },
      required: ["pageId"],
      additionalProperties: false
    }
  },
  {
    name: "meta_getLeads",
    description: "Busca leads capturados por um formulário de lead do Meta Ads.",
    parameters: {
      type: "object",
      properties: {
        formId: { type: "string", description: "ID do lead form." },
        limit: { type: "number", description: "Quantidade máxima de leads." }
      },
      required: ["formId"],
      additionalProperties: false
    }
  },
  {
    name: "meta_sendWhatsApp",
    description: "Dispara mensagem via WhatsApp Business Cloud API.",
    parameters: {
      type: "object",
      properties: {
        wabaId: { type: "string", description: "ID do WhatsApp Business Account." },
        phone: { type: "string", description: "Telefone destino (E.164)." },
        message: { type: "string", description: "Mensagem." }
      },
      required: ["phone", "message"],
      additionalProperties: false
    }
  }
] as const;

export async function callMetaTool(
  name: (typeof metaTools)[number]["name"],
  args: Record<string, unknown>,
  token: string,
  overrides?: { pageId?: string; wabaId?: string }
) {
  await ensureSession();
  const payload = { ...args, token } as Record<string, unknown>;
  if (overrides?.pageId && payload.pageId === undefined) payload.pageId = overrides.pageId;
  if (overrides?.wabaId && payload.wabaId === undefined) payload.wabaId = overrides.wabaId;

  const rpcPayload = {
    jsonrpc: "2.0",
    id: buildRequestId(name),
    method: "tools/call",
    params: {
      name,
      arguments: payload
    }
  };

  console.log(`[MCP] Chamando ferramenta ${name}`);
  let response = await sendRpc(rpcPayload);
  if (response?.error && isSessionError(response.error)) {
    resetSession();
    await ensureSession();
    response = await sendRpc({ ...rpcPayload, id: buildRequestId(`${name}-retry`) });
  }

  if (response?.error) {
    const message = response.error.message ?? "Erro desconhecido";
    const code = response.error.code ?? "-";
    console.error(`[MCP] Erro ao chamar ${name}: ${message}`);
    throw new Error(`MCP error ${code}: ${message}`);
  }
  return response?.result;
}

function raiseMcpError(errorObj: { message?: string; code?: number }) {
  if (!errorObj) {
    throw new Error("MCP error");
  }
  const err = new Error(errorObj.message ?? "MCP error");
  (err as any).code = errorObj.code;
  (err as any).mcpError = errorObj;
  throw err;
}

export async function initialize() {
  await ensureSession();
}

export async function ensureConnected() {
  await ensureSession();
}
