import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, Inject, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { SessionService } from '../session/session.service';
import { OPENAI_CLIENT } from './openai.provider';

const CHUNK_REGEX = /[.!?\n。？！]/;
const SYSTEM_PROMPT = readFileSync(join(__dirname, 'prompts/system.txt'), 'utf-8').trim();
// Chinese (U+4E00-U+9FFF, U+3400-U+4DBF) + Japanese (U+3040-U+30FF) — Korean Hangul excluded
const GARBLED_REGEX = /[\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly sessionService: SessionService,
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
  ) {}

  private isGarbled(text: string): boolean {
    // 중국어/일본어 2자 이상
    if ((text.match(GARBLED_REGEX)?.length ?? 0) >= 2) return true;
    // 한글 사이에 랜덤 영소문자 삽입 (예: "eoq어떻게")
    if (/[가-힣][a-z]{2,}[가-힣]/.test(text)) return true;
    return false;
  }

  async streamChat(sessionId: string, message: string, res: Response): Promise<void> {
    try {
      // 1. Load history
      const session = await this.sessionService.getData(sessionId);
      const history = session?.messages ?? [];

      // 3. Stream from OpenAI
      const stream = await this.openai.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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

      const textWithoutTag = fullResponse.replace(/^\s*\[[^\]]+\]\s*/, '').trim();
      if (!textWithoutTag || this.isGarbled(fullResponse)) {
        res.write(`data: ${JSON.stringify({ retry: true })}\n\n`);
      } else {
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
      }
    } catch (e) {
      this.logger.error('streamChat error', e);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ chunk: '아 쏘리 나 잠깐 딴 생각함. 다시 말해줄래?' })}\n\n`);
      }
    }

    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
