"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VoxelData {
  id: string;
  x: number;
  y: number;
  z: number;
  isTop: boolean;
  isCenter: boolean;
  baseColor: string;
  edgeColor: string;
}

// Single dynamic 3D Voxel with AI exploration animation (moving outward and inward)
function AnimatedVoxel({
  x,
  y,
  z,
  isTop,
  isCenter,
  baseColor,
  edgeColor,
}: Omit<VoxelData, "id">) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  // Spacing between voxel centers in resting position
  const spacing = 0.98;
  const basePos = useMemo(() => [x * spacing, y * spacing, z * spacing], [x, y, z]);

  // Geometric outward normal vector for expansion
  const normal = useMemo(() => {
    const len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len];
  }, [x, y, z]);

  // Phase offset based on coordinates to make IA inspection look organic
  const phase = useMemo(() => (x * 1.7 + y * 2.3 + z * 3.1), [x, y, z]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // AI Slice & Dice dynamic interaction:
    // Waves of exploratory displacement pulling inner and surrounding blocks outward then returning
    let explodeDist = 0;
    let isInspecting = false;

    // Central & inner core voxels have pronounced AI extraction
    if (isCenter) {
      const cycle = Math.sin(t * 1.8);
      explodeDist = cycle > 0.1 ? (cycle - 0.1) * 0.45 : 0;
      isInspecting = explodeDist > 0.05;
    } else {
      // Periodic wave scanning through the dimensions
      const wave = Math.sin(t * 2.2 + phase);
      if (wave > 0.45) {
        explodeDist = (wave - 0.45) * 0.38;
        isInspecting = true;
      }
    }

    // Apply calculated outward displacement along normal vector
    groupRef.current.position.x = basePos[0] + normal[0] * explodeDist;
    groupRef.current.position.y = basePos[1] + normal[1] * explodeDist;
    groupRef.current.position.z = basePos[2] + normal[2] * explodeDist;

    // Update material glow during AI inspection
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isInspecting) {
        mat.emissive.set(isTop ? "#38bdf8" : "#10b981");
        mat.emissiveIntensity = 0.6 + explodeDist * 1.2;
        mat.opacity = 0.88;
      } else {
        mat.emissive.set(isTop ? "#0369a1" : "#d97706");
        mat.emissiveIntensity = isTop ? 0.25 : 0.18;
        mat.opacity = isTop ? 0.76 : 0.68;
      }
    }
  });

  return (
    <group ref={groupRef} position={[basePos[0], basePos[1], basePos[2]]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.88, 0.88, 0.88]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.12}
          metalness={0.1}
          transparent={true}
          opacity={isTop ? 0.76 : 0.68}
          depthWrite={false}
        />
      </mesh>

      <lineSegments ref={lineRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.885, 0.885, 0.885)]} />
        <lineBasicMaterial
          color={edgeColor}
          transparent={true}
          opacity={0.85}
          linewidth={1.5}
        />
      </lineSegments>
    </group>
  );
}

// 3D Matrix Cube of 27 voxels with smooth continuous orbital rotation
function RotatingOlapCluster() {
  const clusterRef = useRef<THREE.Group>(null!);

  // Generate 3x3x3 grid voxels (-1, 0, 1)
  const voxels: VoxelData[] = useMemo(() => {
    const list: VoxelData[] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const isTop = y === 1;
          const isCenter = x === 0 && y === 0 && z === 0;

          // Color palette matching the real WebGL OLAP visualizer (Image 2):
          // Top tier: Sapphire Azure / Cyan
          // Bottom tiers: Glowing Translucent Amber / Gold
          const baseColor = isTop
            ? (x === 0 && z === 0 ? "#0284c7" : "#0369a1")
            : (x === 0 && z === 0 ? "#f59e0b" : "#d97706");

          const edgeColor = isTop ? "#7dd3fc" : "#fbbf24";

          list.push({
            id: `v-${x}-${y}-${z}`,
            x,
            y,
            z,
            isTop,
            isCenter,
            baseColor,
            edgeColor,
          });
        }
      }
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!clusterRef.current) return;
    const t = state.clock.elapsedTime;
    // Dynamic smooth orbital rotation and gentle pitch
    clusterRef.current.rotation.y += delta * 0.75;
    clusterRef.current.rotation.x = Math.sin(t * 0.5) * 0.15 + 0.38;
    clusterRef.current.rotation.z = Math.cos(t * 0.4) * 0.08;
  });

  return (
    <group ref={clusterRef}>
      {voxels.map((v) => (
        <AnimatedVoxel key={v.id} {...v} />
      ))}
    </group>
  );
}

interface MiniOlapCube3DLogoProps {
  className?: string;
}

export default function MiniOlapCube3DLogo({ className = "w-full h-full" }: MiniOlapCube3DLogoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-16 h-16 rounded-xl border border-sky-400/40 bg-sky-950/30 animate-pulse flex items-center justify-center">
          <span className="text-[10px] font-mono text-sky-400 font-bold">3D OLAP</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} pointer-events-none select-none`}>
      <Canvas
        camera={{ position: [4.4, 3.8, 4.4], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[8, 12, 8]} intensity={2.2} color="#38bdf8" />
        <pointLight position={[-8, -6, -8]} intensity={1.8} color="#f59e0b" />
        <directionalLight position={[5, 8, 5]} intensity={1.6} color="#ffffff" />
        <RotatingOlapCluster />
      </Canvas>
    </div>
  );
}
