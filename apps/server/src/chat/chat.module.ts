import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SessionModule } from '../session/session.module';
import { openaiProvider } from './openai.provider';

@Module({
  imports: [SessionModule],
  controllers: [ChatController],
  providers: [ChatService, openaiProvider],
})
export class ChatModule {}
