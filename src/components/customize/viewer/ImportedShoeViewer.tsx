"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCustomization } from "@/context/CustomizationContext";
import { getBuckleModelUrl } from "@/lib/customize/config-builder";
import {
  PRODUCTION_SHOE_GLB_VERSION,
  applyImportedShoeCustomization,
  applyProductionBuckleMaterial,
  applyProductionInnerMaterial,
  applyProductionLogoMaterial,
  applyProductionSoleMaterial,
  applyProductionUpperMaterial,
  applyShoeTypeVisibility,
  centerAndScale,
  fitCameraToObject,
  isFullShoeVariantPair,
  prepareImportedMesh,
  replaceBuckleWithAlignment,
} from "@/lib/customize/material-utils";

function hasNamedPart(root: THREE.Object3D, name: string) {
  return Boolean(root.getObjectByName(name));
}

function usesMultiPartPipeline(root: THREE.Object3D) {
  return (
    hasNamedPart(root, "Sole") ||
    hasNamedPart(root, "Inner") ||
    hasNamedPart(root, "Logo") ||
    hasNamedPart(root, "Upper") ||
    hasNamedPart(root, "Body")
  );
}

function removeNamedPart(root: THREE.Object3D, name: string) {
  const part = root.getObjectByName(name);
  part?.parent?.remove(part);
}

function attachImageBuckle(shoeRoot: THREE.Object3D, texture: THREE.Texture) {
  removeNamedPart(shoeRoot, "Buckle");

  shoeRoot.updateMatrixWorld(true);

  // Prefer Body vamp surface only — Inner/Sole hits bury the PNG inside the shoe
  const body = shoeRoot.getObjectByName("Body") ?? shoeRoot;
  const box = new THREE.Box3().setFromObject(body);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // glTF Y-up: X=width, Y=up, Z=length (toe ≈ -Z)
  const planeW = Math.max(size.x * 0.48, 0.026);
  const planeH = planeW * (360 / 900);
  const geometry = new THREE.PlaneGeometry(planeW, planeH);

  const map = texture.clone();
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;

  const material = new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    alphaTest: 0.08,
    metalness: 0.62,
    roughness: 0.28,
    side: THREE.DoubleSide,
    // Draw on top of leather even if the flat PNG grazes the curved vamp
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Buckle";
  mesh.renderOrder = 10;

  // Keep current good seat (toward opening), fix visibility/clipping
  const toeZ = box.min.z;
  const heelZ = box.max.z;
  const aimX = center.x;
  const aimZ = toeZ + (heelZ - toeZ) * 0.38;

  const bodyTargets: THREE.Object3D[] = [];
  body.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      bodyTargets.push(child);
    }
  });

  const raycaster = new THREE.Raycaster();
  // Sample center + left/right so we clear the curved vamp apex
  const sampleXs = [aimX, aimX - planeW * 0.28, aimX + planeW * 0.28];
  let bestPoint: THREE.Vector3 | null = null;
  let maxY = -Infinity;

  for (const x of sampleXs) {
    raycaster.set(
      new THREE.Vector3(x, box.max.y + size.y * 0.8, aimZ),
      new THREE.Vector3(0, -1, 0),
    );
    const hits = raycaster.intersectObjects(bodyTargets, true);
    for (const h of hits) {
      if (!h.face) continue;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();
      if (n.y < 0.4) continue;
      if (h.point.y > maxY) {
        maxY = h.point.y;
        bestPoint = h.point.clone();
      }
    }
  }

  // Flat on vamp (world-up). Extra lift clears curved leather so full buckle shows.
  mesh.rotation.set(-Math.PI / 2, 0, 0);
  if (bestPoint) {
    mesh.position.set(aimX, bestPoint.y + 0.012, aimZ);
  } else {
    mesh.position.set(aimX, box.min.y + size.y * 0.86 + 0.012, aimZ);
  }

  shoeRoot.add(mesh);
}

