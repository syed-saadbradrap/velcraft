"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface BuckleDesignProps {
  slug: string;
  position?: [number, number, number];
  scale?: number;
}

export function BuckleDesign({
  slug,
  position = [0, 0.12, 0.08],
  scale = 1,
}: BuckleDesignProps) {
  const gold = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9a962",
        roughness: 0.25,
        metalness: 0.85,
      }),
    [],
  );

  const inlay = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#111111",
        roughness: 0.6,
        metalness: 0.15,
      }),
    [],
  );

  const silver = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8a8a8a",
        roughness: 0.2,
        metalness: 0.9,
      }),
    [],
  );

  return (
    <group position={position} scale={scale}>
      {slug === "minimal-bar" ? (
        <mesh material={silver} castShadow>
          <boxGeometry args={[0.32, 0.035, 0.05]} />
        </mesh>
      ) : slug === "heritage-square" ? (
        <>
          <mesh material={gold} position={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.09, 0.03]} />
          </mesh>
          <mesh material={inlay} position={[-0.1, 0, 0.018]}>
            <boxGeometry args={[0.08, 0.06, 0.012]} />
          </mesh>
          <mesh material={gold} position={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.09, 0.03]} />
          </mesh>
          <mesh material={inlay} position={[0.1, 0, 0.018]}>
            <boxGeometry args={[0.08, 0.06, 0.012]} />
          </mesh>
          <mesh material={gold} castShadow>
            <boxGeometry args={[0.07, 0.03, 0.03]} />
          </mesh>
        </>
      ) : (
        <>
          <mesh material={gold} position={[-0.1, 0, 0]} castShadow>
            <torusGeometry args={[0.055, 0.014, 12, 24]} />
          </mesh>
          <mesh material={inlay} position={[-0.1, 0, 0.012]}>
            <boxGeometry args={[0.055, 0.045, 0.012]} />
          </mesh>
          <mesh material={gold} position={[0.1, 0, 0]} castShadow>
            <torusGeometry args={[0.055, 0.014, 12, 24]} />
          </mesh>
          <mesh material={inlay} position={[0.1, 0, 0.012]}>
            <boxGeometry args={[0.055, 0.045, 0.012]} />
          </mesh>
          <mesh material={gold} castShadow rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.045, 0.012, 12, 24, Math.PI]} />
          </mesh>
        </>
      )}
    </group>
  );
}
