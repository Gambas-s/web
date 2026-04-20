# Server Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NestJS 서버에 SessionModule + ChatModule을 추가해 서버 발급 세션 기반의 GPT-4o-mini SSE 스트리밍 채팅 API를 구현한다.

**Architecture:** SessionModule이 Redis CRUD + 세션 발급/검증을 담당하고, ChatModule이 SessionModule을 import해 OpenAI Moderation → GPT 스트리밍 → SSE 청킹 → Redis 저장 흐름을 처리한다. Redis provider와 OpenAI provider는 각 모듈 내에서 DI 토큰으로 주입해 테스트 시 mock으로 교체 가능하게 한다.

**Tech Stack:** NestJS 10, ioredis 5, openai 4, uuid 9, jest 29, ts-jest, @nestjs/testing

---

## 파일 맵

| 파일 | 역할 |
|---|---|
| `packages/types/src/index.ts` | 공유 타입 (MessageRole, ChatMessage, SessionData) |
| `apps/server/jest.config.js` | Jest 설정 |
| `apps/server/src/session/redis.provider.ts` | REDIS_CLIENT DI 토큰 + provider |
| `apps/server/src/session/session.service.ts` | Redis CRUD: 세션 생성/검증/조회/메시지 추가/삭제 |
| `apps/server/src/session/session.service.spec.ts` | SessionService 유닛 테스트 |
| `apps/server/src/session/session.controller.ts` | POST /session, GET /session/check, DELETE /session |
| `apps/server/src/session/session.controller.spec.ts` | SessionController 유닛 테스트 |
| `apps/server/src/session/session.module.ts` | SessionModule (exports SessionService) |
| `apps/server/src/chat/openai.provider.ts` | OPENAI_CLIENT DI 토큰 + provider |
| `apps/server/src/chat/chat.dto.ts` | ChatRequestDto |
| `apps/server/src/chat/chat.service.ts` | Moderation + OpenAI 스트리밍 + SSE 청킹 |
| `apps/server/src/chat/chat.service.spec.ts` | ChatService 유닛 테스트 |
| `apps/server/src/chat/chat.controller.ts` | POST /chat (SSE) |
| `apps/server/src/chat/chat.controller.spec.ts` | ChatController e2e 테스트 |
| `apps/server/src/chat/chat.module.ts` | ChatModule |
| `apps/server/src/app.module.ts` | SessionModule + ChatModule 등록 |

---

## Task 1: 테스트 인프라 세팅

**Files:**
- Modify: `apps/server/package.json`
- Create: `apps/server/jest.config.js`

- [ ] **Step 1: 테스트 devDependencies 추가**

`apps/server/package.json` 의 `"devDependencies"` 에 아래를 추가한다:

```json
"@nestjs/testing": "^10.0.0",
"@types/jest": "^29.0.0",
"@types/supertest": "^2.0.0",
"jest": "^29.0.0",
"supertest": "^6.0.0",
"ts-jest": "^29.0.0"
```

