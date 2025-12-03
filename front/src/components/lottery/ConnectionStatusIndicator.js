"use client";

import { memo } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * WebSocket 연결 상태 표시 컴포넌트
 *
 * @param {'connecting' | 'connected' | 'disconnected' | 'error'} status - 연결 상태
 */
export const ConnectionStatusIndicator = memo(function ConnectionStatusIndicator({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'connecting':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return '연결됨';
      case 'connecting':
        return '연결 중...';
      default:
        return '연결 끊김';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${getStatusStyles()}`}>
        {status === 'connected' ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
});
