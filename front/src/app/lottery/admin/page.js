"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gift, Plus, Trash2, Play, RotateCcw, Check,
  Settings, Users, Trophy, ChevronRight, X, ImagePlus, Loader2, Pause
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';
import { luckydrawAPI } from '../../../lib/api/luckydraw';
import { DEFAULT_EVENT_ID, DRAW_MODES, getDrawModeConfig } from '../../../lib/lottery/constants';
import { padNumber } from '../../../lib/lottery/utils';
import { API_BASE } from '../../../lib/apiConfig';

// localStorage에서 초기값 로드하는 함수 (컴포넌트 외부)
const getInitialPrizes = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('admin_prizes');
  return stored ? JSON.parse(stored) : [];
};

const getInitialResults = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('admin_results');
  return stored ? JSON.parse(stored) : [];
};

const getInitialNumbers = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('assigned_numbers');
  return stored ? JSON.parse(stored) : [];
};

export default function AdminPage() {
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPrize, setNewPrize] = useState({
    name: '',
    description: '',
    quantity: 1,
    image: '',
    drawMode: 'slot',
    winnerCount: 1,
  });
  const [drawResults, setDrawResults] = useState([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [winnersInfo, setWinnersInfo] = useState([]);  // 당첨자 개인정보
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false); // 슬롯 회전 중
  const [isWaitingReveal, setIsWaitingReveal] = useState(false); // 결과 발표 대기 중
  const [isStandby, setIsStandby] = useState(false); // 추첨 대기 상태
  const [standbyPrizeId, setStandbyPrizeId] = useState(null); // 대기 중인 상품 ID
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef(null);

  // WebSocket 연결 ref
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // 클로저 문제 해결: standbyPrizeId의 최신 값을 ref로 유지
  // WebSocket 핸들러에서 항상 최신 값을 참조할 수 있도록 함
  const standbyPrizeIdRef = useRef(null);

  // standbyPrizeId 상태 변경 시 ref 동기화
  useEffect(() => {
    standbyPrizeIdRef.current = standbyPrizeId;
  }, [standbyPrizeId]);

  // 참가자 수, 추첨 이력, 당첨자 정보 조회
  const fetchData = useCallback(async () => {
    try {
      const [participantsRes, historyRes, winnersRes] = await Promise.all([
        luckydrawAPI.getParticipants(DEFAULT_EVENT_ID),
        luckydrawAPI.getDrawHistory(DEFAULT_EVENT_ID),
        luckydrawAPI.getWinners(DEFAULT_EVENT_ID),
      ]);

      setParticipantCount(participantsRes.totalCount);
      setDrawResults(historyRes.draws.map(d => ({
        prizeName: d.prizeName,
        prizeRank: d.prizeRank,
        winningNumber: padNumber(d.drawNumber),
        timestamp: d.drawnAt,
      })));
      setWinnersInfo(winnersRes.winners);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    }
  }, []);

  // WebSocket 연결 및 메시지 처리
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // API_BASE에서 WebSocket URL 생성 (http → ws, https → wss)
    const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
    const baseWithoutProtocol = API_BASE.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${baseWithoutProtocol}/api/luckydraw/ws/${DEFAULT_EVENT_ID}?client_type=admin`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[Admin WS] 연결됨');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Admin WS] 수신:', data);

        if (data.type === 'winner_announced') {
          // main 애니메이션 완료 후 서버가 보낸 당첨 결과
          const { prize_name, prize_rank, winners, drawn_at, prize_image } = data;

          // 결과 추가
          setDrawResults(prev => [...prev, {
            prizeName: prize_name,
            prizeRank: prize_rank,
            prizeImage: prize_image,
            winningNumber: padNumber(winners[0]),
            timestamp: drawn_at,
          }]);

          // 상품 추첨 횟수 업데이트
          // ⚠️ standbyPrizeIdRef.current 사용 (클로저 문제 해결)
          const currentPrizeId = standbyPrizeIdRef.current;
          console.log('[Admin WS] winner_announced - currentPrizeId:', currentPrizeId);

          setPrizes(prev => prev.map(p => {
            if (p.id === currentPrizeId) {
              return { ...p, drawn: p.drawn + 1 };
            }
            return p;
          }));

          // 상태 초기화
          setIsDrawing(false);
          setIsWaitingReveal(false);
          setIsStandby(false);
          setStandbyPrizeId(null);
        }

        // 당첨자 개인정보 수신
        if (data.type === 'winner_info_received') {
          const { draw_number, prize_name, name, phone, submitted_at } = data;
          console.log('[Admin WS] 당첨자 정보 수신:', name, phone);

          // 중복 체크 후 추가
          setWinnersInfo(prev => {
            const exists = prev.some(
              w => w.drawNumber === draw_number && w.prizeName === prize_name
            );
            if (exists) return prev;

            return [...prev, {
              drawNumber: draw_number,
              prizeName: prize_name,
              name,
              phone,
              submittedAt: submitted_at,
            }];
          });
        }
      } catch (error) {
        console.error('[Admin WS] 메시지 파싱 에러:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('[Admin WS] 연결 종료, 3초 후 재연결...');
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('[Admin WS] 에러:', error);
    };
  }, []); // dependency 제거: standbyPrizeIdRef를 사용하므로 재연결 불필요

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    // localStorage에서 상품 목록 로드 (상품은 로컬에서 관리)
    const storedPrizes = localStorage.getItem('admin_prizes');
    if (storedPrizes) setPrizes(JSON.parse(storedPrizes));
    setIsInitialized(true);

    // 서버에서 데이터 로드
    fetchData();

    // WebSocket 연결
    connectWebSocket();

    // 5초마다 데이터 갱신
    const interval = setInterval(fetchData, 5000);
    return () => {
      clearInterval(interval);
      // WebSocket 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchData, connectWebSocket]);

  // 상품 목록 로컬 저장 (초기화 후에만)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('admin_prizes', JSON.stringify(prizes));
    }
  }, [prizes, isInitialized]);


  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('이미지 크기는 2MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setImagePreview(base64);
      setNewPrize({ ...newPrize, image: base64 });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setNewPrize({ ...newPrize, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addPrize = () => {
    if (!newPrize.name.trim()) return;

    const prize = {
      id: Date.now().toString(),
      name: newPrize.name,
      description: newPrize.description,
      image: newPrize.image,
      quantity: newPrize.quantity,
      drawMode: newPrize.drawMode,
      winnerCount: newPrize.winnerCount,
      drawn: 0,
    };

    setPrizes([...prizes, prize]);
    setNewPrize({ name: '', description: '', quantity: 1, image: '', drawMode: 'slot', winnerCount: 1 });
    setImagePreview(null);
    setShowAddModal(false);
  };

  const deletePrize = (id) => {
    setPrizes(prizes.filter(p => p.id !== id));
    if (selectedPrize === id) setSelectedPrize(null);
  };

  // 추첨 대기 시작 (상품 정보 브로드캐스트)
  const startStandby = async () => {
    if (!selectedPrize || isStandby || isDrawing) return;

    const prize = prizes.find(p => p.id === selectedPrize);
    if (!prize || prize.drawn >= prize.quantity) return;

    try {
      // 대기 이벤트 브로드캐스트 (모든 페이지에 상품 정보 전달)
      await luckydrawAPI.standby(
        DEFAULT_EVENT_ID,
        prize.name,
        prize.drawn + 1,
        prize.image || null,
        prize.drawMode || 'slot',
        prize.winnerCount || 1
      );

      setIsStandby(true);
      setStandbyPrizeId(prize.id);
    } catch (error) {
      console.error('추첨 대기 시작 실패:', error);
      alert(error.message || '추첨 대기 시작에 실패했습니다.');
    }
  };

  // 추첨 대기 취소
  const cancelStandby = () => {
    setIsStandby(false);
    setStandbyPrizeId(null);
  };

  // 추첨 시작 (대기 상태에서 호출)
  // - 서버에서 실제 추첨 실행 + 결과를 pending에 저장
  // - 모든 클라이언트에 draw_started 브로드캐스트 (슬롯 회전 시작)
  const startDraw = async () => {
    if (!standbyPrizeId || isDrawing) return;

    const prize = prizes.find(p => p.id === standbyPrizeId);
    if (!prize || prize.drawn >= prize.quantity) return;

    setIsDrawing(true);

    try {
      // 서버에 추첨 시작 요청
      // - 서버가 실제 추첨을 실행하고 결과를 pending에 저장
      // - 모든 클라이언트에 draw_started 브로드캐스트
      await luckydrawAPI.startDrawAnimation(
        DEFAULT_EVENT_ID,
        prize.name,
        prize.drawn + 1,
        prize.image || null,
        prize.drawMode || 'slot',
        prize.winnerCount || 1
      );

      // 결과 발표 대기 상태로 전환
      setIsWaitingReveal(true);

    } catch (error) {
      console.error('추첨 시작 실패:', error);
      alert(error.message || '추첨 시작에 실패했습니다.');
      setIsDrawing(false);
    }
  };

  // 결과 발표 (main 페이지에 당첨번호 전송)
  // - main에서 슬롯 정지 애니메이션 후 draw_complete 전송
  // - 서버가 winner_announced를 waiting/admin에 브로드캐스트
  const revealWinner = async () => {
    if (!isDrawing || !isWaitingReveal) return;

    try {
      // 서버에 결과 발표 요청
      // - main 페이지에 winner_revealed 이벤트 전송
      await luckydrawAPI.reveal(DEFAULT_EVENT_ID);

      // 발표 버튼 비활성화 (main 완료 대기)
      setIsWaitingReveal(false);

    } catch (error) {
      console.error('결과 발표 실패:', error);
      alert(error.message || '결과 발표에 실패했습니다.');
    }
  };

  const resetAll = async () => {
    if (!confirm('모든 추첨 결과와 참가자를 초기화하시겠습니까?')) return;

    setIsLoading(true);

    try {
      // 서버 리셋 (참가자 + 추첨 이력)
      await luckydrawAPI.reset(DEFAULT_EVENT_ID, true, true);

      // 로컬 상태 리셋
      setDrawResults([]);
      setParticipantCount(0);
      setPrizes(prizes.map(p => ({ ...p, drawn: 0 })));

      alert('초기화가 완료되었습니다.');
    } catch (error) {
      console.error('리셋 실패:', error);
      alert(error.message || '초기화에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewPrize({ name: '', description: '', quantity: 1, image: '', drawMode: 'slot', winnerCount: 1 });
    setImagePreview(null);
  };

  const selectedPrizeData = prizes.find(p => p.id === selectedPrize);

  // 현재 추첨 중인 상품 데이터
  const drawingPrizeData = standbyPrizeId ? prizes.find(p => p.id === standbyPrizeId) : null;

  // 선택된 상품의 당첨 번호 목록 조회
  const getWinningNumbersForPrize = (prizeName) => {
    return drawResults
      .filter(r => r.prizeName === prizeName)
      .map(r => r.winningNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Pretendard, sans-serif' }}>
                  추첨 관리자
                </h1>
                <p className="text-sm text-gray-400">SFS 2025 추첨 관리</p>
              </div>
            </div>
            <Button
              onClick={resetAll}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              전체 리셋
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 상품 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-cyan-400" />
                  상품 목록
                </h2>
                <Button onClick={() => setShowAddModal(true)} className="bg-cyan-500 hover:bg-cyan-400">
                  <Plus className="w-4 h-4 mr-2" />
                  상품 추가
                </Button>
              </div>

              {prizes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>등록된 상품이 없습니다.</p>
                  <p className="text-sm">상품을 추가해주세요.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prizes.map((prize) => (
                    <motion.div
                      key={prize.id}
                      layout
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPrize === prize.id
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-gray-700/50 bg-gray-900/50 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPrize(prize.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${
                            selectedPrize === prize.id ? 'ring-2 ring-cyan-400' : ''
                          } ${!prize.image ? (selectedPrize === prize.id ? 'bg-cyan-500' : 'bg-gray-700') : ''}`}>
                            {prize.image ? (
                              <Image src={prize.image} alt={prize.name} width={64} height={64} className="w-full h-full object-cover" />
                            ) : selectedPrize === prize.id ? (
                              <Check className="w-6 h-6 text-white" />
                            ) : (
                              <Gift className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">{prize.name}</h3>
                              {/* 모드 배지 */}
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                prize.drawMode === 'card'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : prize.drawMode === 'network'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-cyan-500/20 text-cyan-400'
                              }`}>
                                {getDrawModeConfig(prize.drawMode || 'slot').name}
                                {(prize.winnerCount || 1) > 1 && ` ×${prize.winnerCount}`}
                              </span>
                            </div>
                            {prize.description && <p className="text-sm text-gray-400">{prize.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">추첨 현황</p>
                            <p className="font-bold text-white">
                              <span className={prize.drawn >= prize.quantity ? 'text-green-400' : 'text-cyan-400'}>{prize.drawn}</span>
                              <span className="text-gray-500"> / {prize.quantity}</span>
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deletePrize(prize.id); }}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 추첨 컨트롤 & 결과 */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Play className="w-5 h-5 text-cyan-400" />
                추첨 컨트롤
              </h2>

              {/* 추첨 중인 상품이 있을 때 (다른 상품 선택 시에도 표시) */}
              {(isDrawing || isStandby) && drawingPrizeData && (
                <div className="space-y-4 mb-4">
                  {isDrawing ? (
                    // 추첨 진행 중
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                        {drawingPrizeData.image && (
                          <div className="mb-4 flex justify-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-green-400 animate-pulse">
                              <Image src={drawingPrizeData.image} alt={drawingPrizeData.name} width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-green-400 mb-1">🎰 추첨 진행 중</p>
                        <p className="text-lg font-bold text-white">{drawingPrizeData.name}</p>
                        <p className="text-sm text-green-400/70 mt-2">
                          {isWaitingReveal ? '슬롯이 회전 중입니다' : '결과 발표 중...'}
                        </p>
                      </div>

                      {selectedPrize === standbyPrizeId && (
                        <>
                          {isWaitingReveal ? (
                            <Button
                              onClick={revealWinner}
                              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500"
                            >
                              <Trophy className="w-5 h-5 mr-2" />
                              결과 발표
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              disabled
                              className="w-full h-14 text-lg bg-gray-700 cursor-not-allowed"
                            >
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              애니메이션 진행 중...
                            </Button>
                          )}
                          <p className="text-center text-xs text-gray-500">
                            {isWaitingReveal
                              ? '버튼을 누르면 당첨번호가 공개됩니다'
                              : 'main 화면 애니메이션 완료 대기 중'}
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    // 대기 중
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                        {drawingPrizeData.image && (
                          <div className="mb-4 flex justify-center">
                            <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-yellow-400">
                              <Image src={drawingPrizeData.image} alt={drawingPrizeData.name} width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-yellow-400 mb-1">🎯 추첨 대기 중</p>
                        <p className="text-lg font-bold text-white">{drawingPrizeData.name}</p>
                        <p className="text-sm text-yellow-400/70 mt-2">모든 화면에 상품이 표시되었습니다</p>
                      </div>

                      {selectedPrize === standbyPrizeId && (
                        <>
                          <Button
                            onClick={startDraw}
                            className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
                          >
                            <Play className="w-5 h-5 mr-2" fill="currentColor" />
                            추첨 시작하기
                            <ChevronRight className="w-5 h-5 ml-2" />
                          </Button>

                          <Button
                            onClick={cancelStandby}
                            variant="outline"
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            대기 취소
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {/* 추첨 중인 상품의 당첨 번호 표시 */}
                  {selectedPrize === standbyPrizeId && (() => {
                    const winningNumbers = getWinningNumbersForPrize(drawingPrizeData.name);
                    return winningNumbers.length > 0 && (
                      <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-700/50">
                        <p className="text-xs text-gray-400 mb-2">🎉 이전 당첨 번호</p>
                        <div className="flex flex-wrap gap-2">
                          {winningNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 다른 상품 선택 중일 때 안내 */}
                  {selectedPrize && selectedPrize !== standbyPrizeId && (
                    <p className="text-center text-xs text-yellow-400">
                      ⚠️ 현재 다른 상품이 {isDrawing ? '추첨 중' : '대기 중'}입니다
                    </p>
                  )}
                </div>
              )}

              {/* 선택된 상품 정보 (추첨 중이 아니거나, 다른 상품 선택 시) */}
              {selectedPrizeData && selectedPrize !== standbyPrizeId && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
                    {selectedPrizeData.image && (
                      <div className="mb-4 flex justify-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden ring-2 ring-cyan-400">
                          <Image src={selectedPrizeData.image} alt={selectedPrizeData.name} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 mb-1">선택된 상품</p>
                    <p className="text-lg font-bold text-white">{selectedPrizeData.name}</p>
                    <p className="text-sm text-cyan-400 mt-2">남은 수량: {selectedPrizeData.quantity - selectedPrizeData.drawn}개</p>
                  </div>

                  {/* 당첨 번호 표시 */}
                  {(() => {
                    const winningNumbers = getWinningNumbersForPrize(selectedPrizeData.name);
                    return winningNumbers.length > 0 && (
                      <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-700/50">
                        <p className="text-xs text-gray-400 mb-2">🎉 당첨 번호</p>
                        <div className="flex flex-wrap gap-2">
                          {winningNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 추첨 대기 버튼 (다른 상품이 추첨 중이 아닐 때만) */}
                  {!isDrawing && !isStandby && (
                    <>
                      <Button
                        onClick={startStandby}
                        disabled={selectedPrizeData.drawn >= selectedPrizeData.quantity}
                        className="w-full h-14 text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        추첨 대기
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>

                      <p className="text-center text-xs text-gray-500">
                        버튼을 누르면 모든 화면에 상품 정보가 표시됩니다
                      </p>

                      {selectedPrizeData.drawn >= selectedPrizeData.quantity && (
                        <p className="text-center text-sm text-yellow-400">⚠️ 해당 상품의 추첨이 완료되었습니다.</p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* 상품 미선택 */}
              {!selectedPrize && !isDrawing && !isStandby && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>추첨할 상품을 선택해주세요</p>
                </div>
              )}
            </div>

            {/* 최근 당첨 결과 */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                최근 당첨 결과
              </h2>

              {drawResults.length === 0 ? (
                <p className="text-center py-6 text-gray-500 text-sm">아직 추첨 결과가 없습니다.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...drawResults].reverse().slice(0, 10).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                      <div className="flex items-center gap-3">
                        {result.prizeImage && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden">
                            <Image src={result.prizeImage} alt={result.prizeName} width={40} height={40} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{result.prizeName}</p>
                          <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">{result.winningNumber}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 참가자 현황 */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-400" />
                참가자 현황
              </h2>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-white mb-1">{participantCount}</p>
                <p className="text-sm text-gray-400">명 참가</p>
              </div>
            </div>

            {/* 당첨자 정보 */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-pink-400" />
                당첨자 정보
                {winnersInfo.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-400">
                    {winnersInfo.length}명
                  </span>
                )}
              </h2>

              {winnersInfo.length === 0 ? (
                <p className="text-center py-6 text-gray-500 text-sm">
                  아직 당첨자 정보가 없습니다.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...winnersInfo].reverse().map((winner, index) => (
                    <div
                      key={`${winner.drawNumber}-${winner.prizeName}-${index}`}
                      className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{winner.name}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                          {padNumber(winner.drawNumber)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{winner.phone}</span>
                        <span className="text-gray-500">{winner.prizeName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 상품 추가 모달 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">상품 추가</h3>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">상품 이미지 (선택)</label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-900">
                          <Image src={imagePreview} alt="미리보기" width={400} height={160} className="w-full h-full object-contain" />
                        </div>
                        <button onClick={removeImage} className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-600 bg-gray-900/50 cursor-pointer hover:border-cyan-500/50 hover:bg-gray-900 transition-all">
                        <ImagePlus className="w-10 h-10 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-400">클릭하여 이미지 업로드</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (최대 2MB)</span>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">상품명 *</label>
                  <input
                    type="text"
                    value={newPrize.name}
                    onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                    placeholder="예: 에어팟 프로"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">설명 (선택)</label>
                  <input
                    type="text"
                    value={newPrize.description}
                    onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                    placeholder="예: 1등 상품"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">수량</label>
                  <input
                    type="number"
                    min="1"
                    value={newPrize.quantity}
                    onChange={(e) => setNewPrize({ ...newPrize, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* 추첨 모드 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">추첨 모드</label>
                  <div className="space-y-2">
                    {Object.values(DRAW_MODES).map((mode) => (
                      <label
                        key={mode.id}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          newPrize.drawMode === mode.id
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="drawMode"
                          value={mode.id}
                          checked={newPrize.drawMode === mode.id}
                          onChange={(e) => {
                            const modeConfig = getDrawModeConfig(e.target.value);
                            setNewPrize({
                              ...newPrize,
                              drawMode: e.target.value,
                              winnerCount: modeConfig.defaultWinners,
                            });
                          }}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white">{mode.name}</p>
                          <p className="text-xs text-gray-400">{mode.description}</p>
                        </div>
                        {newPrize.drawMode === mode.id && (
                          <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 당첨자 수 (슬롯 모드가 아닐 때만) */}
                {newPrize.drawMode !== 'slot' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      회차당 당첨자 수
                      <span className="text-gray-500 ml-2">
                        ({getDrawModeConfig(newPrize.drawMode).minWinners}-{getDrawModeConfig(newPrize.drawMode).maxWinners}명)
                      </span>
                    </label>
                    <input
                      type="number"
                      min={getDrawModeConfig(newPrize.drawMode).minWinners}
                      max={getDrawModeConfig(newPrize.drawMode).maxWinners}
                      value={newPrize.winnerCount}
                      onChange={(e) => {
                        const modeConfig = getDrawModeConfig(newPrize.drawMode);
                        const value = Math.min(
                          Math.max(parseInt(e.target.value) || 1, modeConfig.minWinners),
                          modeConfig.maxWinners
                        );
                        setNewPrize({ ...newPrize, winnerCount: value });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      한 번의 추첨에서 {newPrize.winnerCount}명의 당첨자가 선정됩니다
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button onClick={closeModal} variant="outline" className="flex-1 border-gray-600 text-gray-300">취소</Button>
                  <Button onClick={addPrize} disabled={!newPrize.name.trim()} className="flex-1 bg-cyan-500 hover:bg-cyan-400">추가하기</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

