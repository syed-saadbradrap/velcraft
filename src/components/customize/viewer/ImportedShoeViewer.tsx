"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCustomization } from "@/context/CustomizationContext";
import {
  PRODUCTION_SHOE_GLB_VERSION,
  applyFullShoeSoleBand,
  applyImportedShoeCustomization,
  applyProductionInnerMaterial,
  applyProductionLogoMaterial,
  applyProductionSoleMaterial,
  applyProductionUpperMaterial,
  applyShoeTypeVisibility,
  centerAndScale,
  fitCameraToObject,
  isFullShoeVariantPair,
  prepareImportedMesh,
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

// studio-loafer.glb: toe = -Z, heel = +Z.
// Backless seats well near the opening (~0.45). Covered uses the Cover mesh with a slightly
// toe-ward aim and extra lift so the bit sits flush on the taller collar vamp.
const BUCKLE_AIM_Z_FRACTION = 0.45;
const BUCKLE_AIM_Z_FRACTION_COVERED = 0.40;
const BUCKLE_MAX_WIDTH_RATIO = 0.62;
const BUCKLE_MAX_HEIGHT_RATIO = 0.3;
const BUCKLE_MAX_WIDTH_RATIO_COVERED = 0.58;
const BUCKLE_MAX_HEIGHT_RATIO_COVERED = 0.28;
const BUCKLE_LIFT_RATIO = 0.004;
const BUCKLE_LIFT_RATIO_COVERED = 0.014;
// Keep drape resolution modest — dense client meshes make 32×16 raycasts freeze the tab.
const BUCKLE_SEGMENTS_X = 16;
const BUCKLE_SEGMENTS_Y = 8;

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
  shoeType: "backless" | "covered" = "backless",
) {
  removeNamedPart(shoeRoot, "Buckle");
  shoeRoot.updateMatrixWorld(true);

  // Body = backless mesh, Cover = covered mesh. Seat on the mesh that is actually shown,
  // otherwise the bit ends up on Body while Cover is visible (clips into the side — see SS).
  const body = shoeRoot.getObjectByName("Body");
  const cover = shoeRoot.getObjectByName("Cover");
  const seat =
    shoeType === "covered"
      ? (cover ?? body ?? shoeRoot)
      : (body ?? cover ?? shoeRoot);

  // Raycaster skips invisible meshes — force the seat visible for draping.
  const seatWasVisible = seat.visible;
  seat.visible = true;
  if (body && cover && body !== seat) body.visible = false;
  if (body && cover && cover !== seat) cover.visible = false;
  shoeRoot.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(seat);
  if (box.isEmpty()) {
    seat.visible = seatWasVisible;
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const crop = getTextureCrop(texture);
  const isCovered = shoeType === "covered";

  const widthRatio = isCovered ? BUCKLE_MAX_WIDTH_RATIO_COVERED : BUCKLE_MAX_WIDTH_RATIO;
  const heightRatio = isCovered ? BUCKLE_MAX_HEIGHT_RATIO_COVERED : BUCKLE_MAX_HEIGHT_RATIO;
  const maxW = Math.max(size.x * widthRatio, 0.03);
  const maxH = Math.max(size.x * heightRatio, 0.014);
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
    // Depth-tested so the bit is hidden when the shoe is rotated away (was drawn through the
    // leather). It is lifted above all sampled leather below, so it can't be clipped.
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const toeZ = box.min.z;
  const heelZ = box.max.z;
  const aimX = center.x;
  const aimZFraction =
    shoeType === "covered" ? BUCKLE_AIM_Z_FRACTION_COVERED : BUCKLE_AIM_Z_FRACTION;
  const aimZ = toeZ + (heelZ - toeZ) * aimZFraction;

  const bodyTargets: THREE.Object3D[] = [];
  seat.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      bodyTargets.push(child);
    }
  });

  // Same seating rules as backless (proven), with a slightly higher crown floor on Cover so
  // rays don't drop through the taller collar onto the insole.
  const raycaster = new THREE.Raycaster();
  const rayOrigin = new THREE.Vector3();
  const rayDir = new THREE.Vector3(0, -1, 0);
  const minNormalY = isCovered ? 0.32 : 0.28;
  const minCrownY = box.min.y + size.y * (isCovered ? 0.48 : 0.4);

  const castDownRaw = (x: number, z: number) => {
    rayOrigin.set(x, box.max.y + size.y * 0.9, z);
    raycaster.set(rayOrigin, rayDir);
    // Pick the highest valid vamp hit among ALL intersections (capping at 8 caused covered
    // bits to snap onto side walls / fall through → scribble/clip look).
    const hits = raycaster.intersectObjects(bodyTargets, false);
    let best: { point: THREE.Vector3; normal: THREE.Vector3 } | null = null;
    for (const hit of hits) {
      if (!hit.face) continue;
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
      if (n.y < minNormalY) continue;
      if (hit.point.y < minCrownY) continue;
      if (!best || hit.point.y > best.point.y) {
        best = { point: hit.point.clone(), normal: n };
      }
    }
    return best;
  };

  let crownMaxY = -Infinity;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const hit = castDownRaw(aimX + i * size.x * 0.05, aimZ + j * size.z * 0.025);
      if (hit) crownMaxY = Math.max(crownMaxY, hit.point.y);
    }
  }
  if (!Number.isFinite(crownMaxY)) {
    crownMaxY = box.min.y + size.y * 0.85;
  }
  // Soft floor only — reject deep insole hits, keep vamp sides that backless already handles.
  const crownFloor = isCovered ? crownMaxY - size.y * 0.22 : box.min.y;

  const castDown = (x: number, z: number) => {
    const hit = castDownRaw(x, z);
    if (!hit || hit.point.y < crownFloor) return null;
    if (isCovered && Math.abs(hit.point.x - aimX) > size.x * 0.48) return null;
    return hit;
  };

  // Carve/curve the PNG over the vamp: every vertex snaps to leather, then lifts along the
  // local surface normal so the bit follows both the toe→heel slope and the side-to-side crown.
  const centerHit = castDown(aimX, aimZ);
  const geometry = new THREE.PlaneGeometry(planeW, planeH, BUCKLE_SEGMENTS_X, BUCKLE_SEGMENTS_Y);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const lift = size.y * (isCovered ? BUCKLE_LIFT_RATIO_COVERED : BUCKLE_LIFT_RATIO);
  const fallbackPoint = centerHit
    ? centerHit.point.clone()
    : new THREE.Vector3(aimX, crownMaxY, aimZ);
  const fallbackNormal = centerHit ? centerHit.normal.clone() : new THREE.Vector3(0, 1, 0);

  type HitSample = { point: THREE.Vector3; normal: THREE.Vector3 };
  const samples: (HitSample | null)[] = [];
  for (let i = 0; i < positions.count; i++) {
    const wx = aimX + positions.getX(i);
    const wz = aimZ - positions.getY(i);
    samples.push(castDown(wx, wz));
  }

  const cols = BUCKLE_SEGMENTS_X + 1;
  const rows = BUCKLE_SEGMENTS_Y + 1;

  // Fill misses from nearest successful neighbor (flat meanY was folding the bit into a scribble).
  const filled: HitSample[] = samples.map((sample, i) => {
    if (sample) return sample;
    const col = i % cols;
    const row = Math.floor(i / cols);
    let best: HitSample | null = null;
    let bestDist = Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = samples[r * cols + c];
        if (!s) continue;
        const d = (r - row) * (r - row) + (c - col) * (c - col);
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
    }
    const wx = aimX + positions.getX(i);
    const wz = aimZ - positions.getY(i);
    if (best) {
      return {
        point: new THREE.Vector3(wx, best.point.y, wz),
        normal: best.normal.clone(),
      };
    }
    return {
      point: new THREE.Vector3(wx, fallbackPoint.y, wz),
      normal: fallbackNormal.clone(),
    };
  });

  const worldPoints = filled.map((s) => s.point.clone());
  const worldNormals = filled.map((s) => s.normal.clone());

  const smoothed = worldPoints.map((p) => p.clone());
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      let acc = worldPoints[i].clone();
      let n = 1;
      if (col > 0) {
        acc.add(worldPoints[i - 1]);
        n++;
      }
      if (col < cols - 1) {
        acc.add(worldPoints[i + 1]);
        n++;
      }
      if (row > 0) {
        acc.add(worldPoints[i - cols]);
        n++;
      }
      if (row < rows - 1) {
        acc.add(worldPoints[i + cols]);
        n++;
      }
      // Softer smooth on covered so the bit follows the collar curve without shearing.
      smoothed[i].copy(worldPoints[i]).lerp(acc.multiplyScalar(1 / n), isCovered ? 0.45 : 0.35);
    }
  }

  const vertex = new THREE.Vector3();
  const normalFloor = isCovered ? 0.35 : 0.3;
  for (let i = 0; i < positions.count; i++) {
    const nrm = worldNormals[i].clone();
    if (nrm.y < normalFloor) nrm.set(nrm.x, normalFloor, nrm.z).normalize();
    vertex.copy(smoothed[i]).addScaledVector(nrm, lift);
    shoeRoot.worldToLocal(vertex);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  if (isCovered) {
    material.polygonOffsetFactor = -4;
    material.polygonOffsetUnits = -4;
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Buckle";
  mesh.renderOrder = 10;
  mesh.frustumCulled = false;

  shoeRoot.add(mesh);

  // Visibility is finalized by applyShoeTypeVisibility after this call.
  seat.visible = seatWasVisible;
}

function buildShoeGroup(
  shoeScene: THREE.Object3D,
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
  removeNamedPart(shoeRoot, "Buckle");
  applyShoeTypeVisibility(shoeRoot, selection.shoeType);

  group.add(shoeRoot);
  centerAndScale(group, 2.8);

  if (usesMultiPartPipeline(shoeRoot)) {
    applyProductionUpperMaterial(shoeRoot, selection.colorHex, materialSlug);
    // Skip dense Body/Cover sole-band split here — done after first paint.
    applyProductionSoleMaterial(shoeRoot, selection.soleColorHex, {
      splitFullShoeBand: false,
    });
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

function ImageBuckleDrape({
  shoeRoot,
  imageUrl,
  shoeType,
  maxAnisotropy,
}: {
  shoeRoot: THREE.Object3D;
  imageUrl: string;
  shoeType: "backless" | "covered";
  maxAnisotropy: number;
}) {
  const buckleTexture = useTexture(imageUrl);

  useLayoutEffect(() => {
    let cancelled = false;
    const id = window.requestAnimationFrame(() => {
      if (cancelled) return;
      attachImageBuckle(shoeRoot, buckleTexture, maxAnisotropy, shoeType);
      applyShoeTypeVisibility(shoeRoot, shoeType);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(id);
      removeNamedPart(shoeRoot, "Buckle");
    };
  }, [buckleTexture, maxAnisotropy, shoeRoot, shoeType, imageUrl]);

  return null;
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
  const buckleImageUrl = `${buckleImageBase}${buckleImageBase.includes("?") ? "&" : "?"}v=buckle-vamp-21`;

  const combinedUrl = `/models/shoes/${config.shoeSlug}/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`;
  const shoeGltf = useGLTF(combinedUrl);

  const shoeGroup = useMemo(
    () =>
      buildShoeGroup(
        shoeGltf.scene,
        {
          colorHex: selection.colorHex,
          soleColorHex: selection.soleColorHex,
          shoeType: selection.shoeType,
        },
        materialSlug,
      ),
    [
      materialSlug,
      selection.colorHex,
      selection.shoeType,
      selection.soleColorHex,
      shoeGltf.scene,
    ],
  );

  const shoeRoot = shoeGroup.getObjectByName("ShoeRoot");

  useLayoutEffect(() => {
    if (!shoeRoot) {
      return;
    }
    // Let the shoe commit to the screen, then run the heavy sole-band split.
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      applyFullShoeSoleBand(shoeRoot, selection.soleColorHex, selection.shoeType);
      applyShoeTypeVisibility(shoeRoot, selection.shoeType);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [shoeRoot, selection.soleColorHex, selection.shoeType, shoeGroup]);

  useLayoutEffect(() => {
    if (!groupRef.current) {
      return;
    }

    // Re-fit whenever the shoe rebuilds or style changes (hidden Cover was framing wrong).
    const fit = () => {
      if (!groupRef.current) return;
      fitCameraToObject(
        camera,
        controls as { target: THREE.Vector3; update: () => void } | null,
        groupRef.current,
      );
      cameraFittedRef.current = true;
      lastShoeSlugRef.current = config.shoeSlug;
    };

    fit();
    const id = window.setTimeout(fit, 50);
    return () => window.clearTimeout(id);
  }, [camera, controls, config.shoeSlug, selection.shoeType, shoeGroup]);

  return (
    <group ref={groupRef}>
      <primitive object={shoeGroup} />
      {shoeRoot ? (
        <Suspense fallback={null}>
          <ImageBuckleDrape
            key={`${selection.buckleId}-${selection.shoeType}-${buckleImageUrl}`}
            shoeRoot={shoeRoot}
            imageUrl={buckleImageUrl}
            shoeType={selection.shoeType}
            maxAnisotropy={maxAnisotropy}
          />
        </Suspense>
      ) : null}
    </group>
  );
}

useGLTF.preload(
  `/models/shoes/studio-loafer/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`,
);
useTexture.preload("/images/buckles/buckle_01.png");
