// @ts-nocheck
import fs from "node:fs";
import path from "node:path";

const BASE_URL = (process.env.MCP_META_URL || "http://127.0.0.1:4001/mcp").replace(/\/$/, "");
const ENDPOINTS = {
  initialize: `${BASE_URL}/initialize`,
  stream: `${BASE_URL}/stream`,
  toolCall: `${BASE_URL}/tool-call`,
  session: `${BASE_URL}/session`
};

const CLIENT_INFO = { name: "k2on-ui", version: "1.0.0" };
const TARGET_PROTOCOL_VERSION = "2025-06-18";

let sessionId = null;
let negotiatedProtocol = null;
let requestCounter = 0;
let connectPromise = null;
let sseController = null;
let sseReaderActive = false;
let lastKnownSessionId = null;

/* ============================
   SESSION HELPERS
============================ */

function resetSession() {
  if (sessionId) {
    console.warn(`[MCP CLIENT] Resetando sessão ${sessionId}`);
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

function buildRequestId(prefix) {
  requestCounter += 1;
  return `${prefix}-${Date.now()}-${requestCounter}`;
}

/* ============================
   SSE STREAM
============================ */

async function startSseStream() {
  if (!sessionId || sseReaderActive) return;

  const controller = new AbortController();
  sseController = controller;

  const headers = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
    "mcp-session-id": sessionId
  };

  if (negotiatedProtocol) {
    headers["mcp-protocol-version"] = negotiatedProtocol;
  }

  const response = await fetch(ENDPOINTS.stream, {
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
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
    } catch (err) {
      console.warn("[MCP CLIENT] SSE encerrado", err);
    } finally {
      sseReaderActive = false;
      if (sseController === controller) {
        sseController = null;
      }
    }
  })();
}

/* ============================
   INITIALIZE SESSION
============================ */

async function initializeSession() {
  const payload = {
    jsonrpc: "2.0",
    id: buildRequestId("init"),
    method: "initialize",
    params: {
      protocolVersion: TARGET_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      clientInfo: CLIENT_INFO
    }
  };

  const response = await fetch(ENDPOINTS.initialize, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream"
    },
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let data = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Resposta inválida do MCP: ${raw}`);
  }

  if (!response.ok || data?.error) {
    const err = data?.error || { message: raw, code: response.status };
    const msg = (err.message || "").toLowerCase();

    if (err.code === -32600 || msg.includes("already initialized")) {
      console.warn("[MCP CLIENT] MCP já inicializado — reaproveitando sessão");
      if (!sessionId && lastKnownSessionId) sessionId = lastKnownSessionId;
      if (!negotiatedProtocol) negotiatedProtocol = TARGET_PROTOCOL_VERSION;
      if (sessionId && !sseReaderActive) startSseStream().catch(() => {});
      return;
    }

    throw new Error(err.message || "Erro ao inicializar MCP");
  }

  const sid = response.headers.get("mcp-session-id");
  if (!sid) {
    throw new Error("MCP não retornou mcp-session-id");
  }

  sessionId = sid;
  lastKnownSessionId = sid;
  negotiatedProtocol = data?.result?.protocolVersion || TARGET_PROTOCOL_VERSION;

  await startSseStream();
}

async function ensureSession() {
  if (sessionId && negotiatedProtocol) return;

  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        await initializeSession();
      } catch (err) {
        resetSession();
        throw err;
      }
    })().finally(() => {
      connectPromise = null;
    });
  }

  return connectPromise;
}

/* ============================
   TOOL CALL RPC
============================ */

async function sendRpc(payload) {
  if (!sessionId) throw new Error("Sessão MCP indisponível");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "mcp-session-id": sessionId
  };

  if (negotiatedProtocol) {
    headers["mcp-protocol-version"] = negotiatedProtocol;
  }

  const response = await fetch(ENDPOINTS.toolCall, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const raw = await response.text();
  let json = {};

  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Resposta inválida do MCP: ${raw}`);
  }

  if (!response.ok || json?.error) {
    const err = json?.error || { message: raw, code: response.status };
    const e = new Error(err.message || "Erro desconhecido");
    e.code = err.code;
    throw e;
  }

  return json;
}

/* ============================
   PUBLIC API — GET TOOLS
============================ */

let metaToolsCache = null;

export async function getMetaTools() {
  await ensureSession();

  const payload = {
    jsonrpc: "2.0",
    id: buildRequestId("tools-list"),
    method: "tools/list",
    params: {}
  };

  const response = await sendRpc(payload);

  const list = response?.result?.tools || [];

  const tools = list.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.inputSchema || { type: "object" }
  }));

  metaToolsCache = tools;
  return tools;
}

/* ============================
   PUBLIC API — CALL TOOL
============================ */

export async function callMetaTool(name, args, token, overrides) {
  await ensureSession();

  // nunca deixe a IA sobrescrever o token real: remove token vindo nos args e injeta o válido
  const cleanArgs = { ...(args || {}) };
  if ("token" in cleanArgs) delete (cleanArgs as any).token;
  const payload = { ...cleanArgs, token };
  try {
    const snippet = typeof token === "string" ? token.slice(-6) : String(token);
    // log local para depuração de token usado por tool
    console.log("[MCP client] calling tool", name, "token", snippet);
  } catch {}

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

  const response = await sendRpc(rpcPayload);

  return response?.result;
}

/* ============================
   PUBLIC HELPERS
============================ */

export async function initialize() {
  await ensureSession();
}

export async function ensureConnected() {
  await ensureSession();
}