`"scripts"` 에 추가:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:cov": "jest --coverage"
```

- [ ] **Step 2: jest.config.js 생성**

```js
// apps/server/jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@gambass/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
};
```

- [ ] **Step 3: 의존성 설치 및 확인**

```bash
pnpm install
```

Expected: 에러 없이 완료.

- [ ] **Step 4: 커밋**

```bash
git add apps/server/package.json apps/server/jest.config.js
git commit -m "chore(server): jest 테스트 인프라 세팅"
```

---

## Task 2: 공유 타입 정의

**Files:**
- Modify: `packages/types/src/index.ts`

- [ ] **Step 1: 타입 작성**

```ts
// packages/types/src/index.ts
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
```

- [ ] **Step 2: 타입 컴파일 확인**

```bash
pnpm --filter @gambass/types tsc --noEmit 2>/dev/null || cd packages/types && npx tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add packages/types/src/index.ts
git commit -m "feat(types): ChatMessage, SessionData 공유 타입 추가"
```

---

## Task 3: Redis Provider + SessionService

**Files:**
- Create: `apps/server/src/session/redis.provider.ts`
- Create: `apps/server/src/session/session.service.ts`
- Create: `apps/server/src/session/session.service.spec.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// apps/server/src/session/session.service.spec.ts
import { Test } from '@nestjs/testing';
import { SessionService } from './session.service';
import { REDIS_CLIENT } from './redis.provider';

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  exists: jest.fn(),
  del: jest.fn(),
};

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: REDIS_CLIENT, useValue: mockRedis },
      ],
    }).compile();
    service = module.get(SessionService);
  });

  describe('create', () => {
    it('UUID를 생성하고 Redis에 세션을 저장한 뒤 sessionId를 반환한다', async () => {
      mockRedis.set.mockResolvedValue('OK');
      const sessionId = await service.create();
      expect(sessionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(mockRedis.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.stringContaining('"messages":[]'),
        'EX',
        600,
      );
    });
  });

  describe('validate', () => {
    it('세션이 존재하면 true를 반환한다', async () => {
      mockRedis.exists.mockResolvedValue(1);
      expect(await service.validate('test-id')).toBe(true);
    });

    it('세션이 없으면 false를 반환한다', async () => {
      mockRedis.exists.mockResolvedValue(0);
      expect(await service.validate('missing-id')).toBe(false);
    });
  });

  describe('getData', () => {
    it('Redis에서 SessionData를 파싱해 반환한다', async () => {
      const data = { createdAt: 1000, messages: [] };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));
      expect(await service.getData('test-id')).toEqual(data);
    });

    it('세션이 없으면 null을 반환한다', async () => {
      mockRedis.get.mockResolvedValue(null);
      expect(await service.getData('missing-id')).toBeNull();
    });
  });

  describe('appendMessage', () => {
    it('메시지를 추가하고 TTL을 갱신한다', async () => {
      const existing = { createdAt: 1000, messages: [] };
      mockRedis.get.mockResolvedValue(JSON.stringify(existing));
      mockRedis.set.mockResolvedValue('OK');

      await service.appendMessage('test-id', { role: 'user', content: '안녕', timestamp: 2000 });

      const saved = JSON.parse(mockRedis.set.mock.calls[0][1]);
      expect(saved.messages).toHaveLength(1);
      expect(saved.messages[0].content).toBe('안녕');
      expect(mockRedis.set.mock.calls[0][3]).toBe(600);
    });
  });

  describe('delete', () => {
    it('세션 데이터를 반환하고 Redis 키를 삭제한다', async () => {
      const data = { createdAt: 1000, messages: [{ role: 'user', content: '스트레스', timestamp: 1 }] };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));
      mockRedis.del.mockResolvedValue(1);

      const result = await service.delete('test-id');
      expect(result).toEqual(data);
      expect(mockRedis.del).toHaveBeenCalledWith('session:test-id');
    });

    it('세션이 없으면 null을 반환한다', async () => {
      mockRedis.get.mockResolvedValue(null);
      expect(await service.delete('missing-id')).toBeNull();
    });
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=session.service
```

Expected: FAIL — `Cannot find module './session.service'`

- [ ] **Step 3: Redis provider 작성**

```ts
// apps/server/src/session/redis.provider.ts
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379'),
};
```

- [ ] **Step 4: SessionService 작성**

```ts
// apps/server/src/session/session.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Redis } from 'ioredis';
import { ChatMessage, SessionData } from '@gambass/types';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class SessionService {
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
    return raw ? JSON.parse(raw) : null;
  }

  async appendMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const data = await this.getData(sessionId);
    if (!data) return;
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
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=session.service
```

Expected: PASS — 6 tests

- [ ] **Step 6: 커밋**

```bash
git add apps/server/src/session/redis.provider.ts apps/server/src/session/session.service.ts apps/server/src/session/session.service.spec.ts
git commit -m "feat(session): SessionService Redis CRUD 구현 (#이슈번호)"
```

---

## Task 4: SessionController + SessionModule

**Files:**
- Create: `apps/server/src/session/session.controller.ts`
- Create: `apps/server/src/session/session.controller.spec.ts`
- Create: `apps/server/src/session/session.module.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// apps/server/src/session/session.controller.spec.ts
import { Test } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { OPENAI_CLIENT } from '../chat/openai.provider';

const mockSessionService = {
  create: jest.fn(),
  validate: jest.fn(),
  delete: jest.fn(),
};

const mockOpenai = {
  chat: { completions: { create: jest.fn() } },
};

