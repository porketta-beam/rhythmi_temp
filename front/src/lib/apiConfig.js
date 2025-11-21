// API 기본 URL 설정 및 정규화
// 끝의 슬래시를 제거하여 URL 병합 시 이중 슬래시 방지
function normalizeApiBase(url) {
  if (!url) return "http://localhost:8000";
  return url.replace(/\/+$/, ""); // 끝의 슬래시 제거
}

export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000");

