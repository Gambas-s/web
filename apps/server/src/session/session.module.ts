import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { redisProvider } from './redis.provider';
import { openaiProvider } from '../chat/openai.provider';

@Module({
  controllers: [SessionController],
  providers: [SessionService, redisProvider, openaiProvider],
  exports: [SessionService],
})
export class SessionModule {}
