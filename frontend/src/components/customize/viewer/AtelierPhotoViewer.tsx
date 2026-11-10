"use client";

import { useMemo } from "react";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { BuckleDesign } from "@/components/customize/viewer/BuckleDesign";
import { useCustomization } from "@/context/CustomizationContext";
import {
  createHeelLiftGeometry,
  createSoleGeometry,
} from "@/lib/customize/shoe-geometry";

function usePhotoMaterial(
  texture: THREE.Texture,
  colorHex: string,
  materialSlug: string,
) {
  return useMemo(() => {
    const isSuede = materialSlug.includes("suede");

    return new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(colorHex),
      roughness: isSuede ? 0.88 : 0.38,
      metalness: isSuede ? 0.02 : 0.06,
    });
  }, [colorHex, materialSlug, texture]);
}

export function AtelierPhotoViewer() {
  const { config, selection } = useCustomization();
  const material = config.materials.find((item) => item.id === selection.materialId);
  const buckle = config.buckles.find((item) => item.id === selection.buckleId);
  const materialSlug = material?.slug ?? "suede";
  const photoUrl = config.thumbnailUrl ?? `/images/shoes/${config.shoeSlug}.jpg`;
  const texture = useTexture(photoUrl);

  const photoTexture = useMemo(() => {
    const map = texture.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.needsUpdate = true;
    return map;
  }, [texture]);

  const upperMaterial = usePhotoMaterial(photoTexture, selection.colorHex, materialSlug);
  const soleGeometry = useMemo(() => createSoleGeometry(), []);
  const heelLiftGeometry = useMemo(() => createHeelLiftGeometry(), []);

  const soleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(selection.soleColorHex),
        roughness: 0.62,
        metalness: 0.04,
      }),
    [selection.soleColorHex],
  );

  const pedestalMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.85, metalness: 0.05 }),
    [],
  );

  const isCovered = selection.shoeType === "covered";

  return (
    <group rotation={[0.06, -0.55, 0]} position={[0, -0.12, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0]} receiveShadow material={pedestalMaterial}>
        <circleGeometry args={[1.35, 64]} />
      </mesh>

      <mesh geometry={soleGeometry} material={soleMaterial} castShadow receiveShadow />
      <mesh geometry={heelLiftGeometry} material={soleMaterial} castShadow receiveShadow />

      <group position={[0, 0.02, 0.08]} rotation={[-0.42, 0.12, 0]}>
        <mesh position={[0, 0, -0.015]} receiveShadow>
          <planeGeometry args={[1.48, 1.48]} />
          <meshStandardMaterial color="#f3ede3" roughness={0.95} metalness={0} />
        </mesh>

        <mesh material={upperMaterial} castShadow>
          <planeGeometry args={[1.38, 1.38]} />
        </mesh>
      </group>

      {isCovered ? (
        <RoundedBox
          args={[0.95, 0.12, 0.18]}
          radius={0.03}
          position={[0, -0.02, -0.42]}
          material={upperMaterial}
          castShadow
        />
      ) : null}

      <BuckleDesign slug={buckle?.slug ?? "classic-oval"} position={[0, 0.2, 0.42]} scale={1.15} />

      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.05, 64]} />
        <meshBasicMaterial color="#c9a962" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}
