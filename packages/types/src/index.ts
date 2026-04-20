export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface SessionData {
  createdAt: number;
  messages: ChatMessage[];
}