function buildShoeGroup(
  shoeScene: THREE.Object3D,
  buckleScene: THREE.Object3D | null,
  buckleTexture: THREE.Texture | null,
  selection: {
    colorHex: string;
    soleColorHex: string;
    shoeType: "backless" | "covered";
  },
  materialSlug: string,
) {
  const group = new THREE.Group();
  group.name = "ImportedShoe";

  const shoeRoot = shoeScene.clone(true);
  shoeRoot.name = "ShoeRoot";
  // Full-mesh Body/Cover already include the sole (painted by the sole band); the separate
  // Sole slab pokes through their footbed at the toe and below the heel
  if (isFullShoeVariantPair(shoeRoot)) {
    removeNamedPart(shoeRoot, "Sole");
  }
  prepareImportedMesh(shoeRoot);

  if (buckleTexture) {
    attachImageBuckle(shoeRoot, buckleTexture);
  } else if (buckleScene && hasNamedPart(shoeRoot, "Buckle")) {
    const buckle = buckleScene.clone(true);
    prepareImportedMesh(buckle);
    applyProductionBuckleMaterial(buckle);
    replaceBuckleWithAlignment(shoeRoot, buckle);
  } else {
    removeNamedPart(shoeRoot, "Buckle");
  }

  group.add(shoeRoot);
  centerAndScale(group, 2.8);

  if (usesMultiPartPipeline(shoeRoot)) {
    applyProductionUpperMaterial(shoeRoot, selection.colorHex, materialSlug);
    applyProductionSoleMaterial(shoeRoot, selection.soleColorHex);
    applyProductionInnerMaterial(shoeRoot);
    applyProductionLogoMaterial(shoeRoot);
  } else {
    applyImportedShoeCustomization(shoeRoot, {
      upperColorHex: selection.colorHex,
      soleColorHex: selection.soleColorHex,
      materialSlug,
    });
  }

  applyShoeTypeVisibility(shoeRoot, selection.shoeType);

  return group;
}

export function ImportedShoeViewer() {
  const groupRef = useRef<THREE.Group>(null);
  const cameraFittedRef = useRef(false);
  const lastShoeSlugRef = useRef<string | null>(null);
  const { camera, controls } = useThree();
  const { config, selection } = useCustomization();
  const material = config.materials.find((item) => item.id === selection.materialId);
  const materialSlug = material?.slug ?? "suede";
  const selectedBuckle = config.buckles.find((item) => item.id === selection.buckleId);

  const buckleImageBase =
    selectedBuckle?.image_url ||
    selectedBuckle?.thumbnail_url ||
    "/images/buckles/buckle_01.png";
  const buckleImageUrl = `${buckleImageBase}${buckleImageBase.includes("?") ? "&" : "?"}v=buckle-vamp-9`;

  const combinedUrl = `/models/shoes/${config.shoeSlug}/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`;
  const buckleUrl =
    getBuckleModelUrl(config, selection.buckleId) ||
    config.models.default_buckle ||
    "/models/buckles/buckle_04.glb";

  const shoeGltf = useGLTF(combinedUrl);
  const buckleGltf = useGLTF(`${buckleUrl}?v=${PRODUCTION_SHOE_GLB_VERSION}`);
  const buckleTexture = useTexture(buckleImageUrl);

  const shoeGroup = useMemo(
    () =>
      buildShoeGroup(
        shoeGltf.scene,
        buckleGltf.scene,
        buckleTexture,
        {
          colorHex: selection.colorHex,
          soleColorHex: selection.soleColorHex,
          shoeType: selection.shoeType,
        },
        materialSlug,
      ),
    [
      buckleGltf.scene,
      buckleTexture,
      materialSlug,
      selection.buckleId,
      selection.colorHex,
      selection.shoeType,
      selection.soleColorHex,
      shoeGltf.scene,
    ],
  );

  useLayoutEffect(() => {
    if (lastShoeSlugRef.current !== config.shoeSlug) {
      cameraFittedRef.current = false;
      lastShoeSlugRef.current = config.shoeSlug;
    }

    if (cameraFittedRef.current || !groupRef.current) {
      return;
    }

    fitCameraToObject(
      camera,
      controls as { target: THREE.Vector3; update: () => void } | null,
      groupRef.current,
    );
    cameraFittedRef.current = true;
  }, [camera, controls, config.shoeSlug, shoeGroup]);

  return (
    <group ref={groupRef}>
      <primitive object={shoeGroup} />
    </group>
  );
}

useGLTF.preload(
  `/models/shoes/studio-loafer/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`,
);
useGLTF.preload(`/models/buckles/buckle_04.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`);
useTexture.preload("/images/buckles/buckle_01.png");
