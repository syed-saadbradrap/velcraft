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

// Fraction of toe→heel length where the bit sits (0 = toe tip, 1 = heel).
const BUCKLE_AIM_Z_FRACTION = 0.4;
// Visible bit footprint vs shoe body width (real loafer hardware is fairly wide on the vamp).
const BUCKLE_MAX_WIDTH_RATIO = 0.52;
const BUCKLE_MAX_HEIGHT_RATIO = 0.24;
// Keep the decal slightly above leather so it stays readable.
const BUCKLE_LIFT_RATIO = 0.014;

type TextureCrop = { u0: number; v0: number; uSize: number; vSize: number; aspect: number };
const cropCache = new WeakMap<object, TextureCrop>();

// Client PNGs are 2048² with the metal bit in transparent padding. Crop to opaque bounds
// so bars stay wide and emblems stay compact (no empty square plane).
function getTextureCrop(texture: THREE.Texture): TextureCrop {
  const image = texture.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  const full: TextureCrop = { u0: 0, v0: 0, uSize: 1, vSize: 1, aspect: 0.42 };
  if (!image || !image.width || !image.height || typeof document === "undefined") {
    return full;
  }

  const cached = cropCache.get(image);
  if (cached) return cached;

  let result = full;
  try {
    const maxDim = 512;
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
    const w = Math.max(1, Math.round(image.width * scale));
    const h = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(image, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const pad = 3;
        const x0 = Math.max(0, minX - pad);
        const y0 = Math.max(0, minY - pad);
        const x1 = Math.min(w, maxX + 1 + pad);
        const y1 = Math.min(h, maxY + 1 + pad);
        const cw = Math.max(1, x1 - x0);
        const ch = Math.max(1, y1 - y0);
        result = {
          u0: x0 / w,
          v0: 1 - y1 / h,
          uSize: cw / w,
          vSize: ch / h,
          aspect: ch / cw,
        };
      }
    }
  } catch {
    result = full;
  }

  cropCache.set(image, result);
  return result;
}

function attachImageBuckle(
  shoeRoot: THREE.Object3D,
  texture: THREE.Texture,
  maxAnisotropy = 8,
) {
  removeNamedPart(shoeRoot, "Buckle");
  shoeRoot.updateMatrixWorld(true);

  const body = shoeRoot.getObjectByName("Body") ?? shoeRoot;
  const box = new THREE.Box3().setFromObject(body);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const crop = getTextureCrop(texture);

  const maxW = Math.max(size.x * BUCKLE_MAX_WIDTH_RATIO, 0.03);
  const maxH = Math.max(size.x * BUCKLE_MAX_HEIGHT_RATIO, 0.014);
  let planeW = maxW;
  let planeH = planeW * crop.aspect;
  if (planeH > maxH) {
    planeH = maxH;
    planeW = planeH / crop.aspect;
  }

  const map = texture.clone();
  map.colorSpace = THREE.SRGBColorSpace;
  map.flipY = true;
  map.anisotropy = Math.min(16, Math.max(1, maxAnisotropy));
  map.generateMipmaps = true;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.offset.set(crop.u0, crop.v0);
  map.repeat.set(crop.uSize, crop.vSize);
  map.needsUpdate = true;

  // BasicMaterial keeps the PNG's baked metal look (Standard was crushing dark chrome to black).
  const material = new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    alphaTest: 0.12,
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
  });

  const toeZ = box.min.z;
  const heelZ = box.max.z;
  const aimX = center.x;
  const aimZ = toeZ + (heelZ - toeZ) * BUCKLE_AIM_Z_FRACTION;

  const bodyTargets: THREE.Object3D[] = [];
  body.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      bodyTargets.push(child);
    }
  });

  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDir = new THREE.Vector3(0, -1, 0);
  rayOrigin.set(aimX, box.max.y + size.y * 0.8, aimZ);
  raycaster.set(rayOrigin, rayDir);
  const hits = raycaster.intersectObjects(bodyTargets, true);

  let bestPoint: THREE.Vector3 | null = null;
  let bestY = -Infinity;
  for (const hit of hits) {
    if (!hit.face) continue;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
    if (n.y < 0.25) continue;
    if (hit.point.y > bestY) {
      bestY = hit.point.y;
      bestPoint = hit.point.clone();
    }
  }

  // World-sized plane must be converted into shoeRoot local units (GLB roots are often scaled).
  const worldScale = new THREE.Vector3();
  shoeRoot.getWorldScale(worldScale);
  const sx = Math.max(Math.abs(worldScale.x), 1e-6);
  const sz = Math.max(Math.abs(worldScale.z), 1e-6);

  // Flat decal on vamp (image top → toe). Stable and readable; draping was clipping/hiding bits.
  const geometry = new THREE.PlaneGeometry(planeW / sx, planeH / sz);
  geometry.rotateX(-Math.PI / 2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Buckle";
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;

  const lift = size.y * BUCKLE_LIFT_RATIO;
  const worldY = bestPoint ? bestPoint.y + lift : box.min.y + size.y * 0.86 + lift;
  // Ray/box are world-space; mesh is parented under shoeRoot so convert to local.
  const localPos = new THREE.Vector3(aimX, worldY, aimZ);
  shoeRoot.worldToLocal(localPos);
  mesh.position.copy(localPos);

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
  maxAnisotropy = 8,
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
    attachImageBuckle(shoeRoot, buckleTexture, maxAnisotropy);
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
  const { camera, controls, gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const { config, selection } = useCustomization();
  const material = config.materials.find((item) => item.id === selection.materialId);
  const materialSlug = material?.slug ?? "suede";
  const selectedBuckle = config.buckles.find((item) => item.id === selection.buckleId);

  const buckleSlugMatch = selectedBuckle?.slug?.match(/buckle-?(\d+)/i);
  const buckleIndex = buckleSlugMatch ? Number(buckleSlugMatch[1]) : null;
  const localBuckleImage =
    buckleIndex && buckleIndex >= 1 && buckleIndex <= 10
      ? `/images/buckles/buckle_${String(buckleIndex).padStart(2, "0")}.png`
      : null;

  const buckleImageBase =
    localBuckleImage ||
    selectedBuckle?.image_url ||
    selectedBuckle?.thumbnail_url ||
    "/images/buckles/buckle_01.png";
  const buckleImageUrl = `${buckleImageBase}${buckleImageBase.includes("?") ? "&" : "?"}v=buckle-vamp-12`;

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
        maxAnisotropy,
      ),
    [
      maxAnisotropy,
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
