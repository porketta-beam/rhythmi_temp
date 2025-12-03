'use client';

import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

/**
 * ConsentForm - 개인정보 수집 동의 컴포넌트
 *
 * @param {Function} onConsent - 동의 완료 시 호출되는 콜백
 */
export default function ConsentForm({ onConsent }) {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (agreed && onConsent) {
      onConsent();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">개인정보 수집 동의</h1>
          <p className="text-gray-400">경품 추첨 참여를 위해 동의가 필요합니다</p>
        </div>

        {/* 동의 내용 */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">수집 항목 및 목적</h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">수집 항목</p>
                <p className="text-gray-400">성명, 연락처(휴대폰 번호)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">수집 목적</p>
                <p className="text-gray-400">경품 당첨 시 본인 확인 및 경품 전달</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">보유 기간</p>
                <p className="text-gray-400">행사 종료 후 즉시 파기</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">동의 거부 시</p>
                <p className="text-gray-400">경품 추첨에 참여하실 수 없습니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 동의 체크박스 */}
        <form onSubmit={handleSubmit}>
          <label className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700 cursor-pointer hover:border-cyan-500/50 transition-colors mb-6">
            <div className="relative">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                agreed
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-gray-500 bg-transparent'
              }`}>
                {agreed && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
            </div>
            <span className="text-white text-sm">
              위 개인정보 수집 및 이용에 <strong className="text-cyan-400">동의합니다</strong>
            </span>
          </label>

          {/* 다음 버튼 */}
          <button
            type="submit"
            disabled={!agreed}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              agreed
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            동의하고 참여하기
          </button>
        </form>

        {/* 안내 문구 */}
        <p className="text-center text-gray-500 text-xs mt-4">
          동의하지 않으시면 경품 추첨에 참여하실 수 없습니다
        </p>
      </div>
    </div>
  );
}
