import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';
import { SessionService } from './session.service';

const redisTestUrl = process.env.REDIS_TEST_URL;
const runRedisIntegrationTests = process.env.RUN_REDIS_INTEGRATION_TESTS === 'true' && redisTestUrl;
const describeWithRedis = runRedisIntegrationTests ? describe : describe.skip;

describeWithRedis('SessionService Redis integration', () => {
  let redis: Redis;
  let service: SessionService;
  const keysToDelete = new Set<string>();

  beforeAll(async () => {
    redis = new Redis(redisTestUrl!, { maxRetriesPerRequest: 1 });
    await redis.ping();
    service = new SessionService(redis);
  });

  afterEach(async () => {
    if (keysToDelete.size > 0) {
      await redis.del(...keysToDelete);
      keysToDelete.clear();
    }
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('실제 Lua 스크립트가 최초 삭제와 응답 유실 후 재시도를 멱등하게 처리한다', async () => {
    const sessionId = randomUUID();
    const burnAttemptId = randomUUID();
    const sessionKey = `session:${sessionId}`;
    const completionKey = `session-delete-attempt:${burnAttemptId}`;
    const deletedData = {
      createdAt: 1000,
      messages: [{ role: 'user' as const, content: '삭제될 대화 원문', timestamp: 1 }],
    };
    keysToDelete.add(sessionKey);
    keysToDelete.add(completionKey);
    await redis.set(sessionKey, JSON.stringify(deletedData));

    const firstResult = await service.delete(sessionId, burnAttemptId);

    expect(firstResult).toEqual({ status: 'deleted', data: deletedData });
    expect(await redis.get(sessionKey)).toBeNull();
    const completionRecord = await redis.get(completionKey);
    expect(completionRecord).toBe(sessionId);
    expect(completionRecord).not.toContain('삭제될 대화 원문');

    const replacementData = JSON.stringify({ createdAt: 2000, messages: [] });
    await redis.set(sessionKey, replacementData);

    const retryAfterLostResponse = await service.delete(sessionId, burnAttemptId);

    expect(retryAfterLostResponse).toEqual({ status: 'already_deleted' });
    expect(await redis.get(sessionKey)).toBe(replacementData);
  });

  it('실제 Lua 스크립트가 세션과 완료 기록이 없는 요청을 실패시킨다', async () => {
    const sessionId = randomUUID();
    const burnAttemptId = randomUUID();
    keysToDelete.add(`session:${sessionId}`);
    keysToDelete.add(`session-delete-attempt:${burnAttemptId}`);

    expect(await service.delete(sessionId, burnAttemptId)).toEqual({ status: 'not_found' });
  });

  it('실제 Lua 스크립트가 같은 시도 식별자의 다른 세션을 삭제하지 않는다', async () => {
    const completedSessionId = randomUUID();
    const otherSessionId = randomUUID();
    const burnAttemptId = randomUUID();
    const otherSessionKey = `session:${otherSessionId}`;
    const completionKey = `session-delete-attempt:${burnAttemptId}`;
    const otherSessionData = JSON.stringify({ createdAt: 3000, messages: [] });
    keysToDelete.add(otherSessionKey);
    keysToDelete.add(completionKey);
    await redis.set(completionKey, completedSessionId);
    await redis.set(otherSessionKey, otherSessionData);

    expect(await service.delete(otherSessionId, burnAttemptId)).toEqual({
      status: 'attempt_conflict',
    });
    expect(await redis.get(otherSessionKey)).toBe(otherSessionData);
  });
});
