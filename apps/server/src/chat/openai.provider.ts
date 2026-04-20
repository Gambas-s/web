import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

export const OPENAI_CLIENT = 'OPENAI_CLIENT';

export const openaiProvider = {
  provide: OPENAI_CLIENT,
  useFactory: (config: ConfigService) =>
    new OpenAI({
      apiKey: config.get<string>('OPENAI_API_KEY'),
      baseURL: config.get<string>('OPENAI_BASE_URL'),
    }),
  inject: [ConfigService],
};
