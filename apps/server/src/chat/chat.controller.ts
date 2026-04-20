import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { SessionService } from '../session/session.service';
import { ChatRequestDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sessionService: SessionService,
  ) {}

  @Post()
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response): Promise<void> {
    const valid = await this.sessionService.validate(dto.sessionId);
    if (!valid) {
      res.status(401).json({ message: 'Invalid or expired session' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    await this.chatService.streamChat(dto.sessionId, dto.message, res);
  }
}
