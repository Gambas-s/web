import { Test } from '@nestjs/testing';
import { SessionService } from './session.service';
import { REDIS_CLIENT } from './redis.provider';

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  exists: jest.fn(),
  del: jest.fn(),
  eval: jest.fn(),
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
    it('세션 삭제와 완료 기록을 원자적으로 처리하고 삭제 데이터를 반환한다', async () => {
      const data = { createdAt: 1000, messages: [{ role: 'user', content: '스트레스', timestamp: 1 }] };
      mockRedis.eval.mockResolvedValue(['deleted', JSON.stringify(data)]);

      const result = await service.delete('test-id', 'attempt-1');

      expect(result).toEqual({ status: 'deleted', data });
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('DEL', KEYS[1])"),
        2,
        'session:test-id',
        'session-delete-attempt:attempt-1',
        'test-id',
      );
      const completionRecordArguments = mockRedis.eval.mock.calls[0].slice(3);
      expect(JSON.stringify(completionRecordArguments)).not.toContain('스트레스');
    });

    it('삭제 전에 Redis 처리가 실패하면 실패를 전달한다', async () => {
      mockRedis.eval.mockRejectedValue(new Error('redis unavailable'));

      await expect(service.delete('test-id', 'attempt-1')).rejects.toThrow('redis unavailable');
      expect(mockRedis.set).not.toHaveBeenCalled();
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('삭제 성공 응답 유실 후 같은 시도 식별자의 재요청은 already_deleted로 복구한다', async () => {
      mockRedis.eval.mockResolvedValue(['already_deleted']);

      expect(await service.delete('test-id', 'attempt-1')).toEqual({ status: 'already_deleted' });
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.any(String),
        2,
        'session:test-id',
        'session-delete-attempt:attempt-1',
        'test-id',
      );
    });

    it('세션과 완료 기록이 모두 없으면 not_found를 반환한다', async () => {
      mockRedis.eval.mockResolvedValue(['not_found']);

      expect(await service.delete('missing-id', 'attempt-1')).toEqual({ status: 'not_found' });
    });

  });
});
