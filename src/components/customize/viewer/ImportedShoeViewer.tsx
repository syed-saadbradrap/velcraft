"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
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
  prepareImportedMesh,
  replaceBuckleWithAlignment,
} from "@/lib/customize/material-utils";

function usesBuiltInBuckle(buckleSlug: string | undefined) {
  return buckleSlug === "classic-oval";
}

function hasNamedPart(root: THREE.Object3D, name: string) {
  return Boolean(root.getObjectByName(name));
}

function usesMultiPartPipeline(root: THREE.Object3D) {
  return (
    hasNamedPart(root, "Sole") ||
    hasNamedPart(root, "Inner") ||
    hasNamedPart(root, "Logo") ||
    hasNamedPart(root, "Upper")
  );
}

export function ImportedShoeViewer() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, controls } = useThree();
  const { config, selection } = useCustomization();
  const material = config.materials.find((item) => item.id === selection.materialId);
  const materialSlug = material?.slug ?? "suede";
  const selectedBuckle = config.buckles.find((item) => item.id === selection.buckleId);
  const builtInBuckle = usesBuiltInBuckle(selectedBuckle?.slug);

  const combinedUrl = `/models/shoes/${config.shoeSlug}/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`;
  const buckleUrl =
    getBuckleModelUrl(config, selection.buckleId) ||
    config.models.default_buckle ||
    "/models/buckles/buckle_04.glb";

  const shoeGltf = useGLTF(combinedUrl);
  const buckleGltf = useGLTF(`${buckleUrl}?v=${PRODUCTION_SHOE_GLB_VERSION}`);

  const shoeGroup = useMemo(() => {
    const group = new THREE.Group();
    group.name = "ImportedShoe";

    const shoeRoot = shoeGltf.scene.clone(true);
    shoeRoot.name = "ShoeRoot";
    prepareImportedMesh(shoeRoot);

    const hasBuckleNode = hasNamedPart(shoeRoot, "Buckle");
    if (hasBuckleNode) {
      if (builtInBuckle) {
        const buckle = shoeRoot.getObjectByName("Buckle");
        if (buckle) {
          applyProductionBuckleMaterial(buckle);
        }
      } else {
        const buckle = buckleGltf.scene.clone(true);
        prepareImportedMesh(buckle);
        applyProductionBuckleMaterial(buckle);
        replaceBuckleWithAlignment(shoeRoot, buckle);
      }
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
  }, [
    builtInBuckle,
    buckleGltf.scene,
    materialSlug,
    selection.colorHex,
    selection.shoeType,
    selection.soleColorHex,
    shoeGltf.scene,
  ]);

  useLayoutEffect(() => {
    if (!groupRef.current) {
      return;
    }

    fitCameraToObject(
      camera,
      controls as { target: THREE.Vector3; update: () => void } | null,
      groupRef.current,
    );
  }, [camera, controls, shoeGroup]);

  return (
    <group ref={groupRef} rotation={[0, -0.42, 0]}>
      <primitive object={shoeGroup} />
    </group>
  );
}

useGLTF.preload(
  `/models/shoes/ivory-gold-bit-mule/shoe.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`,
);
useGLTF.preload(`/models/buckles/buckle_04.glb?v=${PRODUCTION_SHOE_GLB_VERSION}`);
