"use client";

import { motion } from 'motion/react';
import { useMemo } from 'react';

const PARTICLE_COUNT = 25;
const RIBBON_COUNT = 15;
const EMOJI_COUNT = 10;

export function CelebrationEffect() {
  const particles = useMemo(() => {
    const colors = ['text-cyan-400', 'text-purple-400', 'text-pink-400', 'text-yellow-400'];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      moveX: (Math.random() - 0.5) * 300,
      moveY: (Math.random() - 0.5) * 300,
      color: colors[i % colors.length],
    }));
  }, []);

  const ribbons = useMemo(() => {
    return Array.from({ length: RIBBON_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      rotation: Math.random() * 720 - 360,
      moveX: (Math.random() - 0.5) * 150,
      duration: 2 + Math.random() * 1.5,
      delay: Math.random() * 0.3,
      gradient: Math.random() * 360,
    }));
  }, []);

  const emojis = useMemo(() => {
    const emojiList = ['✨', '⭐', '💫', '🎉', '🎊'];
    return Array.from({ length: EMOJI_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      emoji: emojiList[i % emojiList.length],
      delay: Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden will-change-transform">
      {/* Flash Effect */}
      <motion.div
        className="absolute inset-0 bg-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.3 }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute w-3 h-3 rounded-full ${particle.color.replace('text-', 'bg-')} will-change-transform`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, particle.scale, 0],
            opacity: [0, 1, 0],
            x: particle.moveX,
            y: particle.moveY,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Confetti Ribbons */}
      {ribbons.map((ribbon) => (
        <motion.div
          key={`ribbon-${ribbon.id}`}
          className="absolute w-2 h-8 rounded-full will-change-transform"
          style={{
            left: `${ribbon.left}%`,
            top: -50,
            backgroundImage: `linear-gradient(${ribbon.gradient}deg, #00ffff, #a855f7, #ec4899)`,
          }}
          initial={{ y: -50, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: ribbon.rotation,
            x: ribbon.moveX,
          }}
          transition={{
            duration: ribbon.duration,
            ease: 'easeIn',
            delay: ribbon.delay,
          }}
        />
      ))}

      {/* Emojis */}
      {emojis.map((item) => (
        <motion.div
          key={`emoji-${item.id}`}
          className="absolute text-2xl will-change-transform"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            y: -80,
          }}
          transition={{
            duration: 1.5,
            delay: item.delay,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Single Wave */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="border-4 border-cyan-400 rounded-full will-change-transform"
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: 800,
            height: 800,
            opacity: 0,
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
          }}
        />
      </motion.div>
    </div>
  );
}

