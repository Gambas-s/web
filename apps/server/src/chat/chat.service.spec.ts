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
