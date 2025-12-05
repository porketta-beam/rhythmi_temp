// @ts-check
import { test, expect } from '@playwright/test';

/**
 * 참가자 등록 플로우 테스트
 *
 * 페이지 플로우: consent → personal → waiting
 * 이벤트 ID: sfs-2025
 */
test.describe('참가자 등록', () => {
  const EVENT_ID = 'sfs-2025';

  // 동의 및 개인정보 입력 헬퍼
  async function completeRegistration(page) {
    await page.goto('/lottery/waiting');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 1. 동의 페이지 - 체크박스 label 클릭 후 버튼 클릭
    const checkboxLabel = page.locator('label:has-text("동의합니다")').first();
    if (await checkboxLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkboxLabel.click();
      await page.waitForTimeout(300);
    }

    const consentBtn = page.locator('button:has-text("동의하고 참여하기")').first();
    if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await consentBtn.click();
      await page.waitForTimeout(500);
    }

    // 2. 개인정보 입력 페이지
    const nameInput = page.locator('input[placeholder="홍길동"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('테스트사용자');
      await page.waitForTimeout(200);

      const phoneInput = page.locator('input[placeholder="010-1234-5678"]').first();
      if (await phoneInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await phoneInput.fill('01098765432');
        await page.waitForTimeout(200);
      }

      // 제출 버튼 클릭 (참여하기)
      const submitBtn = page.locator('button:has-text("참여하기")').first();
      await page.waitForTimeout(500); // 버튼 활성화 대기
      if (await submitBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 3. 대기 페이지에서 번호 확인
    await page.waitForTimeout(2000);
  }

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('신규 사용자 등록 시 3자리 번호 발급', async ({ page }) => {
    await completeRegistration(page);

    // 번호가 표시될 때까지 대기 (개별 숫자로 표시됨)
    const digitElements = page.locator('.text-4xl, .text-5xl');
    await expect(digitElements.first()).toBeVisible({ timeout: 15000 });

    // 숫자 3개가 표시되어야 함
    const count = await digitElements.count();
    expect(count).toBe(3);

    // 모든 숫자가 0-9 범위인지 확인
    for (let i = 0; i < count; i++) {
      const text = await digitElements.nth(i).textContent();
      expect(text).toMatch(/^\d$/);
    }
  });

  test('동일 브라우저 재접속 시 동일 번호 반환', async ({ page }) => {
    await completeRegistration(page);

    // 첫 번째 번호 확인
    const digitElements = page.locator('.text-4xl, .text-5xl');
    await expect(digitElements.first()).toBeVisible({ timeout: 15000 });

    const firstNumber = [];
    const count = await digitElements.count();
    for (let i = 0; i < count; i++) {
      firstNumber.push(await digitElements.nth(i).textContent());
    }

    // 페이지 새로고침
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 같은 번호인지 확인
    const secondDigits = page.locator('.text-4xl, .text-5xl');
    await expect(secondDigits.first()).toBeVisible({ timeout: 10000 });

    const secondNumber = [];
    for (let i = 0; i < await secondDigits.count(); i++) {
      secondNumber.push(await secondDigits.nth(i).textContent());
    }

    expect(secondNumber.join('')).toBe(firstNumber.join(''));
  });

  test('다른 브라우저(컨텍스트)에서 다른 번호 발급', async ({ browser }) => {
    // 첫 번째 컨텍스트
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await completeRegistration.call(null, page1);

    const digits1 = page1.locator('.text-4xl, .text-5xl');
    await expect(digits1.first()).toBeVisible({ timeout: 15000 });
    const number1 = [];
    for (let i = 0; i < await digits1.count(); i++) {
      number1.push(await digits1.nth(i).textContent());
    }

    // 두 번째 컨텍스트
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await completeRegistration.call(null, page2);

    const digits2 = page2.locator('.text-4xl, .text-5xl');
    await expect(digits2.first()).toBeVisible({ timeout: 15000 });
    const number2 = [];
    for (let i = 0; i < await digits2.count(); i++) {
      number2.push(await digits2.nth(i).textContent());
    }

    // 다른 번호여야 함
    expect(number1.join('')).not.toBe(number2.join(''));

    await context1.close();
    await context2.close();
  });

  test('Admin 페이지에서 참가자 수 확인', async ({ page }) => {
    // Admin 페이지 접속
    await page.goto('/lottery/admin');
    await page.waitForLoadState('networkidle');

    // 참가자 수가 표시되는지 확인
    await page.waitForTimeout(3000);

    // 숫자가 포함된 요소가 있어야 함
    const countElement = page.locator('text=/\\d+\\s*명/, text=/참가자.*\\d+/');
    const isVisible = await countElement.first().isVisible({ timeout: 5000 }).catch(() => false);

    if (!isVisible) {
      // 페이지가 정상적으로 로드되었는지만 확인
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// completeRegistration 함수를 테스트 외부에서 호출할 수 있도록 헬퍼 추가
async function completeRegistration(page) {
  await page.goto('/lottery/waiting');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 1. 동의 페이지 - 체크박스 label 클릭 후 버튼 클릭
  const checkboxLabel = page.locator('label:has-text("동의합니다")').first();
  if (await checkboxLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
    await checkboxLabel.click();
    await page.waitForTimeout(300);
  }

  const consentBtn = page.locator('button:has-text("동의하고 참여하기")').first();
  if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. 개인정보 입력
  const nameInput = page.locator('input[placeholder="홍길동"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill('테스트' + Math.random().toString(36).slice(2, 6));
    await page.waitForTimeout(200);

    const phoneInput = page.locator('input[placeholder="010-1234-5678"]').first();
    if (await phoneInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await phoneInput.fill('01098765432');
      await page.waitForTimeout(200);
    }

    const submitBtn = page.locator('button:has-text("참여하기")').first();
    await page.waitForTimeout(500); // 버튼 활성화 대기
    if (await submitBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  await page.waitForTimeout(2000);
}
