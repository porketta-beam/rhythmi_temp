"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift } from "lucide-react";
import Image from "next/image";
import { SlotMachine } from "../../components/SlotMachine";
import { AnimatedBackground } from "../../components/AnimatedBackground";

export default function LotteryPage() {
  const [currentPrize, setCurrentPrize] = useState(null);
  const [currentPrizeImage, setCurrentPrizeImage] = useState(null);
  const [showPrizeAnnouncement, setShowPrizeAnnouncement] = useState(false);

  useEffect(() => {
    const checkCurrentDraw = () => {
      const drawData = localStorage.getItem('current_draw');
      if (drawData) {
        const draw = JSON.parse(drawData);
        if (draw.isDrawing && draw.prizeName) {
          setCurrentPrize(draw.prizeName);
          setCurrentPrizeImage(draw.prizeImage || null);
          setShowPrizeAnnouncement(true);
          
          setTimeout(() => {
            setShowPrizeAnnouncement(false);
          }, 3000);
        }
      }
    };

    checkCurrentDraw();
    
    const handleStorageChange = (e) => {
      if (e.key === 'current_draw') {
        checkCurrentDraw();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDrawComplete = (winningNumber) => {
    const numberStr = winningNumber.join('');
    const drawData = localStorage.getItem('current_draw');
    
    if (drawData) {
      const draw = JSON.parse(drawData);
      
      const results = JSON.parse(localStorage.getItem('admin_results') || '[]');
      results.push({
        prizeId: draw.prizeId,
        prizeName: draw.prizeName,
        prizeImage: draw.prizeImage,
        winningNumber: numberStr,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('admin_results', JSON.stringify(results));
      
      const prizes = JSON.parse(localStorage.getItem('admin_prizes') || '[]');
      const updatedPrizes = prizes.map((p) => 
        p.id === draw.prizeId ? { ...p, drawn: p.drawn + 1 } : p
      );
      localStorage.setItem('admin_prizes', JSON.stringify(updatedPrizes));
      
      localStorage.removeItem('current_draw');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#10062D] via-[#341f97] to-[#c9208a]">
      <AnimatedBackground />

      {/* Prize Announcement Overlay */}
      <AnimatePresence>
        {showPrizeAnnouncement && currentPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="text-center px-4"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: 3 }}
                className="mb-6"
              >
                {currentPrizeImage ? (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto rounded-2xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.5)]">
                    <Image
                      src={currentPrizeImage}
                      alt={currentPrize}
                      width={224}
                      height={224}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Gift className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 mx-auto" />
                )}
              </motion.div>
              <p className="text-gray-300 text-lg sm:text-xl mb-2">지금 추첨하는 상품은</p>
              <h2 
                className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4"
                style={{ fontFamily: 'Pretendard, sans-serif' }}
              >
                {currentPrize}
              </h2>
              <p className="text-gray-400 text-sm">잠시 후 추첨이 시작됩니다...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1
              className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2"
              style={{ fontFamily: "Pretendard, sans-serif", fontWeight: 700 }}
            >
              SFS 2025
            </h1>
            <p
              className="text-cyan-300 text-sm sm:text-base md:text-lg lg:text-xl"
              style={{ fontFamily: "Pretendard, sans-serif" }}
            >
              스마트 미래사회 컨퍼런스
            </p>
          </div>
          
          {currentPrize && !showPrizeAnnouncement && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
            >
              {currentPrizeImage ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-yellow-400/50">
                  <Image
                    src={currentPrizeImage}
                    alt={currentPrize}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Gift className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-yellow-400 font-medium text-sm sm:text-base">
                {currentPrize}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <SlotMachine 
          onBack={() => {}} 
          currentPrize={currentPrize}
          currentPrizeImage={currentPrizeImage}
          onDrawComplete={handleDrawComplete}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-2 sm:left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-2 sm:right-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-500/10 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}

