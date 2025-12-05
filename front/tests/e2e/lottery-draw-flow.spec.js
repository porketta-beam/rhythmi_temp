// @ts-check
import { test, expect } from '@playwright/test';

/**
 * 추첨 플로우 테스트 (API 기반)
 */
test.describe('추첨 플로우', () => {
  const EVENT_ID = 'sfs-2025';
  const API_BASE = 'http://localhost:8000/api/luckydraw';

  test.beforeEach(async ({ request }) => {
    // 테스트 전 이벤트 리셋
    try {
      await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
        data: {
          reset_participants: true,
          reset_draws: true
        }
      });
    } catch (e) {
      console.log('Reset may have failed (first run):', e);
    }
  });

  test('참가자 등록 API 테스트', async ({ request }) => {
    // 참가자 등록
    const response = await request.post(`${API_BASE}/register`, {
      data: {
        event_id: EVENT_ID,
        session_token: null
      }
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.draw_number).toBeDefined();
    expect(result.data.draw_number).toBeGreaterThanOrEqual(0);
    expect(result.data.draw_number).toBeLessThan(300);
    expect(result.data.session_token).toBeDefined();
  });

  test('추첨 실행 API 테스트', async ({ request }) => {
    // 먼저 참가자 등록
    await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });

    // 추첨 시작
    const startResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: 'API 테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });

    expect(startResponse.ok()).toBeTruthy();
    const startResult = await startResponse.json();
    expect(startResult.success).toBe(true);

    // 결과 발표
    const revealResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
    expect(revealResponse.ok()).toBeTruthy();

    const revealResult = await revealResponse.json();
    expect(revealResult.success).toBe(true);
    expect(revealResult.data.winners).toHaveLength(1);

    // 추첨 완료 (이력 기록)
    const completeResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);
    expect(completeResponse.ok()).toBeTruthy();
  });

  test('중복 당첨 방지 확인', async ({ request }) => {
    // 참가자 1명만 등록
    const registerResponse = await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });
    const participant = await registerResponse.json();
    const drawNumber = participant.data.draw_number;

    // 첫 번째 추첨
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '1등 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
    // 추첨 완료 (이력 기록) - 이후 중복 당첨 방지 체크에 필요
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);

    // 두 번째 추첨 시도 (참가자 0명이어야 함 - 이미 당첨됨)
    const secondDraw = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '2등 상품',
        prize_rank: 2,
        draw_mode: 'slot',
        winner_count: 1
      }
    });

    // 추첨 가능 인원이 없으면 실패해야 함
    expect(secondDraw.ok()).toBeFalsy();
    expect(secondDraw.status()).toBe(400);
  });

  test('다중 당첨자 추첨 (연속 추첨)', async ({ request }) => {
    // 참가자 5명 등록
    for (let i = 0; i < 5; i++) {
      await request.post(`${API_BASE}/register`, {
        data: { event_id: EVENT_ID, session_token: null }
      });
    }

    // slot 모드는 1명씩만 가능하므로 3번 연속 추첨
    const winners = [];
    for (let i = 0; i < 3; i++) {
      const startResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
        data: {
          prize_name: `${i + 1}등 상품`,
          prize_rank: i + 1,
          draw_mode: 'slot',
          winner_count: 1
        }
      });

      expect(startResponse.ok()).toBeTruthy();

      const revealResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
      const result = await revealResponse.json();

      if (result.data?.winners?.length > 0) {
        winners.push(...result.data.winners);
      }

      // 추첨 완료 (이력 기록) - 다음 추첨에서 중복 당첨 방지 위해 필수
      await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);
    }

    // 3명이 당첨되어야 함
    expect(winners).toHaveLength(3);
    // 모두 다른 번호여야 함 (중복 당첨 방지)
    expect(new Set(winners).size).toBe(3);
  });

  test('참가자 목록 조회', async ({ request }) => {
    // 참가자 등록
    await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });

    // 목록 조회
    const response = await request.get(`${API_BASE}/admin/${EVENT_ID}/participants`);
    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.data.total_count).toBeGreaterThanOrEqual(1);
  });

  test('추첨 이력 조회', async ({ request }) => {
    // 참가자 등록 및 추첨
    await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });

    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '이력 테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
    // 추첨 완료 (이력 기록)
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);

    // 이력 조회
    const response = await request.get(`${API_BASE}/admin/${EVENT_ID}/draws`);
    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result.data.total_count).toBeGreaterThanOrEqual(1);
  });
});
