'use client';

import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

/**
 * NetworkGraph3D - Force-directed 3D 네트워크 시각화
 *
 * - 노드 간 자연스러운 반발력
 * - 새 노드 추가 시 기존 네트워크 유지
 * - 위도/경도 스타일 배경 구체
 */
export default function NetworkGraph3D({
  participants = [],
  phase = 'idle',
  winnerIds = [], // 다중 당첨자 지원
  bgRotation = true, // 배경 구체 회전 여부
  nodeRotation = false, // 노드 회전 여부 (카메라 공전)
}) {
  const fgRef = useRef();
  const containerRef = useRef();
  const sphereGroupRef = useRef(null); // 배경 구체 참조 (회전 상태 유지)
  const graphGroupRef = useRef(null); // 그래프(노드+링크) 그룹 참조
  const animationIdRef = useRef(null); // 애니메이션 ID (중복 방지)
  const bgRotationRef = useRef(bgRotation); // 배경 회전 상태 ref
  const nodeRotationRef = useRef(nodeRotation); // 노드 회전 상태 ref

  // 그래프 데이터 생성 (노드 + 링크)
  const graphData = useMemo(() => {
    if (participants.length === 0) {
      return { nodes: [], links: [] };
    }

    // winnerIds를 Set으로 변환하여 빠른 조회
    const winnerIdSet = new Set(winnerIds);

    // 노드 생성
    const nodes = participants.map((p) => ({
      id: p.id,
      luckyNumber: p.luckyNumber,
      name: p.name || null,
      isWinner: winnerIdSet.has(p.id),
    }));

    // 링크 생성 (인접 2개 + 결정적 추가 연결)
    const links = [];
    const maxAdjacentLinks = 2; // 인접 노드 연결 수

    // 결정적 pseudo-random 함수 (노드 인덱스 기반)
    const pseudoRandom = (seed) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };

    nodes.forEach((node, i) => {
      // 1. 인접 노드 연결 (이전 2개 노드와 연결)
      for (let j = 1; j <= maxAdjacentLinks; j++) {
        const targetIndex = i - j;
        if (targetIndex >= 0) {
          links.push({
            source: node.id,
            target: nodes[targetIndex].id,
          });
        }
      }

      // 2. 추가 연결 (1~2개, 노드가 5개 이상일 때)
      if (nodes.length > 5 && i > maxAdjacentLinks) {
        const extraLinks = pseudoRandom(i) < 0.5 ? 1 : 2;
        const usedIndices = new Set();

        for (let k = 0; k < extraLinks; k++) {
          // 인접 노드가 아닌 노드 선택 (결정적)
          const pool = i - maxAdjacentLinks;
          const targetIndex = Math.floor(pseudoRandom(i * 100 + k) * pool);

          if (!usedIndices.has(targetIndex)) {
            usedIndices.add(targetIndex);
            links.push({
              source: node.id,
              target: nodes[targetIndex].id,
            });
          }
        }
      }
    });

    return { nodes, links };
  }, [participants, winnerIds]);

  // 배경 구체 생성 (1회만)
  useEffect(() => {
    if (!fgRef.current) return;

    const fg = fgRef.current;
    const scene = fg.scene();

    // 카메라 초기 위치
    fg.cameraPosition({ x: 0, y: 0, z: 300 });

    // 이미 생성된 경우 스킵
    if (sphereGroupRef.current) return;

    // 위도/경도 스타일 와이어프레임 구체
    const sphereGroup = new THREE.Group();
    sphereGroup.name = 'backgroundSphere';

    // 위도선 (가로)
    for (let i = 0; i < 12; i++) {
      const phi = (i / 12) * Math.PI;
      const radius = Math.sin(phi) * 150;
      const y = Math.cos(phi) * 150;

      const geometry = new THREE.RingGeometry(radius - 0.3, radius + 0.3, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      sphereGroup.add(ring);
    }

    // 경도선 (세로)
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI;
      const geometry = new THREE.TorusGeometry(150, 0.3, 8, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x4A90D9,
        transparent: true,
        opacity: 0.15,
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.rotation.y = theta;
      sphereGroup.add(torus);
    }

    // 외곽 구체 (희미한 와이어프레임)
    const outerGeometry = new THREE.SphereGeometry(150, 32, 32);
    const outerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00D4FF,
      transparent: true,
      opacity: 0.03,
      wireframe: true,
    });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    sphereGroup.add(outerSphere);

    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;
  }, []);

  // rotation prop 변경 시 ref 업데이트
  useEffect(() => {
    bgRotationRef.current = bgRotation;
  }, [bgRotation]);

  useEffect(() => {
    nodeRotationRef.current = nodeRotation;
  }, [nodeRotation]);

  // 그래프 그룹 캡처 (ForceGraph3D가 생성한 노드/링크를 감싸는 그룹)
  useEffect(() => {
    if (!fgRef.current) return;

    const scene = fgRef.current.scene();

    // ForceGraph3D의 그래프 객체 찾기 (backgroundSphere가 아닌 것)
    const findGraphGroup = () => {
      for (const child of scene.children) {
        if (child.name !== 'backgroundSphere' && child.type === 'Group') {
          graphGroupRef.current = child;
          return true;
        }
      }
      return false;
    };

    // 그래프가 로드될 때까지 대기
    const checkForGraph = () => {
      if (!findGraphGroup()) {
        setTimeout(checkForGraph, 100);
      }
    };
    checkForGraph();
  }, []);

  // 회전 애니메이션 (배경 구체 + 노드 그룹)
  useEffect(() => {
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      // 배경 구체 회전 (Y축 - 극점 고정, 지구본처럼)
      if (sphereGroupRef.current && bgRotationRef.current) {
        sphereGroupRef.current.rotation.y += 0.001;
      }

      // 노드 그룹 회전 (그래프 자체를 회전)
      if (graphGroupRef.current && nodeRotationRef.current) {
        graphGroupRef.current.rotation.y += 0.002;
        graphGroupRef.current.rotation.x += 0.0005;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    // 초기화 후 애니메이션 시작
    const startAnimation = () => {
      if (sphereGroupRef.current || graphGroupRef.current) {
        animate();
      } else {
        setTimeout(startAnimation, 100);
      }
    };
    startAnimation();

    // 클린업
    return () => {
      isRunning = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // 새 노드 추가 시 카메라 자동 조정
  useEffect(() => {
    if (fgRef.current && participants.length > 0) {
      const timer = setTimeout(() => {
        // 전체 씬이 보이도록 줌 (노드 수에 따라 조절)
        const distance = Math.max(250, 200 + participants.length * 1.5);
        fgRef.current.cameraPosition(
          { x: 0, y: 0, z: distance },
          { x: 0, y: 0, z: 0 },
          800
        );
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [participants.length]);

  // 당첨자 선정 시 카메라 포커스 (첫 번째 당첨자 기준)
  useEffect(() => {
    if (fgRef.current && winnerIds.length > 0) {
      const winnerNode = graphData.nodes.find((n) => n.id === winnerIds[0]);
      if (winnerNode && winnerNode.x !== undefined) {
        fgRef.current.cameraPosition(
          { x: winnerNode.x * 0.5, y: winnerNode.y * 0.5, z: 180 },
          { x: winnerNode.x, y: winnerNode.y, z: winnerNode.z },
          1500
        );
      }
    }
  }, [winnerIds, graphData.nodes]);

  // 노드 3D 오브젝트 생성 (빛 반사 없는 플랫 스타일)
  const nodeThreeObject = useCallback((node) => {
    const group = new THREE.Group();

    // 노드 색상 결정
    const getColor = () => {
      if (node.isWinner) return 0xFF00FF;
      if (phase === 'searching') return 0x00D4FF;
      return 0x4A90D9;
    };

    // 노드 구체 (MeshBasicMaterial - 빛 반사 없음)
    const sphereGeometry = new THREE.SphereGeometry(
      node.isWinner ? 6 : 4,
      16,
      16
    );
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: getColor(),
      transparent: true,
      opacity: node.isWinner ? 1 : 0.9,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);

    // 글로우 효과 (당첨자 또는 searching 상태)
    if (node.isWinner || phase === 'searching') {
      const glowGeometry = new THREE.SphereGeometry(
        node.isWinner ? 10 : 6,
        16,
        16
      );
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.isWinner ? 0xFF00FF : 0x00D4FF,
        transparent: true,
        opacity: node.isWinner ? 0.4 : 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);
    }

    // 이름 라벨 (이름이 있거나 당첨자인 경우)
    if (node.name || node.isWinner) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;

      context.fillStyle = 'transparent';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.font = node.isWinner ? 'bold 24px Arial' : '18px Arial';
      context.fillStyle = node.isWinner ? '#FFFFFF' : '#B0B8C8';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        node.name || node.luckyNumber,
        canvas.width / 2,
        canvas.height / 2
      );

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(24, 6, 1);
      sprite.position.y = node.isWinner ? 12 : 8;
      group.add(sprite);
    }

    return group;
  }, [phase]);

  // 링크 색상 (당첨자 링크 하이라이트 제거 - 노드만 글로우)
  const linkColor = useCallback((link) => {
    if (phase === 'searching') return 'rgba(0, 212, 255, 0.4)';
    return 'rgba(74, 144, 217, 0.2)';
  }, [phase]);

  // 컨테이너 크기 계산
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth - 320,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0" style={{ right: 320 }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        // 노드 설정
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        // 링크 설정
        linkColor={linkColor}
        linkWidth={1}
        linkOpacity={1}
        // Force 시뮬레이션 설정 (공간 제한)
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.4}
        d3Force={(d3) => {
          // 노드 간 반발력 (적당히)
          d3.force('charge').strength(-80);
          // 링크 거리 (짧게)
          d3.force('link').distance(25);
          // 중심으로 끌어당기는 힘 (강하게 - 노드가 퍼지지 않도록)
          d3.force('center').strength(0.1);

          // 노드 위치 제한 (구 안에 가두기)
          d3.force('bound', () => {
            const maxRadius = 100;
            d3.nodes().forEach((node) => {
              const dist = Math.sqrt(node.x ** 2 + node.y ** 2 + node.z ** 2);
              if (dist > maxRadius) {
                const scale = maxRadius / dist;
                node.x *= scale;
                node.y *= scale;
                node.z *= scale;
              }
            });
          });
        }}
        // 카메라 설정
        enableNavigationControls={true}
        controlType="orbit"
        showNavInfo={false}
      />
    </div>
  );
}
