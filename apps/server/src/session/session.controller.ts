import { Controller, Post, Get, Delete, Query, Inject, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { SessionService } from './session.service';
import { OPENAI_CLIENT } from '../chat/openai.provider';

@Controller('session')
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(
    private readonly sessionService: SessionService,
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
  ) {}

  @Post()
  async create() {
    const sessionId = await this.sessionService.create();
    return { sessionId };
  }

  @Get()
  async get(@Query('sessionId') sessionId: string) {
    if (!sessionId) return null;
    return this.sessionService.getData(sessionId);
  }

  @Get('check')
  async check(@Query('sessionId') sessionId: string) {
    if (!sessionId) return { valid: false };
    const valid = await this.sessionService.validate(sessionId);
    return { valid };
  }

  @Delete()
  async remove(@Query('sessionId') sessionId: string) {
    if (!sessionId) return { success: false };
    const data = await this.sessionService.delete(sessionId);
    if (!data) return { success: false };

    if (data.messages.length > 0) {
      try {
        const history = data.messages
          .map((m) => `${m.role === 'user' ? '유저' : 'AI'}: ${m.content}`)
          .join('\n');
        const summary = await this.openai.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 60,
          messages: [
            { role: 'user', content: `다음 대화를 한 문장으로 요약해줘:\n${history}` },
          ],
        });
        this.logger.log(`[소각 요약] session:${sessionId} — ${summary.choices[0].message.content}`);
      } catch (e) {
        this.logger.error(`[소각 요약 실패] session:${sessionId}`, e);
      }
    }

    return { success: true };
  }
}
