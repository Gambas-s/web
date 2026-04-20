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
