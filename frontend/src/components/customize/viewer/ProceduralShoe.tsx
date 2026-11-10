"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { BuckleDesign } from "@/components/customize/viewer/BuckleDesign";
import { useCustomization } from "@/context/CustomizationContext";
import {
  createHeelCoverGeometry,
  createHeelLiftGeometry,
  createInsoleGeometry,
  createSoleGeometry,
  createToeCapGeometry,
  createUpperWallGeometry,
} from "@/lib/customize/shoe-geometry";

function useShoeMaterial(colorHex: string, materialSlug: string, texture?: THREE.Texture | null) {
  return useMemo(() => {
    const isSuede = materialSlug.includes("suede");

    return new THREE.MeshStandardMaterial({
      map: texture ?? null,
      color: new THREE.Color(colorHex),
      roughness: isSuede ? 0.88 : 0.42,
      metalness: isSuede ? 0.02 : 0.08,
    });
  }, [colorHex, materialSlug, texture]);
}

function ProductPhotoUpper({
  texture,
  colorHex,
  materialSlug,
}: {
  texture: THREE.Texture;
  colorHex: string;
  materialSlug: string;
}) {
  const material = useShoeMaterial(colorHex, materialSlug, texture);

  return (
    <group position={[0, 0.11, 0.02]} rotation={[-0.45, 0.08, 0]}>
      <mesh material={material} castShadow>
        <planeGeometry args={[0.92, 0.62]} />
      </mesh>
    </group>
  );
}

export function ProceduralShoe() {
  const { config, selection } = useCustomization();
  const material = config.materials.find((item) => item.id === selection.materialId);
  const buckle = config.buckles.find((item) => item.id === selection.buckleId);
  const materialSlug = material?.slug ?? "suede";
  const photoUrl = config.thumbnailUrl ?? `/images/shoes/${config.shoeSlug}.jpg`;
  const texture = useTexture(photoUrl);
  const photoTexture = useMemo(() => {
    const map = texture.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [texture]);

  const soleGeometry = useMemo(() => createSoleGeometry(), []);
  const heelLiftGeometry = useMemo(() => createHeelLiftGeometry(), []);
  const upperWallGeometry = useMemo(() => createUpperWallGeometry(), []);
  const insoleGeometry = useMemo(() => createInsoleGeometry(), []);
  const toeCapGeometry = useMemo(() => createToeCapGeometry(), []);
  const heelCoverGeometry = useMemo(() => createHeelCoverGeometry(), []);

  const upperMaterial = useShoeMaterial(selection.colorHex, materialSlug);
  const soleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(selection.soleColorHex),
        roughness: 0.58,
        metalness: 0.04,
      }),
    [selection.soleColorHex],
  );

  const insoleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5a2d2d"),
        roughness: 0.72,
        metalness: 0.02,
      }),
    [],
  );

  const stitchMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#8a7340"),
        roughness: 0.85,
        metalness: 0,
      }),
    [],
  );

  const isCovered = selection.shoeType === "covered";

  return (
    <group rotation={[0.08, -0.72, 0]} position={[0, -0.08, 0]}>
      <mesh geometry={soleGeometry} material={soleMaterial} castShadow receiveShadow />
      <mesh geometry={heelLiftGeometry} material={soleMaterial} castShadow receiveShadow />
      <mesh geometry={upperWallGeometry} material={upperMaterial} castShadow name="ShoeBody" />
      <mesh geometry={toeCapGeometry} material={upperMaterial} castShadow />
      <mesh geometry={insoleGeometry} material={insoleMaterial} castShadow receiveShadow />

      <mesh position={[0, 0.11, 0.28]} rotation={[Math.PI / 2, 0, 0]} material={stitchMaterial}>
        <torusGeometry args={[0.24, 0.004, 8, 48, Math.PI * 1.05]} />
      </mesh>

      <ProductPhotoUpper
        texture={photoTexture}
        colorHex={selection.colorHex}
        materialSlug={materialSlug}
      />

      {isCovered ? (
        <mesh geometry={heelCoverGeometry} material={upperMaterial} castShadow name="HeelCover" />
      ) : null}

      <BuckleDesign slug={buckle?.slug ?? "classic-oval"} />
    </group>
  );
}
