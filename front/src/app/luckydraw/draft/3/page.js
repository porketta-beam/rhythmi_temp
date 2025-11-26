'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Three.js는 SSR을 지원하지 않으므로 dynamic import 사용
const NetworkGraph3D = dynamic(
  () => import('@/components/luckydraw/NetworkGraph3D'),
  { ssr: false }
);

// 무작위 이름 생성용 데이터
const ADJECTIVES = [
  '열정적인', '용감한', '지혜로운', '빛나는', '즐거운',
  '활기찬', '따뜻한', '신비로운', '우아한', '재빠른',
  '영리한', '강인한', '친절한', '멋진', '귀여운',
  '당당한', '자유로운', '행복한', '반짝이는', '푸른',
];

const ANIMALS = [
  '여우', '토끼', '사자', '호랑이', '곰',
  '늑대', '독수리', '돌고래', '판다', '코끼리',
  '펭귄', '고양이', '강아지', '올빼미', '공작새',
  '사슴', '다람쥐', '수달', '표범', '기린',
];

/**
 * 무작위 이름 생성
 */
function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

/**
 * Draft 3: 뉴로 링크 스타일 ⭐ (추천)
 * Three.js 기반 3D 네트워크 시각화
 * - 구 내부에 무작위 분포된 노드
 * - 노드 간 링크 연결
 * - 자연스러운 부유 + 카메라 자동 회전
 */
