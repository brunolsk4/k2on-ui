import { Pool } from "pg";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const pgPool = new Pool({
  connectionString: process.env.AI_ASSISTANT_PG_URI || process.env.PG_URL || process.env.DATABASE_URL,
  max: Number(process.env.PG_POOL_MAX || 5),
});

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379/0");

export type ChatRecord = {
  chat_id: string;
  user_id: number;
  project_id: number;
  integration: string;
  account_id?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string | null;
};

export type MessageRecord = {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: any;
  created_at?: string;
};

const REDIS_CHAT_PREFIX = "ai-assistant:chat:";
const REDIS_HISTORY_PREFIX = "ai-assistant:history:";
const HISTORY_LIMIT = Number(process.env.AI_ASSISTANT_HISTORY_LIMIT || 12);

export async function ensureChat(record: Omit<ChatRecord, "chat_id"> & { chat_id?: string }) {
  const chatId = record.chat_id || uuidv4();
  const now = new Date();
  await pgPool.query(
    `INSERT INTO ai_assistant.ai_chats (chat_id, user_id, project_id, integration, account_id, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (chat_id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       integration = EXCLUDED.integration,
       account_id = EXCLUDED.account_id,
       status = EXCLUDED.status,
       updated_at = EXCLUDED.updated_at`,
    [chatId, record.user_id, record.project_id, record.integration, record.account_id || null, record.status || null, now, now]
  );

  await redis.set(`${REDIS_CHAT_PREFIX}${chatId}`, JSON.stringify({
    chat_id: chatId,
    user_id: record.user_id,
    project_id: record.project_id,
    integration: record.integration,
    account_id: record.account_id || null,
    status: record.status || null,
    updated_at: now.toISOString(),
  }), "EX", 60 * 60 * 6);

  return chatId;
}

export async function saveMessage(msg: MessageRecord) {
  const contentJson = typeof msg.content === "string" ? JSON.stringify(msg.content) : JSON.stringify(msg.content ?? null);
  await pgPool.query(
    `INSERT INTO ai_assistant.ai_chat_messages (id, chat_id, role, content, created_at)
     VALUES ($1,$2,$3,$4,$5)`,
    [msg.id, msg.chat_id, msg.role, contentJson, msg.created_at || new Date()]
  );

  const key = `${REDIS_HISTORY_PREFIX}${msg.chat_id}`;
  await redis.rpush(key, JSON.stringify({ id: msg.id, role: msg.role, content: msg.content }));
  await redis.ltrim(key, -HISTORY_LIMIT, -1);
  await redis.expire(key, 60 * 60 * 12);
}

export async function loadRecentHistory(chatId: string) {
  const key = `${REDIS_HISTORY_PREFIX}${chatId}`;
  const items = await redis.lrange(key, -HISTORY_LIMIT, -1);
  if (items.length) {
    return items.map((i) => {
      try { return JSON.parse(i); } catch { return null; }
    }).filter(Boolean) as { id: string; role: string; content: any }[];
  }

  const res = await pgPool.query(
    `SELECT id, role, content FROM ai_assistant.ai_chat_messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [chatId, HISTORY_LIMIT]
  );
  return res.rows.reverse();
}

export async function getChatMeta(chatId: string) {
  const cached = await redis.get(`${REDIS_CHAT_PREFIX}${chatId}`);
  if (cached) {
    try { return JSON.parse(cached); } catch { /* ignore */ }
  }
  const res = await pgPool.query(
    `SELECT chat_id, user_id, project_id, integration, account_id, status, updated_at
     FROM ai_assistant.ai_chats WHERE chat_id = $1`,
    [chatId]
  );
  return res.rows?.[0] || null;
}

export async function listChatsForUser(userId: number, projectId?: number) {
  const params: any[] = [userId];
  let where = "user_id = $1";
  if (projectId) { where += " AND project_id = $2"; params.push(projectId); }
  const res = await pgPool.query(
    `SELECT chat_id, project_id, integration, account_id, status, created_at, updated_at
     FROM ai_assistant.ai_chats WHERE ${where} ORDER BY updated_at DESC LIMIT 50`,
    params
  );
  return res.rows;
}
