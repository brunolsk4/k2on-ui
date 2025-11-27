export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: any;
}

export interface ChatItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}
