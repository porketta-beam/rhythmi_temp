// @ts-check
import { test, expect } from '@playwright/test';

/**
 * WebSocket 연결/재연결 테스트
 */
test.describe('WebSocket 연결', () => {

  test('Main 페이지 정상 로드', async ({ page }) => {
    await page.goto('/lottery');
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible();

    // 콘솔 에러 수집
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(3000);

    // 치명적 WebSocket 에러가 없어야 함
    const criticalErrors = errors.filter(e =>
      e.includes('WebSocket') && e.includes('failed')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Admin 페이지 정상 로드', async ({ page }) => {
    await page.goto('/lottery/admin');
    await page.waitForLoadState('networkidle');

    // Admin 페이지 로드 확인
    await expect(page.locator('body')).toBeVisible();

    // 버튼이 있어야 함
    await page.waitForTimeout(2000);
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('Waiting 페이지 정상 로드', async ({ page }) => {
    await page.goto('/lottery/waiting');
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible();

    // 동의 버튼 또는 대기 화면이 표시되어야 함
    const hasContent = await page.locator('button, h1, h2').first().isVisible({ timeout: 10000 });
    expect(hasContent).toBeTruthy();
  });

  test('페이지 새로고침 후 정상 동작', async ({ page }) => {
    await page.goto('/lottery');
    await page.waitForLoadState('networkidle');

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 에러 없이 정상 동작
    await expect(page.locator('body')).toBeVisible();
  });
});
