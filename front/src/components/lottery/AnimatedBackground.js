"use client";

import { memo } from 'react';
import { motion } from 'motion/react';

// 컴포넌트 외부에서 미리 생성 (순수성 유지)
const generateParticles = () => Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 3.33) % 100,  // 고정된 패턴 사용
  y: (i * 7.77) % 100,
  duration: 10 + (i % 10) * 2,
}));

const particles = generateParticles();

// React.memo로 감싸서 부모 리렌더링 시에도 다시 렌더링되지 않음
export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: '0 0 10px 2px rgba(0, 255, 255, 0.5)',
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Scan Lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)',
          backgroundSize: '100% 4px',
        }}
        animate={{
          y: [0, 8],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
});
