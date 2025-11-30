'use client';

import { useRef, useEffect } from 'react';

/**
 * RNNVisualization - AI 신경망 스타일 시각화
 *
 * @param {Array} participants - 참여자 목록 (Input Layer)
 * @param {number} activeLayer - 현재 활성 레이어 (-1 ~ 4)
 * @param {Object} winner - 당첨자
 * @param {string} phase - 현재 단계 (idle, processing, complete)
 */
export default function RNNVisualization({
  participants = [],
  activeLayer = -1,
  winner = null,
  phase = 'idle',
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 캔버스 리사이즈
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 레이어 정의 (노드 수)
    const layerConfig = [
      { count: Math.min(participants.length, 20), label: 'Input' },
      { count: 12, label: 'Hidden 1' },
      { count: 8, label: 'Hidden 2' },
      { count: 4, label: 'Hidden 3' },
      { count: 1, label: 'Output' },
    ];

    // 노드 위치 계산
    const getLayerNodes = (layerIndex, canvas) => {
      const config = layerConfig[layerIndex];
      const nodes = [];
      const layerX = 150 + (layerIndex * (canvas.width - 300) / 4);
      const totalHeight = canvas.height - 300;
      const spacing = totalHeight / (config.count + 1);

      for (let i = 0; i < config.count; i++) {
        nodes.push({
          x: layerX,
          y: 150 + spacing * (i + 1),
          radius: layerIndex === 4 ? 35 : 20,
          label: layerIndex === 0 && participants[i]
            ? participants[i].luckyNumber
            : layerIndex === 4 && winner
              ? winner.luckyNumber
              : '',
        });
      }

      return nodes;
    };

    // 애니메이션 루프
    const animate = (timestamp) => {
      timeRef.current = timestamp * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 모든 레이어의 노드 계산
      const allLayers = layerConfig.map((_, i) => getLayerNodes(i, canvas));

      // 연결선 그리기
      for (let l = 0; l < allLayers.length - 1; l++) {
        const fromLayer = allLayers[l];
        const toLayer = allLayers[l + 1];
        const isActive = activeLayer > l;
        const isCurrentlyProcessing = activeLayer === l;

        fromLayer.forEach((fromNode) => {
          toLayer.forEach((toNode) => {
            drawConnection(
              ctx,
              fromNode,
              toNode,
              isActive,
              isCurrentlyProcessing,
              timeRef.current
            );
          });
        });
      }

      // 노드 그리기
      allLayers.forEach((layer, layerIndex) => {
        const isLayerActive = activeLayer >= layerIndex;
        const isCurrentLayer = activeLayer === layerIndex;
        const isOutputLayer = layerIndex === 4;

        layer.forEach((node, nodeIndex) => {
          drawNode(
            ctx,
            node,
            isLayerActive,
            isCurrentLayer,
            isOutputLayer && phase === 'complete',
            timeRef.current + nodeIndex * 0.1
          );
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [participants, activeLayer, winner, phase]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ background: 'transparent' }}
    />
  );
}

/**
 * 연결선 그리기
 */
function drawConnection(ctx, from, to, isActive, isProcessing, time) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  if (isActive) {
    // 활성화된 연결선
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    gradient.addColorStop(0, 'rgba(0, 255, 204, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.4)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
  } else if (isProcessing) {
    // 처리 중인 연결선 (애니메이션)
    const pulse = Math.sin(time * 4) * 0.3 + 0.5;
    ctx.strokeStyle = `rgba(0, 212, 255, ${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -time * 20;
  } else {
    // 비활성 연결선
    ctx.strokeStyle = 'rgba(74, 144, 217, 0.15)';
    ctx.lineWidth = 1;
  }

  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * 노드 그리기
 */
function drawNode(ctx, node, isActive, isCurrent, isWinner, time) {
  const { x, y, radius, label } = node;

  // 글로우 효과
  if (isActive || isCurrent) {
    const glowRadius = radius + (isCurrent ? 15 : 10);
    const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius);

    if (isWinner) {
      const pulse = Math.sin(time * 3) * 0.2 + 0.8;
      gradient.addColorStop(0, `rgba(255, 0, 255, ${pulse})`);
      gradient.addColorStop(0.5, `rgba(255, 0, 255, ${pulse * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
    } else if (isCurrent) {
      const pulse = Math.sin(time * 5) * 0.3 + 0.7;
      gradient.addColorStop(0, `rgba(0, 212, 255, ${pulse})`);
      gradient.addColorStop(0.5, `rgba(0, 212, 255, ${pulse * 0.5})`);
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(0, 255, 204, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
    }

    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // 노드 원
  const nodeGradient = ctx.createRadialGradient(
    x - radius * 0.3, y - radius * 0.3, 0,
    x, y, radius
  );

  if (isWinner) {
    nodeGradient.addColorStop(0, '#FF66B2');
    nodeGradient.addColorStop(1, '#FF00FF');
  } else if (isActive) {
    nodeGradient.addColorStop(0, '#00FFCC');
    nodeGradient.addColorStop(1, '#00D4FF');
  } else {
    nodeGradient.addColorStop(0, '#4A90D9');
    nodeGradient.addColorStop(1, '#1E2A4A');
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = nodeGradient;
  ctx.fill();

  // 테두리
  ctx.strokeStyle = isWinner ? '#FF00FF' : isActive ? '#00D4FF' : '#4A90D9';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 라벨 (번호)
  if (label) {
    ctx.fillStyle = isWinner ? '#FFFFFF' : isActive ? '#0B1026' : '#FFFFFF';
    ctx.font = `bold ${isWinner ? '18' : '12'}px Montserrat, Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  }
}