export default function Draft3Page() {
  const [participants, setParticipants] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle, searching, found
  const [winner, setWinner] = useState(null);
  const [customName, setCustomName] = useState('');
  const [nextId, setNextId] = useState(1);
  const [bgRotation, setBgRotation] = useState(true); // 배경 구체 회전
  const [nodeRotation, setNodeRotation] = useState(false); // 노드 그룹 자체 회전

  // 참여자 추가 (1명)
  const addParticipant = useCallback((name = null) => {
    const newParticipant = {
      id: `p-${nextId}`,
      luckyNumber: String(nextId).padStart(3, '0'),
      name: name || null,
    };
    setParticipants(prev => [...prev, newParticipant]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  // 여러 명 추가
  const addMultipleParticipants = useCallback((count, withRandomNames = false) => {
    const newParticipants = Array.from({ length: count }, (_, i) => ({
      id: `p-${nextId + i}`,
      luckyNumber: String(nextId + i).padStart(3, '0'),
      name: withRandomNames ? generateRandomName() : null,
    }));
    setParticipants(prev => [...prev, ...newParticipants]);
    setNextId(prev => prev + count);
  }, [nextId]);

  // 이름으로 참여자 추가
  const addParticipantWithName = useCallback(() => {
    if (!customName.trim()) return;
    addParticipant(customName.trim());
    setCustomName('');
  }, [customName, addParticipant]);

  // 추첨 시작
  const startDraw = useCallback(() => {
    if (participants.length === 0 || phase !== 'idle') return;

    setPhase('searching');
    setWinner(null);

    // 랜덤 당첨자 선택
    const randomIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[randomIndex];

    // 탐색 애니메이션 후 당첨자 표시 (4초)
    setTimeout(() => {
      setWinner(selectedWinner);
      setPhase('found');
    }, 4000);
  }, [participants, phase]);

  // 다시 추첨
  const resetDraw = () => {
    setWinner(null);
    setPhase('idle');
  };

  // 초기화
  const clearAll = () => {
    setParticipants([]);
    setNextId(1);
    setWinner(null);
    setPhase('idle');
  };

  return (
    <div className="min-h-screen bg-[#0B1026] text-white overflow-hidden relative">
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #1E2A4A 0%, #141B33 30%, #0B1026 100%)',
        }}
      />

      {/* 3D 네트워크 그래프 */}
      <NetworkGraph3D
        participants={participants}
        phase={phase}
        winnerId={winner?.id}
        bgRotation={bgRotation}
        nodeRotation={nodeRotation}
      />

      {/* 좌측 UI 오버레이 */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-8">

        {/* 상단 제목 */}
        <div className="text-center mt-8">
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
            🎉 경품 추첨 🎉
          </h1>
          <p className="text-lg text-[#B0B8C8]">
            Draft 3: 3D 뉴로 링크 스타일 ⭐
          </p>
        </div>

        {/* 하단 컨트롤 */}
        <div className="mt-auto mb-8 flex flex-col items-center">

          {/* 당첨 결과 */}
          {phase === 'found' && winner && (
            <div className="animate-fade-in text-center mb-8">
              <p
                className="text-4xl font-bold text-[#FF00FF] mb-2"
                style={{ textShadow: '0 0 30px rgba(255, 0, 255, 0.8)' }}
              >
                🎊 축하합니다! 🎊
              </p>
              <p className="text-2xl text-[#B0B8C8]">
                {winner.name ? (
                  <>
                    <span className="text-[#00FFCC] font-bold text-3xl" style={{ textShadow: '0 0 20px rgba(0, 255, 204, 0.6)' }}>
                      {winner.name}
                    </span>
                    <span className="text-lg ml-2">({winner.luckyNumber})</span>
                  </>
                ) : (
                  <>
                    당첨 번호:{' '}
                    <span className="text-[#00FFCC] font-bold text-4xl" style={{ textShadow: '0 0 20px rgba(0, 255, 204, 0.6)' }}>
                      {winner.luckyNumber}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* 상태 표시 */}
          {phase === 'searching' && (
            <div className="text-center mb-8">
              <p className="text-2xl text-[#00D4FF] animate-pulse">
                🔍 당첨자를 찾고 있습니다...
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            {phase === 'idle' && participants.length > 0 && (
              <button
                onClick={startDraw}
                className="px-12 py-4 rounded-full font-bold text-xl bg-gradient-to-r from-[#FF00FF] to-[#FF66B2] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                style={{ boxShadow: '0 0 30px rgba(255, 0, 255, 0.4)' }}
              >
                추첨 시작
              </button>
            )}

            {phase === 'found' && (
              <button
                onClick={resetDraw}
                className="px-12 py-4 rounded-full font-bold text-xl border-2 border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all duration-300"
              >
                다시 추첨
              </button>
            )}
          </div>

          {/* 참여자 수 */}
          <div className="mt-4 text-[#7A8599]">
            참여자: {participants.length}명
          </div>
        </div>
      </div>

      {/* 우측 패널 */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0B1026]/80 backdrop-blur-md border-l border-[#1E2A4A] z-20 flex flex-col">
        {/* 패널 헤더 */}
        <div className="p-6 border-b border-[#1E2A4A]">
          <h2 className="text-xl font-bold text-[#00D4FF] mb-1">참여자 관리</h2>
          <p className="text-sm text-[#7A8599]">노드를 추가하여 참여자를 등록하세요</p>
        </div>

        {/* 패널 컨텐츠 */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* 빠른 추가 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#B0B8C8] uppercase tracking-wider">빠른 추가</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addParticipant()}
                disabled={phase !== 'idle'}
                className="px-4 py-3 rounded-lg bg-[#1E2A4A] hover:bg-[#2A3A5A] border border-[#4A90D9]/30 text-[#00D4FF] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +1명 참여
              </button>
              <button
                onClick={() => addMultipleParticipants(10)}
                disabled={phase !== 'idle'}
                className="px-4 py-3 rounded-lg bg-[#1E2A4A] hover:bg-[#2A3A5A] border border-[#4A90D9]/30 text-[#00D4FF] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +10명 참여
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-[#1E2A4A]" />

          {/* 이름으로 추가 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#B0B8C8] uppercase tracking-wider">이름으로 추가</h3>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipantWithName()}
              placeholder="참여자 이름 입력..."
              disabled={phase !== 'idle'}
              className="w-full px-4 py-3 rounded-lg bg-[#141B33] border border-[#4A90D9]/30 text-white placeholder-[#7A8599] focus:outline-none focus:border-[#00D4FF] transition-all disabled:opacity-50"
            />
            <button
              onClick={addParticipantWithName}
              disabled={phase !== 'idle' || !customName.trim()}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#00FFCC] text-[#0B1026] font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이름으로 추가
            </button>
          </div>

          {/* 구분선 */}
          <div className="border-t border-[#1E2A4A]" />

          {/* 회전 제어 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#B0B8C8] uppercase tracking-wider">회전 제어</h3>
            <div className="space-y-2">
              {/* 배경 구체 회전 토글 */}
              <button
                onClick={() => setBgRotation(!bgRotation)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${bgRotation ? 'bg-[#1A3A5A] border border-[#00D4FF]/50 text-[#00D4FF]' : 'bg-[#1E2A4A] border border-[#4A90D9]/30 text-[#7A8599]'}`}
              >
                <span>🌐 배경 구체 회전</span>
                <span className={`text-xs px-2 py-1 rounded ${bgRotation ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#7A8599]/20 text-[#7A8599]'}`}>
                  {bgRotation ? 'ON' : 'OFF'}
                </span>
              </button>
              {/* 노드 회전 토글 */}
              <button
                onClick={() => setNodeRotation(!nodeRotation)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${nodeRotation ? 'bg-[#1A3A5A] border border-[#00D4FF]/50 text-[#00D4FF]' : 'bg-[#1E2A4A] border border-[#4A90D9]/30 text-[#7A8599]'}`}
              >
                <span>🔄 노드 회전</span>
                <span className={`text-xs px-2 py-1 rounded ${nodeRotation ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : 'bg-[#7A8599]/20 text-[#7A8599]'}`}>
                  {nodeRotation ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-[#1E2A4A]" />

          {/* 무작위 이름으로 추가 섹션 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#B0B8C8] uppercase tracking-wider">무작위 이름</h3>
            <p className="text-xs text-[#7A8599]">
              예: "열정적인 여우", "용감한 호랑이"
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const name = generateRandomName();
                  addParticipant(name);
                }}
                disabled={phase !== 'idle'}
                className="px-4 py-3 rounded-lg bg-[#2A1A4A] hover:bg-[#3A2A5A] border border-[#FF00FF]/30 text-[#FF66B2] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎲 +1명
              </button>
              <button
                onClick={() => addMultipleParticipants(10, true)}
                disabled={phase !== 'idle'}
                className="px-4 py-3 rounded-lg bg-[#2A1A4A] hover:bg-[#3A2A5A] border border-[#FF00FF]/30 text-[#FF66B2] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎲 +10명
              </button>
            </div>
          </div>
        </div>

        {/* 패널 푸터 */}
        <div className="p-6 border-t border-[#1E2A4A] space-y-3">
          {/* 현재 참여자 수 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7A8599]">총 참여자</span>
            <span className="text-[#00FFCC] font-bold text-lg">{participants.length}명</span>
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={clearAll}
            disabled={phase !== 'idle' || participants.length === 0}
            className="w-full px-4 py-2 rounded-lg border border-[#7A8599]/30 text-[#7A8599] hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            전체 초기화
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
