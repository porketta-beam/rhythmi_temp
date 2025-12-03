"use client";

import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift } from 'lucide-react';
import Image from 'next/image';

/**
 * 상품 안내 오버레이 컴포넌트
 * 추첨 대기/시작 시 표시되는 전체 화면 오버레이
 *
 * @param {boolean} show - 오버레이 표시 여부
 * @param {string} prizeName - 상품명
 * @param {string|null} prizeImage - 상품 이미지 URL (선택)
 * @param {boolean} isStandby - 대기 상태 여부 (true: 대기 중, false: 추첨 시작)
 */
export const PrizeAnnouncementOverlay = memo(function PrizeAnnouncementOverlay({
  show,
  prizeName,
  prizeImage,
  isStandby = false,
}) {
  return (
    <AnimatePresence>
      {show && prizeName && (
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
              {prizeImage ? (
                <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto rounded-2xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.5)]">
                  <Image
                    src={prizeImage}
                    alt={prizeName}
                    width={224}
                    height={224}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Gift className="w-24 h-24 sm:w-32 sm:h-32 text-yellow-400 mx-auto" />
              )}
            </motion.div>
            <p className="text-gray-300 text-lg sm:text-xl mb-2">
              {isStandby ? '다음 추첨 상품은' : '지금 추첨하는 상품은'}
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-4"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              {prizeName}
            </h2>
            <p className="text-gray-400 text-sm">
              {isStandby ? '추첨 대기 중...' : '잠시 후 추첨이 시작됩니다...'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
