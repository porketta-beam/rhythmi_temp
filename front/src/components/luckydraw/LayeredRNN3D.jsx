'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * LayeredRNN3D - 2D 레이어들이 쌓여 3D 효과를 만드는 신경망 시각화
 *
 * 구조:
 * - 각 레이어는 x-y 평면의 2D 노드 배열
 * - 레이어들은 z축으로 분리되어 깊이감 형성
 * - 카메라는 45도 각도로 비스듬히 바라봄
 * - 활성 레이어로 카메라가 줌인, 이전 레이어는 줌아웃
 */
export default function LayeredRNN3D({
  participants = [],
  activeLayer = -1,
  winner = null,
  phase = 'idle',
}) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{
          position: [15, 10, 8],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D4FF" />

        <NetworkScene
          participants={participants}
          activeLayer={activeLayer}
          winner={winner}
          phase={phase}
        />
      </Canvas>
    </div>
  );
}

/**
 * 메인 네트워크 씬
 */
function NetworkScene({ participants, activeLayer, winner, phase }) {
  const groupRef = useRef();
  const { camera } = useThree();

  // 레이어 설정 (Output이 z값이 가장 큼 = 가장 앞)
  const layerConfig = useMemo(() => [
    { count: Math.min(participants.length, 400), label: 'Input', z: -24 },   // 20×20 = 400개
    { count: 100, label: 'Hidden 1', z: -18 },   // 10×10
    { count: 25, label: 'Hidden 2', z: -12 },    // 5×5
    { count: 4, label: 'Hidden 3', z: -6 },      // 2×2
    { count: 1, label: 'Output', z: 0 },         // 가장 앞
  ], [participants.length]);

  // 각 레이어의 노드 위치 계산 (n×n 정사각형 그리드)
  const layers = useMemo(() => {
    return layerConfig.map((config, layerIndex) => {
      const nodes = [];
      const count = config.count;

      // 그리드 크기 계산 (가능한 정사각형에 가깝게)
      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);

      // 노드 간격 (노드 수에 따라 동적 조정)
      const spacing = count > 100 ? 0.6 : count > 25 ? 0.8 : 1.0;

      // 그리드 중앙 정렬을 위한 오프셋
      const offsetX = ((cols - 1) * spacing) / 2;
      const offsetY = ((rows - 1) * spacing) / 2;

      for (let i = 0; i < count; i++) {
        // 마지막 레이어(Output)는 중앙에
        if (layerIndex === 4) {
          nodes.push({
            position: [0, 0, config.z],
            label: winner?.luckyNumber || '?',
            id: `node-${layerIndex}-${i}`,
          });
        } else {
          // n×n 그리드 배치
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = col * spacing - offsetX;
          const y = -(row * spacing - offsetY); // y축 반전 (위에서 아래로)

          nodes.push({
            position: [x, y, config.z],
            label: layerIndex === 0 && participants[i]
              ? participants[i].luckyNumber
              : '',
            id: `node-${layerIndex}-${i}`,
          });
        }
      }

      return { ...config, nodes, cols, rows };
    });
  }, [layerConfig, participants, winner]);

  // 카메라 애니메이션 상태
  const targetPosition = useRef(new THREE.Vector3(15, 10, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -12));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, -12));
  const targetQuaternion = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (activeLayer < 0) {
      // 전체 뷰 (모든 레이어가 보이는 위치)
      targetPosition.current.set(15, 10, 8);
      targetLookAt.current.set(0, 0, -12);
    } else {
      // 활성 레이어와 다음 레이어 사이에 카메라 배치
      const currentZ = layerConfig[activeLayer].z;
      const nextLayerIndex = Math.min(activeLayer + 1, layerConfig.length - 1);
      const nextZ = layerConfig[nextLayerIndex].z;

      // 현재 레이어와 다음 레이어의 중간 지점 (약간 앞쪽)
      const cameraZ = activeLayer === layerConfig.length - 1
        ? currentZ + 8  // Output 레이어일 때는 앞에서 바라봄
        : (currentZ + nextZ) / 2 + 6;  // 레이어 사이 + 오프셋

      targetPosition.current.set(6, 4, cameraZ);
      targetLookAt.current.set(0, 0, currentZ);
    }
  }, [activeLayer, layerConfig]);

  // 카메라 부드러운 이동
  useFrame((state, delta) => {
    // 부드러운 보간 계수 (delta 독립적으로 일정한 속도 유지)
    // 값이 클수록 빠르게 이동, 작을수록 느리게 이동
    const positionSpeed = 0.02;  // 위치 이동 속도
    const lookAtSpeed = 0.025;   // 방향 전환 속도

    // 1. 카메라 위치 부드럽게 이동
    camera.position.lerp(targetPosition.current, positionSpeed);

    // 2. lookAt 타겟도 부드럽게 이동 (급격한 방향 전환 방지)
    currentLookAt.current.lerp(targetLookAt.current, lookAtSpeed);

    // 3. 목표 방향의 quaternion 계산
    const tempCamera = camera.clone();
    tempCamera.position.copy(camera.position);
    tempCamera.lookAt(currentLookAt.current);
    targetQuaternion.current.copy(tempCamera.quaternion);

    // 4. 현재 방향에서 목표 방향으로 slerp (구면 선형 보간)
    camera.quaternion.slerp(targetQuaternion.current, lookAtSpeed);

    // 전체 그룹 약간 회전 (아이들 상태에서만)
    if (groupRef.current && phase === 'idle') {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 레이어 평면 (반투명 배경) */}
      {layers.map((layer, layerIndex) => (
        <LayerPlane
          key={`plane-${layerIndex}`}
          layer={layer}
          layerIndex={layerIndex}
          isActive={activeLayer >= layerIndex}
          isCurrent={activeLayer === layerIndex}
        />
      ))}

      {/* 연결선 */}
      {layers.slice(0, -1).map((fromLayer, layerIndex) => (
        <LayerConnections
          key={`connections-${layerIndex}`}
          fromLayer={fromLayer}
          toLayer={layers[layerIndex + 1]}
          isActive={activeLayer > layerIndex}
          isProcessing={activeLayer === layerIndex}
        />
      ))}

      {/* 노드 */}
      {layers.map((layer, layerIndex) => (
        <LayerNodes
          key={`nodes-${layerIndex}`}
          layer={layer}
          layerIndex={layerIndex}
          isActive={activeLayer >= layerIndex}
          isCurrent={activeLayer === layerIndex}
          isOutput={layerIndex === 4}
          phase={phase}
        />
      ))}
    </group>
  );
}

