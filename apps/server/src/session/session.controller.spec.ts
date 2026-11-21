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
    it('세션이 실제 삭제되면 OpenAI 요약 후 deleted 성공 결과를 반환한다', async () => {
      mockSessionService.delete.mockResolvedValue({
        status: 'deleted',
        data: {
          createdAt: 1,
          messages: [{ role: 'user', content: '스트레스', timestamp: 1 }],
        },
      });
      mockOpenai.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '유저가 스트레스를 토로했다.' } }],
      });
      expect(await controller.remove('abc-123', 'attempt-1')).toEqual({
        success: true,
        status: 'deleted',
      });
      expect(mockSessionService.delete).toHaveBeenCalledWith('abc-123', 'attempt-1');
      expect(mockOpenai.chat.completions.create).toHaveBeenCalled();
    });

    it('메시지가 없으면 OpenAI 호출 없이 deleted 성공 결과를 반환한다', async () => {
      mockSessionService.delete.mockResolvedValue({
        status: 'deleted',
        data: { createdAt: 1, messages: [] },
      });
      expect(await controller.remove('abc-123', 'attempt-1')).toEqual({
        success: true,
        status: 'deleted',
      });
      expect(mockOpenai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('동일 시도가 이미 완료됐으면 요약을 반복하지 않고 기존 성공 결과를 반환한다', async () => {
      mockSessionService.delete.mockResolvedValue({ status: 'already_deleted' });

      expect(await controller.remove('abc-123', 'attempt-1')).toEqual({
        success: true,
        status: 'already_deleted',
      });
      expect(mockOpenai.chat.completions.create).not.toHaveBeenCalled();
    });

    it('세션과 완료 기록이 없으면 실패 결과를 반환한다', async () => {
      mockSessionService.delete.mockResolvedValue({ status: 'not_found' });

      expect(await controller.remove('missing', 'attempt-1')).toEqual({
        success: false,
        status: 'not_found',
      });
    });

    it('세션 또는 시도 식별자가 없으면 삭제를 호출하지 않는다', async () => {
      expect(await controller.remove('', 'attempt-1')).toEqual({
        success: false,
        status: 'invalid_request',
      });
      expect(await controller.remove('abc-123', '')).toEqual({
        success: false,
        status: 'invalid_request',
      });
      expect(mockSessionService.delete).not.toHaveBeenCalled();
    });
  });
});