describe('SessionController', () => {
  let controller: SessionController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: OPENAI_CLIENT, useValue: mockOpenai },
      ],
    }).compile();
    controller = module.get(SessionController);
  });

  describe('POST /session', () => {
    it('sessionId를 반환한다', async () => {
      mockSessionService.create.mockResolvedValue('abc-123');
      expect(await controller.create()).toEqual({ sessionId: 'abc-123' });
    });
  });

  describe('GET /session/check', () => {
    it('유효한 세션이면 { valid: true } 반환', async () => {
      mockSessionService.validate.mockResolvedValue(true);
      expect(await controller.check('abc-123')).toEqual({ valid: true });
    });

    it('없는 세션이면 { valid: false } 반환', async () => {
      mockSessionService.validate.mockResolvedValue(false);
      expect(await controller.check('missing')).toEqual({ valid: false });
    });
  });

  describe('DELETE /session', () => {
    it('세션이 존재하면 OpenAI 요약 후 { success: true } 반환', async () => {
      mockSessionService.delete.mockResolvedValue({
        createdAt: 1,
        messages: [{ role: 'user', content: '스트레스', timestamp: 1 }],
      });
      mockOpenai.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '유저가 스트레스를 토로했다.' } }],
      });
      expect(await controller.remove('abc-123')).toEqual({ success: true });
      expect(mockOpenai.chat.completions.create).toHaveBeenCalled();
    });

    it('메시지가 없으면 OpenAI 호출 없이 { success: true } 반환', async () => {
      mockSessionService.delete.mockResolvedValue({ createdAt: 1, messages: [] });
      expect(await controller.remove('abc-123')).toEqual({ success: true });
      expect(mockOpenai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('세션이 없으면 { success: false } 반환', async () => {
      mockSessionService.delete.mockResolvedValue(null);
      expect(await controller.remove('missing')).toEqual({ success: false });
    });
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=session.controller
```

Expected: FAIL — `Cannot find module './session.controller'`

- [ ] **Step 3: SessionController 작성**

DELETE 시 메시지 기록을 OpenAI로 한 줄 요약해 서버 로그에 남긴다. 요약 실패해도 삭제는 진행한다.

```ts
// apps/server/src/session/session.controller.ts
import { Controller, Post, Get, Delete, Query, Inject } from '@nestjs/common';
import OpenAI from 'openai';
import { SessionService } from './session.service';
import { OPENAI_CLIENT } from '../chat/openai.provider';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
  ) {}

  @Post()
  async create() {
    const sessionId = await this.sessionService.create();
    return { sessionId };
  }

  @Get('check')
  async check(@Query('sessionId') sessionId: string) {
    const valid = await this.sessionService.validate(sessionId);
    return { valid };
  }

  @Delete()
  async remove(@Query('sessionId') sessionId: string) {
    const data = await this.sessionService.delete(sessionId);
    if (!data) return { success: false };

    // 요약 생성 후 로그 기록 (실패해도 삭제는 완료)
    if (data.messages.length > 0) {
      try {
        const history = data.messages
          .map((m) => `${m.role === 'user' ? '유저' : 'AI'}: ${m.content}`)
          .join('\n');
        const summary = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 60,
          messages: [
            { role: 'user', content: `다음 대화를 한 문장으로 요약해줘:\n${history}` },
          ],
        });
        console.log(`[소각 요약] session:${sessionId} — ${summary.choices[0].message.content}`);
      } catch (e) {
        console.error(`[소각 요약 실패] session:${sessionId}`, e);
      }
    }

    return { success: true };
  }
}
```

- [ ] **Step 4: SessionModule 작성**

SessionController가 OpenAI를 사용하므로 `openaiProvider`와 `ConfigModule` 접근이 필요하다. `ConfigModule`은 `isGlobal: true`로 등록되어 있으므로 별도 import 불필요.

```ts
// apps/server/src/session/session.module.ts
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
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=session.controller
```

Expected: PASS — 4 tests

- [ ] **Step 6: 커밋**

```bash
git add apps/server/src/session/session.controller.ts apps/server/src/session/session.controller.spec.ts apps/server/src/session/session.module.ts
git commit -m "feat(session): SessionController + SessionModule 구현 (#이슈번호)"
```

---

## Task 5: ChatService (Moderation + 스트리밍 + 청킹)

**Files:**
- Create: `apps/server/src/chat/openai.provider.ts`
- Create: `apps/server/src/chat/chat.service.ts`
- Create: `apps/server/src/chat/chat.service.spec.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// apps/server/src/chat/chat.service.spec.ts
import { Test } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { SessionService } from '../session/session.service';
import { OPENAI_CLIENT } from './openai.provider';
import { Response } from 'express';

