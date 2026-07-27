import * as THREE from "three";

const BACKLESS_HIDE_PATTERN = /cover|strap|back|heel/i;

export function cloneScene(scene: THREE.Object3D) {
  return scene.clone(true);
}

export function applyColorToMeshes(root: THREE.Object3D, hex: string) {
  const color = new THREE.Color(hex);

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !child.material) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if ("color" in material && material.color instanceof THREE.Color) {
        material.color.copy(color);
        material.needsUpdate = true;
      }
    });
  });
}

export function applyMaterialProfile(
  root: THREE.Object3D,
  slug: string,
  textureUrl?: string | null,
) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    const isSuede = slug.includes("suede");
    const material = new THREE.MeshStandardMaterial({
      color: "#c9a962",
      roughness: isSuede ? 0.92 : 0.45,
      metalness: isSuede ? 0.02 : 0.12,
    });

    if (textureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(textureUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
      });
    }

    child.material = material;
  });
}

export function applyShoeTypeVisibility(root: THREE.Object3D, shoeType: "backless" | "covered") {
  root.traverse((child) => {
    if (!child.name) {
      return;
    }

    if (BACKLESS_HIDE_PATTERN.test(child.name)) {
      child.visible = shoeType === "covered";
    }
  });
}

export function centerAndScale(root: THREE.Object3D, targetSize = 3.2) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) {
    return;
  }

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / maxAxis;

  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  root.updateMatrixWorld(true);
}

export function prepareImportedMesh(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.geometry.computeVertexNormals();

    if (!child.geometry.attributes.uv) {
      applyPlanarUvs(child.geometry);
    }

    const existing = child.material;
    const materials = Array.isArray(existing)
      ? existing
      : existing
        ? [existing]
        : [];

    if (materials.length === 0) {
      child.material = new THREE.MeshStandardMaterial({
        color: "#f5f5f4",
        roughness: 0.68,
        metalness: 0.04,
      });
      return;
    }

    child.material = materials.map((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        return material;
      }

      return new THREE.MeshStandardMaterial({
        color: "#f5f5f4",
        roughness: 0.68,
        metalness: 0.04,
      });
    });
  });
}

export function applyPlanarUvs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;

  if (!box) {
    return;
  }

  const position = geometry.attributes.position;
  const uvs = new Float32Array(position.count * 2);
  const rangeX = box.max.x - box.min.x || 1;
  const rangeZ = box.max.z - box.min.z || 1;

  for (let index = 0; index < position.count; index += 1) {
    uvs[index * 2] = (position.getX(index) - box.min.x) / rangeX;
    uvs[index * 2 + 1] = 1 - (position.getZ(index) - box.min.z) / rangeZ;
  }

  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}

interface ImportedShoeCustomizationOptions {
  upperColorHex: string;
  soleColorHex: string;
  materialSlug: string;
  photoTexture?: THREE.Texture | null;
}

export function applyImportedShoeCustomization(
  root: THREE.Object3D,
  options: ImportedShoeCustomizationOptions,
) {
  const isSuede = options.materialSlug.includes("suede");
  const upperColor = new THREE.Color(options.upperColorHex);
  const soleColor = new THREE.Color(options.soleColorHex);
  const bounds = new THREE.Box3().setFromObject(root);
  const soleCutoff = bounds.min.y + (bounds.max.y - bounds.min.y) * 0.2;
  const vertex = new THREE.Vector3();

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    if (!child.geometry.attributes.uv) {
      applyPlanarUvs(child.geometry);
    }

    const positions = child.geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let index = 0; index < positions.count; index += 1) {
      vertex.fromBufferAttribute(positions, index);
      child.localToWorld(vertex);
      const shade = vertex.y <= soleCutoff ? soleColor : upperColor;
      colors[index * 3] = shade.r;
      colors[index * 3 + 1] = shade.g;
      colors[index * 3 + 2] = shade.b;
    }

    child.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    child.material = new THREE.MeshStandardMaterial({
      map: options.photoTexture ?? null,
      vertexColors: true,
      roughness: isSuede ? 0.86 : 0.4,
      metalness: isSuede ? 0.03 : 0.1,
    });
  });
}

export const PRODUCTION_SHOE_GLB_VERSION = "external-9ebff9b9";

const UPPER_PARTS = new Set(["Body", "Upper"]);

