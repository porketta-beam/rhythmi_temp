// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * 경품 추첨 시스템 E2E 테스트 설정
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* 병렬 실행 비활성화 (WebSocket 테스트 순서 보장) */
  fullyParallel: false,
  workers: 1,

  /* CI 환경에서 재시도 */
  retries: process.env.CI ? 2 : 0,

  /* 리포터 설정 */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  /* 전역 설정 */
  use: {
    /* 기본 URL */
    baseURL: 'http://localhost:3000',

    /* 실패 시 스크린샷 */
    screenshot: 'only-on-failure',

    /* 트레이스 수집 */
    trace: 'on-first-retry',

    /* 타임아웃 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 테스트 타임아웃 */
  timeout: 60000,

  /* 프로젝트별 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  /* 로컬 개발 서버 */
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd ../server && python main_test.py',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