/**
 * 레이어 배경 평면 (정사각형, 반투명)
 */
function LayerPlane({ layer, layerIndex, isActive, isCurrent }) {
  const meshRef = useRef();

  // 그리드 크기에 맞는 평면 크기 계산
  const cols = layer.cols || Math.ceil(Math.sqrt(layer.count));
  const rows = layer.rows || Math.ceil(layer.count / cols);
  const spacing = layer.count > 100 ? 0.6 : layer.count > 25 ? 0.8 : 1.0;

  // 평면 크기 (노드 그리드보다 약간 크게)
  const planeSize = Math.max(cols, rows) * spacing + 1.5;

  useFrame(() => {
    if (meshRef.current) {
      const targetOpacity = isCurrent ? 0.12 : isActive ? 0.06 : 0.03;
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        targetOpacity,
        0.1
      );
    }
  });

  return (
    <group position={[0, 0, layer.z - 0.1]}>
      {/* 반투명 정사각형 평면 */}
      <mesh ref={meshRef}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial
          color={isCurrent ? '#00D4FF' : isActive ? '#00FFCC' : '#4A90D9'}
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 테두리 */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(planeSize, planeSize)]} />
        <lineBasicMaterial
          color={isCurrent ? '#00D4FF' : isActive ? '#00FFCC' : '#4A90D9'}
          transparent
          opacity={isCurrent ? 0.5 : isActive ? 0.3 : 0.1}
        />
      </lineSegments>

      {/* 레이어 라벨 */}
      <Text
        position={[0, -planeSize / 2 - 0.5, 0.1]}
        fontSize={0.4}
        color={isCurrent ? '#00D4FF' : isActive ? '#00FFCC' : '#7A8599'}
        anchorX="center"
        anchorY="middle"
      >
        {layer.label}
      </Text>
    </group>
  );
}

/**
 * 레이어 간 연결선
 */
