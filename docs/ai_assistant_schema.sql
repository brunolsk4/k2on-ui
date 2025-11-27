-- Schema para o Assistente Inteligente (modo read-only)
CREATE SCHEMA IF NOT EXISTS ai_assistant;

CREATE TABLE IF NOT EXISTS ai_assistant.ai_chats (
  chat_id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  integration TEXT NOT NULL,
  account_id TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_assistant.ai_chat_messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES ai_assistant.ai_chats(chat_id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_chat_created ON ai_assistant.ai_chat_messages(chat_id, created_at);
