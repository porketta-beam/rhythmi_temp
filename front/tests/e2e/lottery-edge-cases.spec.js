// @ts-check
import { test, expect } from '@playwright/test';

/**
 * 엣지 케이스 및 장애 시나리오 테스트 (API 기반)
 */
test.describe('엣지 케이스', () => {
  const EVENT_ID = 'sfs-2025';
  const API_BASE = 'http://localhost:8000/api/luckydraw';

  test('참가자 0명 상태에서 추첨 시도', async ({ request }) => {
    // 리셋
    await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
      data: { reset_participants: true, reset_draws: true }
    });

    // 참가자 없이 추첨 시도
    const response = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });

    // 에러 응답이어야 함
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);

    const result = await response.json();
    expect(result.detail.code).toBe('DRAW_FAILED');
  });

  test('slot 모드에서 다중 당첨자 요청 시 오류', async ({ request }) => {
    // 리셋
    await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
      data: { reset_participants: true, reset_draws: true }
    });

    // 2명 등록
    for (let i = 0; i < 2; i++) {
      await request.post(`${API_BASE}/register`, {
        data: { event_id: EVENT_ID, session_token: null }
      });
    }

    // slot 모드에서 5명 당첨 요청 → 실패해야 함 (slot은 1명만 지원)
    const response = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 5
      }
    });

    // slot 모드는 1명만 지원하므로 실패해야 함
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('리셋 기능 - 추첨 결과만 리셋', async ({ request }) => {
    // 참가자 등록
    const registerResponse = await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });
    const participant = await registerResponse.json();
    const token = participant.data.session_token;

    // 추첨 실행
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: '테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
    // 추첨 완료 (이력 기록)
    await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);

    // 추첨 결과만 리셋 (참가자 유지)
    const resetResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
      data: {
        reset_participants: false,
        reset_draws: true
      }
    });
    expect(resetResponse.ok()).toBeTruthy();

    // 같은 토큰으로 번호 조회 가능해야 함
    const myNumberResponse = await request.get(
      `${API_BASE}/my-number?event_id=${EVENT_ID}&session_token=${token}`
    );
    expect(myNumberResponse.ok()).toBeTruthy();

    // 당첨 이력은 비어있어야 함
    const historyResponse = await request.get(`${API_BASE}/admin/${EVENT_ID}/draws`);
    const history = await historyResponse.json();
    expect(history.data.total_count).toBe(0);
  });

  test('리셋 기능 - 전체 리셋', async ({ request }) => {
    // 참가자 등록
    await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });

    // 전체 리셋
    const resetResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
      data: {
        reset_participants: true,
        reset_draws: true
      }
    });
    expect(resetResponse.ok()).toBeTruthy();

    // 참가자 수 확인 (0이어야 함)
    const participantsResponse = await request.get(`${API_BASE}/admin/${EVENT_ID}/participants`);
    const participants = await participantsResponse.json();
    expect(participants.data.total_count).toBe(0);
  });

  test('당첨 여부 API 확인', async ({ request }) => {
    // 리셋
    await request.post(`${API_BASE}/admin/${EVENT_ID}/reset`, {
      data: { reset_participants: true, reset_draws: true }
    });

    // 참가자 등록
    const registerResponse = await request.post(`${API_BASE}/register`, {
      data: { event_id: EVENT_ID, session_token: null }
    });
    const participant = await registerResponse.json();
    const drawNumber = participant.data.draw_number;

    // 당첨 전 확인
    const beforeCheck = await request.get(
      `${API_BASE}/check-winner?event_id=${EVENT_ID}&draw_number=${drawNumber}`
    );
    const beforeResult = await beforeCheck.json();
    expect(beforeResult.data.won).toBe(false);

    // 추첨 실행
    const startResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/start-animation`, {
      data: {
        prize_name: 'API 테스트 상품',
        prize_rank: 1,
        draw_mode: 'slot',
        winner_count: 1
      }
    });
    expect(startResponse.ok()).toBeTruthy();

    const revealResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/reveal`);
    expect(revealResponse.ok()).toBeTruthy();
    const revealResult = await revealResponse.json();

    // reveal 응답에서 당첨자 확인
    console.log('Reveal result:', revealResult);
    expect(revealResult.data.winners).toContain(drawNumber);

    // 추첨 완료 (이력 기록) - check-winner가 동작하려면 필수
    const completeResponse = await request.post(`${API_BASE}/admin/${EVENT_ID}/draw/complete`);
    expect(completeResponse.ok()).toBeTruthy();

    // 당첨 후 확인 (참가자가 1명이므로 반드시 당첨)
    const afterCheck = await request.get(
      `${API_BASE}/check-winner?event_id=${EVENT_ID}&draw_number=${drawNumber}`
    );
    const afterResult = await afterCheck.json();
    console.log('After check result:', afterResult);
    expect(afterResult.data.won).toBe(true);
    expect(afterResult.data.prizes).toHaveLength(1);
    expect(afterResult.data.prizes[0].prize_name).toBe('API 테스트 상품');
  });

  test('Main 페이지 새로고침 후 상태 유지', async ({ page }) => {
    await page.goto('/lottery');
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되는지 확인
    await expect(page.locator('body')).toBeVisible();

    // 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 에러 없이 정상 동작
    await expect(page.locator('body')).toBeVisible();
  });
});