export function applyProductionUpperMaterial(
  root: THREE.Object3D,
  colorHex: string,
  materialSlug: string,
) {
  const isSuede = materialSlug.includes("suede");
  const color = new THREE.Color(colorHex);

  for (const partName of UPPER_PARTS) {
    const part = root.getObjectByName(partName);
    if (!part) {
      continue;
    }

    part.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.material = new THREE.MeshStandardMaterial({
        name: isSuede ? "Suede_Material" : "Leather_Material",
        color,
        roughness: isSuede ? 0.86 : 0.38,
        metalness: isSuede ? 0.03 : 0.1,
      });
    });
  }
}

export function applyProductionSoleMaterial(root: THREE.Object3D, colorHex: string) {
  const part = root.getObjectByName("Sole");
  if (!part) {
    return;
  }

  part.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.material = new THREE.MeshStandardMaterial({
      name: "Sole_Material",
      color: new THREE.Color(colorHex),
      roughness: 0.62,
      metalness: 0.04,
    });
  });
}

export function applyProductionInnerMaterial(root: THREE.Object3D) {
  const part = root.getObjectByName("Inner");
  if (!part) {
    return;
  }

  part.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.material = new THREE.MeshStandardMaterial({
      name: "Inner_Material",
      color: new THREE.Color("#1a1a1a"),
      roughness: 0.5,
      metalness: 0.05,
    });
  });
}

export function applyProductionLogoMaterial(root: THREE.Object3D) {
  const part = root.getObjectByName("Logo");
  if (!part) {
    return;
  }

  part.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.material = new THREE.MeshStandardMaterial({
      name: "Logo_Material",
      color: new THREE.Color("#c8c8cc"),
      roughness: 0.22,
      metalness: 0.55,
    });
  });
}

function createBuckleMaterial(source: THREE.Material) {
  const matName = source.name.toLowerCase();
  const isDark = matName.includes("black") || matName.includes("enamel");

  return new THREE.MeshStandardMaterial({
    name: source.name || (isDark ? "Enamel_Black" : "Metal_Buckle"),
    color: isDark ? "#111111" : "#c9a962",
    roughness: isDark ? 0.45 : 0.18,
    metalness: isDark ? 0.15 : 0.92,
  });
}

export function applyProductionBuckleMaterial(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => createBuckleMaterial(material));
      return;
    }

    child.material = createBuckleMaterial(child.material);
  });
}

export function replaceBuckleWithAlignment(
  shoeRoot: THREE.Object3D,
  buckleRoot: THREE.Object3D,
) {
  const placeholder = shoeRoot.getObjectByName("Buckle");
  let targetCenter: THREE.Vector3 | null = null;

  if (placeholder) {
    const box = new THREE.Box3().setFromObject(placeholder);
    targetCenter = box.getCenter(new THREE.Vector3());
    placeholder.parent?.remove(placeholder);
  }

  buckleRoot.name = "Buckle";
  shoeRoot.add(buckleRoot);

  if (!targetCenter) {
    return;
  }

  shoeRoot.updateMatrixWorld(true);
  const buckleBox = new THREE.Box3().setFromObject(buckleRoot);
  const buckleCenter = buckleBox.getCenter(new THREE.Vector3());
  buckleRoot.position.add(targetCenter.sub(buckleCenter));
}

export function fitCameraToObject(
  camera: THREE.Camera,
  controls: { target: THREE.Vector3; update: () => void } | null,
  object: THREE.Object3D,
) {
  if (!(camera instanceof THREE.PerspectiveCamera)) {
    return;
  }

  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) {
    return;
  }

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const fov = camera.fov * (Math.PI / 180);
  const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.32;

  camera.position.set(
    center.x + distance * 0.82,
    center.y + distance * 0.38,
    center.z + distance * 0.88,
  );
  camera.near = 0.01;
  camera.far = distance * 40;
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

export function getImportedShoeAnchors(root: THREE.Object3D) {
  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const width = bounds.max.x - bounds.min.x;
  const depth = bounds.max.z - bounds.min.z;

  return {
    buckle: [
      center.x,
      bounds.max.y * 0.88,
      center.z + depth * 0.12,
    ] as [number, number, number],
    buckleScale: Math.max(width * 0.38, 0.2),
  };
}
