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

// Fraction of toe→heel length where the bit sits (0 = toe tip, 1 = heel). 0.38 sits on the vamp
// just in front of the tongue/opening lip.
const BUCKLE_AIM_Z_FRACTION = 0.38;
// Max visible bit footprint, as a fraction of the shoe body width.
const BUCKLE_MAX_WIDTH_RATIO = 0.4;
const BUCKLE_MAX_HEIGHT_RATIO = 0.2;
// Gap between leather and the PNG skin, as a fraction of body height.
const BUCKLE_LIFT_RATIO = 0.006;
const BUCKLE_SEGMENTS_X = 28;
const BUCKLE_SEGMENTS_Y = 14;

type TextureCrop = { u0: number; v0: number; uSize: number; vSize: number; aspect: number };
const cropCache = new WeakMap<object, TextureCrop>();

// Client PNGs are 2048x2048 with the metal bit centred in transparent padding. Measure the
// opaque bounds so the plane matches the bit itself (no dead space, correct aspect ratio).
function getTextureCrop(texture: THREE.Texture): TextureCrop {
  const image = texture.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  const full: TextureCrop = { u0: 0, v0: 0, uSize: 1, vSize: 1, aspect: 0.4 };
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
          if (data[(y * w + x) * 4 + 3] > 24) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const pad = 2;
        const x0 = Math.max(0, minX - pad);
        const y0 = Math.max(0, minY - pad);
        const x1 = Math.min(w, maxX + 1 + pad);
        const y1 = Math.min(h, maxY + 1 + pad);
        const cw = x1 - x0;
        const ch = y1 - y0;
        result = {
          u0: x0 / w,
          // canvas Y is top-down; texture V is bottom-up (flipY = true)
          v0: 1 - y1 / h,
          uSize: cw / w,
          vSize: ch / h,
          aspect: (ch * image.height) / h / ((cw * image.width) / w),
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

  // Prefer Body vamp surface only — Inner/Sole hits bury the PNG inside the shoe
  const body = shoeRoot.getObjectByName("Body") ?? shoeRoot;
  const box = new THREE.Box3().setFromObject(body);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // glTF Y-up: X=width, Y=up, Z=length (toe ≈ -Z)
  const crop = getTextureCrop(texture);

  // Fit the opaque bit inside a max width/height box; keeps real aspect (bars wide, emblem compact)
  const maxW = Math.max(size.x * BUCKLE_MAX_WIDTH_RATIO, 0.026);
  const maxH = Math.max(size.x * BUCKLE_MAX_HEIGHT_RATIO, 0.013);
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

  const material = new THREE.MeshStandardMaterial({
    map,
    // PNGs already carry baked metal shading; keep PBR light so they don't go black
    transparent: true,
    alphaTest: 0.35,
    metalness: 0.25,
    roughness: 0.45,
    side: THREE.DoubleSide,
    // Real depth testing so the bit is hidden by the shoe from behind/below (no see-through)
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
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
  const rayDir = new THREE.Vector3(0, -1, 0);
  const rayOrigin = new THREE.Vector3();
  const rayStartY = box.max.y + size.y * 0.8;

  const surfaceY = (x: number, z: number): number | null => {
    rayOrigin.set(x, rayStartY, z);
    raycaster.set(rayOrigin, rayDir);
    const hits = raycaster.intersectObjects(bodyTargets, true);
    let best: number | null = null;
    for (const h of hits) {
      if (!h.face) continue;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize();
      if (n.y < 0.3) continue;
      if (best === null || h.point.y > best) best = h.point.y;
    }
    return best;
  };

  const centerY = surfaceY(aimX, aimZ);
  const fallbackY = centerY ?? box.min.y + size.y * 0.86;
  const lift = size.y * BUCKLE_LIFT_RATIO;
  const maxDelta = size.y * 0.1;

  // Plane laid flat (XZ), image-up → toe (-Z). Every vertex is draped onto the vamp surface so the
  // bit follows the leather curve instead of floating at the edges or clipping at the apex.
  const geometry = new THREE.PlaneGeometry(planeW, planeH, BUCKLE_SEGMENTS_X, BUCKLE_SEGMENTS_Y);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const inv = new THREE.Matrix4().copy(shoeRoot.matrixWorld).invert();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const wx = aimX + pos.getX(i);
    const wz = aimZ + pos.getZ(i);
    let y = surfaceY(wx, wz);
    if (y === null || Math.abs(y - fallbackY) > maxDelta) {
      y = fallbackY;
    }
    v.set(wx, y + lift, wz).applyMatrix4(inv);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Buckle";
  mesh.renderOrder = 2;
  mesh.frustumCulled = false;

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

  const buckleImageBase =
    selectedBuckle?.image_url ||
    selectedBuckle?.thumbnail_url ||
    "/images/buckles/buckle_01.png";
  const buckleImageUrl = `${buckleImageBase}${buckleImageBase.includes("?") ? "&" : "?"}v=buckle-vamp-10`;

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
