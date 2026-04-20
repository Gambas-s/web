import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { ChatMessage, SessionData } from '@gambass/types';
import { REDIS_CLIENT } from './redis.provider';

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

  async delete(sessionId: string): Promise<SessionData | null> {
    const data = await this.getData(sessionId);
    if (!data) return null;
    await this.redis.del(`session:${sessionId}`);
    return data;
  }
}
