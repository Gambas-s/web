import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { ChatMessage, SessionData } from '@gambass/types';
import { REDIS_CLIENT } from './redis.provider';

export type DeleteSessionResult =
  | { status: 'deleted'; data: SessionData }
  | { status: 'already_deleted' }
  | { status: 'not_found' }
  | { status: 'attempt_conflict' };

const DELETE_SESSION_SCRIPT = `
local completedSessionId = redis.call('GET', KEYS[2])

if completedSessionId then
  if completedSessionId == ARGV[1] then
    return { 'already_deleted' }
  end
  return { 'attempt_conflict' }
end

local sessionData = redis.call('GET', KEYS[1])
if not sessionData then
  return { 'not_found' }
end

local deletedCount = redis.call('DEL', KEYS[1])
if deletedCount ~= 1 then
  return { 'not_found' }
end

redis.call('SET', KEYS[2], ARGV[1])
return { 'deleted', sessionData }
`;

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async create(): Promise<string> {
    const sessionId = uuidv4();
    const data: SessionData = { createdAt: Date.now(), messages: [] };
    await this.redis.set(`session:${sessionId}`, JSON.stringify(data), 'EX', 600);
    return sessionId;
  }

  async validate(sessionId: string): Promise<boolean> {
    return (await this.redis.exists(`session:${sessionId}`)) === 1;
  }

  async getData(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(`session:${sessionId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      this.logger.warn(`Failed to parse session data for ${sessionId}`);
      return null;
    }
  }

  async appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const data = await this.getData(sessionId);
    if (!data) {
      this.logger.warn(`appendMessage: session ${sessionId} not found or expired`);
      return;
    }
    data.messages.push(message);
    await this.redis.set(`session:${sessionId}`, JSON.stringify(data), 'EX', 600);
  }

  async delete(sessionId: string, burnAttemptId: string): Promise<DeleteSessionResult> {
    const result = (await this.redis.eval(
      DELETE_SESSION_SCRIPT,
      2,
      `session:${sessionId}`,
      `session-delete-attempt:${burnAttemptId}`,
      sessionId,
    )) as string[];
    const status = result[0];

    if (status === 'deleted') {
      return { status, data: JSON.parse(result[1]) as SessionData };
    }
    if (status === 'already_deleted' || status === 'not_found' || status === 'attempt_conflict') {
      return { status };
    }

    throw new Error(`Unexpected session deletion result: ${status}`);
  }
}
