import { Injectable, Inject, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { SessionService } from '../session/session.service';
import { OPENAI_CLIENT } from './openai.provider';

const CHUNK_REGEX = /[.!?\n。？！]/;
const SYSTEM_PROMPT =
  '너는 거칠고 재치있는 친구야. 반드시 2~3문장 이내로 짧게 대답해. 판단하거나 설교하지 마. 친구처럼 편하게 반말로 말해.';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly sessionService: SessionService,
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
  ) {}

  async streamChat(sessionId: string, message: string, res: Response): Promise<void> {
    // 1. Moderation
    const modResult = await this.openai.moderations.create({ input: message });
    if (modResult.results[0].flagged) {
      res.write(`data: ${JSON.stringify({ chunk: '헉..괜춘?' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // 2. Load history
    const session = await this.sessionService.getData(sessionId);
    const history = session?.messages ?? [];

    // 3. Stream from OpenAI
    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          { role: 'user', content: message },
        ],
      });

      // 4. Chunk and emit
      let buffer = '';
      let fullResponse = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        buffer += delta;
        fullResponse += delta;

        const match = CHUNK_REGEX.exec(buffer);
        if (match || buffer.length >= 50) {
          const cutIndex = match ? match.index + 1 : 50;
          const toSend = buffer.slice(0, cutIndex);
          buffer = buffer.slice(cutIndex);
          res.write(`data: ${JSON.stringify({ chunk: toSend })}\n\n`);
        }
      }

      if (buffer.trim()) {
        res.write(`data: ${JSON.stringify({ chunk: buffer })}\n\n`);
      }

      // 5. Save to Redis
      const now = Date.now();
      await this.sessionService.appendMessage(sessionId, {
        role: 'user',
        content: message,
        timestamp: now,
      });
      await this.sessionService.appendMessage(sessionId, {
        role: 'assistant',
        content: fullResponse,
        timestamp: now,
      });
    } catch (e) {
      this.logger.error('OpenAI stream error', e);
      res.write(`data: ${JSON.stringify({ chunk: '아 쏘리 나 잠깐 딴 생각함. 다시 말해줄래?' })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
