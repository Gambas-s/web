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
