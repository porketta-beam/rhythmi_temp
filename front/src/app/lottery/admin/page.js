"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, Plus, Trash2, Play, RotateCcw, Check, 
  Settings, Users, Trophy, ChevronRight, X, ImagePlus
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../../../components/ui/button';

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
  const [newPrize, setNewPrize] = useState({ name: '', description: '', quantity: 1, image: '' });
  const [drawResults, setDrawResults] = useState([]);
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef(null);

  // 초기화 effect - 마운트 시 한 번만 실행
  useEffect(() => {
    const initData = () => {
      setPrizes(getInitialPrizes());
      setDrawResults(getInitialResults());
      setAssignedNumbers(getInitialNumbers());
      setIsInitialized(true);
    };
    initData();
  }, []);

  // 저장 effect - 초기화 후에만 실행
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('admin_prizes', JSON.stringify(prizes));
    }
  }, [prizes, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('admin_results', JSON.stringify(drawResults));
    }
  }, [drawResults, isInitialized]);

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
      drawn: 0,
    };
    
    setPrizes([...prizes, prize]);
    setNewPrize({ name: '', description: '', quantity: 1, image: '' });
    setImagePreview(null);
    setShowAddModal(false);
  };

  const deletePrize = (id) => {
    setPrizes(prizes.filter(p => p.id !== id));
    if (selectedPrize === id) setSelectedPrize(null);
  };

  const startDraw = () => {
    if (!selectedPrize) return;
    
    const prize = prizes.find(p => p.id === selectedPrize);
    if (!prize || prize.drawn >= prize.quantity) return;

    localStorage.setItem('current_draw', JSON.stringify({
      isDrawing: true,
      prizeId: prize.id,
      prizeName: prize.name,
      prizeImage: prize.image,
    }));

    window.open('/lottery', 'lottery', 'width=1920,height=1080');
  };

  const resetAll = () => {
    if (confirm('모든 추첨 결과와 할당된 번호를 초기화하시겠습니까?')) {
      setDrawResults([]);
      setAssignedNumbers([]);
      setPrizes(prizes.map(p => ({ ...p, drawn: 0 })));
      localStorage.removeItem('admin_results');
      localStorage.removeItem('assigned_numbers');
      localStorage.removeItem('current_draw');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewPrize({ name: '', description: '', quantity: 1, image: '' });
    setImagePreview(null);
  };

  const selectedPrizeData = prizes.find(p => p.id === selectedPrize);

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
            >
              <RotateCcw className="w-4 h-4 mr-2" />
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
                            <h3 className="font-semibold text-white">{prize.name}</h3>
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

              {selectedPrizeData ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
                    {selectedPrizeData.image && (
                      <div className="mb-4 flex justify-center">
                        <div className="w-24 h-24 rounded-xl overflow-hidden ring-2 ring-cyan-400">
                          <Image src={selectedPrizeData.image} alt={selectedPrizeData.name} width={96} height={96} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 mb-1">선택된 상품</p>
                    <p className="text-lg font-bold text-white">{selectedPrizeData.name}</p>
                    <p className="text-sm text-cyan-400 mt-2">남은 수량: {selectedPrizeData.quantity - selectedPrizeData.drawn}개</p>
                  </div>

                  <Button
                    onClick={startDraw}
                    disabled={selectedPrizeData.drawn >= selectedPrizeData.quantity}
                    className="w-full h-14 text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    추첨 시작하기
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>

                  {selectedPrizeData.drawn >= selectedPrizeData.quantity && (
                    <p className="text-center text-sm text-yellow-400">⚠️ 해당 상품의 추첨이 완료되었습니다.</p>
                  )}
                </div>
              ) : (
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
                <p className="text-4xl font-bold text-white mb-1">{assignedNumbers.length}</p>
                <p className="text-sm text-gray-400">명 참가</p>
              </div>
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