function LayerConnections({ fromLayer, toLayer, isActive, isProcessing }) {
  const timeRef = useRef(0);

  // 연결선 생성 (레이어 간 적절한 샘플링)
  const connections = useMemo(() => {
    const conns = [];
    const fromNodes = fromLayer.nodes;
    const toNodes = toLayer.nodes;

    // 레이어 크기에 따라 연결 전략 결정
    const fromCount = fromNodes.length;
    const toCount = toNodes.length;

    // 목표 연결선 수 (레이어당 최대 150개)
    const maxConnections = 150;

    // fromNode 샘플링 간격
    const fromStep = Math.max(1, Math.ceil(fromCount / 30));
    // toNode 샘플링 간격
    const toStep = Math.max(1, Math.ceil(toCount / 5));

    // 샘플링된 fromNode에서 샘플링된 toNode로 연결
    for (let fromIdx = 0; fromIdx < fromCount && conns.length < maxConnections; fromIdx += fromStep) {
      const fromNode = fromNodes[fromIdx];

      for (let toIdx = 0; toIdx < toCount && conns.length < maxConnections; toIdx += toStep) {
        const toNode = toNodes[toIdx];

        conns.push({
          from: fromNode.position,
          to: toNode.position,
          key: `${fromIdx}-${toIdx}`,
        });
      }
    }

    return conns;
  }, [fromLayer, toLayer]);

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
  });

  return (
    <group>
      {connections.map((conn, idx) => (
        <AnimatedLine
          key={conn.key}
          start={conn.from}
          end={conn.to}
          isActive={isActive}
          isProcessing={isProcessing}
          delay={idx * 0.01}
        />
      ))}
    </group>
  );
}

/**
 * 애니메이션 연결선
 */
function AnimatedLine({ start, end, isActive, isProcessing, delay }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      const time = state.clock.elapsedTime;

      if (isProcessing) {
        // 처리 중: 펄스 효과
        const pulse = Math.sin((time + delay) * 4) * 0.3 + 0.5;
        lineRef.current.material.opacity = pulse;
      } else if (isActive) {
        lineRef.current.material.opacity = 0.4;
      } else {
        lineRef.current.material.opacity = 0.1;
      }
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[start, end]}
      color={isActive ? '#00FFCC' : isProcessing ? '#00D4FF' : '#4A90D9'}
      lineWidth={isProcessing ? 2 : 1}
      transparent
      opacity={0.1}
    />
  );
}

/**
 * 레이어 노드들
 */
function LayerNodes({ layer, layerIndex, isActive, isCurrent, isOutput, phase }) {
  return (
    <group>
      {layer.nodes.map((node, nodeIndex) => (
        <Node
          key={node.id}
          position={node.position}
          label={node.label}
          isActive={isActive}
          isCurrent={isCurrent}
          isOutput={isOutput}
          isWinner={isOutput && phase === 'complete'}
          delay={nodeIndex * 0.1}
        />
      ))}
    </group>
  );
}

/**
 * 개별 노드 (글로우 효과 제거, 심플한 구체)
 */
function Node({ position, label, isActive, isCurrent, isOutput, isWinner, delay }) {
  const meshRef = useRef();

  const baseSize = isOutput ? 0.5 : 0.15;  // 노드 크기 축소

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (meshRef.current) {
      // 활성 노드 스케일 애니메이션
      const targetScale = isCurrent
        ? 1.2 + Math.sin((time + delay) * 3) * 0.1
        : isActive ? 1 : 0.8;

      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    }
  });

  // 노드 색상
  const nodeColor = isWinner
    ? '#FF00FF'
    : isCurrent
      ? '#00D4FF'
      : isActive
        ? '#00FFCC'
        : '#4A90D9';

  return (
    <group position={position}>
      {/* 메인 노드 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isCurrent ? 0.5 : isActive ? 0.2 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* 라벨 (Output 노드만 표시) */}
      {label && isOutput && (
        <Html
          center
          distanceFactor={10}
          style={{
            color: isWinner ? '#FFFFFF' : '#0B1026',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            textShadow: isWinner ? '0 0 10px #FF00FF' : 'none',
            pointerEvents: 'none',
          }}
        >
          {label}
        </Html>
      )}
    </group>
  );
}