const mockSessionService = {
  getData: jest.fn(),
  appendMessage: jest.fn(),
};

const makeMockStream = (chunks: string[]) => ({
  [Symbol.asyncIterator]: async function* () {
    for (const c of chunks) {
      yield { choices: [{ delta: { content: c } }] };
    }
  },
});

const mockOpenai = {
  moderations: { create: jest.fn() },
  chat: { completions: { create: jest.fn() } },
};

const makeMockRes = () => {
  const writes: string[] = [];
  return {
    write: jest.fn((data: string) => writes.push(data)),
    end: jest.fn(),
    _writes: writes,
  } as unknown as Response & { _writes: string[] };
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: SessionService, useValue: mockSessionService },
        { provide: OPENAI_CLIENT, useValue: mockOpenai },
      ],
    }).compile();
    service = module.get(ChatService);
  });

  describe('streamChat', () => {
    it('Moderation flagged이면 경고 메시지를 emit하고 Redis에 저장하지 않는다', async () => {
      mockOpenai.moderations.create.mockResolvedValue({ results: [{ flagged: true }] });
      const res = makeMockRes();

      await service.streamChat('session-1', '나쁜말', res);

      expect(res.write).toHaveBeenCalledWith(
        expect.stringContaining('헉..괜춘?'),
      );
      expect(mockSessionService.appendMessage).not.toHaveBeenCalled();
      expect(res.end).toHaveBeenCalled();
    });

    it('정상 스트림이면 청킹된 SSE를 emit하고 Redis에 저장한다', async () => {
      mockOpenai.moderations.create.mockResolvedValue({ results: [{ flagged: false }] });
      mockSessionService.getData.mockResolvedValue({ createdAt: 1, messages: [] });
      mockOpenai.chat.completions.create.mockResolvedValue(
        makeMockStream(['야 그거 진짜', ' 힘들었겠다.', ' 근데 솔직히']),
      );
      const res = makeMockRes();

      await service.streamChat('session-1', '스트레스 받아', res);

      const allWrites = res._writes.join('');
      expect(allWrites).toContain('야 그거 진짜 힘들었겠다.');
      expect(allWrites).toContain('[DONE]');
      expect(mockSessionService.appendMessage).toHaveBeenCalledTimes(2);
    });

    it('OpenAI 에러 시 fallback 메시지를 emit한다', async () => {
      mockOpenai.moderations.create.mockResolvedValue({ results: [{ flagged: false }] });
      mockSessionService.getData.mockResolvedValue({ createdAt: 1, messages: [] });
      mockOpenai.chat.completions.create.mockRejectedValue(new Error('timeout'));
      const res = makeMockRes();

      await service.streamChat('session-1', '안녕', res);

      expect(res.write).toHaveBeenCalledWith(
        expect.stringContaining('아 쏘리 나 잠깐 딴 생각함'),
      );
      expect(res.end).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=chat.service
```

Expected: FAIL — `Cannot find module './chat.service'`

- [ ] **Step 3: OpenAI provider 작성**

```ts
// apps/server/src/chat/openai.provider.ts
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

export const OPENAI_CLIENT = 'OPENAI_CLIENT';

export const openaiProvider = {
  provide: OPENAI_CLIENT,
  useFactory: (config: ConfigService) =>
    new OpenAI({ apiKey: config.get<string>('OPENAI_API_KEY') }),
  inject: [ConfigService],
};
```

- [ ] **Step 4: ChatService 작성**

```ts
// apps/server/src/chat/chat.service.ts
import { Injectable, Inject } from '@nestjs/common';
import OpenAI from 'openai';
import { Response } from 'express';
import { SessionService } from '../session/session.service';
import { OPENAI_CLIENT } from './openai.provider';

const CHUNK_REGEX = /[.!?\n。？！]/;
const SYSTEM_PROMPT =
  '너는 거칠고 재치있는 친구야. 반드시 2~3문장 이내로 짧게 대답해. 판단하거나 설교하지 마. 친구처럼 편하게 반말로 말해.';

@Injectable()
export class ChatService {
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
          ...history.map((m) => ({ role: m.role, content: m.content })),
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
    } catch {
      res.write(`data: ${JSON.stringify({ chunk: '아 쏘리 나 잠깐 딴 생각함. 다시 말해줄래?' })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
```

- [ ] **Step 5: 테스트 통과 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=chat.service
```

Expected: PASS — 3 tests

- [ ] **Step 6: 커밋**

```bash
git add apps/server/src/chat/openai.provider.ts apps/server/src/chat/chat.service.ts apps/server/src/chat/chat.service.spec.ts
git commit -m "feat(chat): ChatService Moderation + SSE 스트리밍 구현 (#이슈번호)"
```

---

## Task 6: ChatController + ChatModule

**Files:**
- Create: `apps/server/src/chat/chat.dto.ts`
- Create: `apps/server/src/chat/chat.controller.ts`
- Create: `apps/server/src/chat/chat.controller.spec.ts`
- Create: `apps/server/src/chat/chat.module.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// apps/server/src/chat/chat.controller.spec.ts
import { Test } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SessionService } from '../session/session.service';
import { Response } from 'express';

const mockChatService = { streamChat: jest.fn() };
const mockSessionService = { validate: jest.fn() };

const makeMockRes = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
  }) as unknown as Response;

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();
    controller = module.get(ChatController);
  });

  it('유효하지 않은 sessionId면 401을 반환한다', async () => {
    mockSessionService.validate.mockResolvedValue(false);
    const res = makeMockRes();
    await controller.chat({ sessionId: 'bad', message: 'hi' }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockChatService.streamChat).not.toHaveBeenCalled();
  });

  it('유효한 sessionId면 SSE 헤더를 설정하고 streamChat을 호출한다', async () => {
    mockSessionService.validate.mockResolvedValue(true);
    mockChatService.streamChat.mockResolvedValue(undefined);
    const res = makeMockRes();
    await controller.chat({ sessionId: 'valid', message: '스트레스' }, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(mockChatService.streamChat).toHaveBeenCalledWith('valid', '스트레스', res);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=chat.controller
```

Expected: FAIL — `Cannot find module './chat.controller'`

- [ ] **Step 3: ChatRequestDto 작성**

```ts
// apps/server/src/chat/chat.dto.ts
export class ChatRequestDto {
  sessionId: string;
  message: string;
}
```

- [ ] **Step 4: ChatController 작성**

```ts
// apps/server/src/chat/chat.controller.ts
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
```

- [ ] **Step 5: ChatModule 작성**

```ts
// apps/server/src/chat/chat.module.ts
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
```

- [ ] **Step 6: 테스트 통과 확인**

```bash
cd apps/server && pnpm test -- --testPathPattern=chat.controller
```

Expected: PASS — 2 tests

- [ ] **Step 7: 커밋**

```bash
git add apps/server/src/chat/chat.dto.ts apps/server/src/chat/chat.controller.ts apps/server/src/chat/chat.controller.spec.ts apps/server/src/chat/chat.module.ts
git commit -m "feat(chat): ChatController + ChatModule 구현 (#이슈번호)"
```

---

## Task 7: AppModule 등록 + 전체 테스트 통과 확인

**Files:**
- Modify: `apps/server/src/app.module.ts`

- [ ] **Step 1: AppModule에 SessionModule + ChatModule 등록**

```ts
// apps/server/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 20 }]),
    HealthModule,
    SessionModule,
    ChatModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 2: 전체 테스트 통과 확인**

```bash
cd apps/server && pnpm test
```

Expected: PASS — 모든 테스트 (SessionService 6 + SessionController 5 + ChatService 3 + ChatController 2 = 16개)

- [ ] **Step 3: 빌드 확인**

```bash
pnpm --filter server build
```

Expected: 에러 없이 `dist/` 생성.

- [ ] **Step 4: 로컬 smoke test (Redis + OpenAI 키 있을 때)**

```bash
# 터미널 1: 서버 실행
pnpm --filter server start:dev

# 터미널 2: 세션 발급
curl -s -X POST http://localhost:4000/api/session | jq .
# Expected: {"sessionId":"...uuid..."}

# 터미널 3: SSE 채팅 (발급된 sessionId로)
curl -N -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<위에서받은ID>","message":"스트레스 받아"}'
# Expected: data: {"chunk":"..."} 줄들이 스트리밍
```

- [ ] **Step 5: 커밋**

```bash
git add apps/server/src/app.module.ts
git commit -m "feat(server): SessionModule + ChatModule AppModule에 등록 (#이슈번호)"
```
