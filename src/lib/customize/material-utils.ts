import * as THREE from "three";

const BACKLESS_HIDE_PATTERN = /cover|strap|back|counter|collar/i;
const HEEL_COLOR_PARTS = new Set(["Heel", "HeelCounter", "Back", "BackPart"]);

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

// Client full-mesh variants: Body = backless shoe, Cover = covered shoe (swap, don't stack)
export function isFullShoeVariantPair(root: THREE.Object3D) {
  const body = root.getObjectByName("Body");
  const cover = root.getObjectByName("Cover");
  if (!body || !cover) {
    return false;
  }

  if (body.userData?.fullShoeVariant || cover.userData?.fullShoeVariant) {
    return true;
  }

  // Heuristic: if Cover has similar vertex density to Body, treat as full-shoe swap
  const bodyMesh = body instanceof THREE.Mesh ? body : body.children.find((c) => (c as THREE.Mesh).isMesh);
  const coverMesh = cover instanceof THREE.Mesh ? cover : cover.children.find((c) => (c as THREE.Mesh).isMesh);
  const bodyCount = bodyMesh instanceof THREE.Mesh ? bodyMesh.geometry?.attributes?.position?.count ?? 0 : 0;
  const coverCount = coverMesh instanceof THREE.Mesh ? coverMesh.geometry?.attributes?.position?.count ?? 0 : 0;
  return bodyCount > 5000 && coverCount > 5000 && coverCount > bodyCount * 0.6;
}

export function applyShoeTypeVisibility(root: THREE.Object3D, shoeType: "backless" | "covered") {
  const body = root.getObjectByName("Body");
  const cover = root.getObjectByName("Cover");

  if (body && cover && isFullShoeVariantPair(root)) {
    body.visible = shoeType === "backless";
    cover.visible = shoeType === "covered";
    return;
  }

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

    const prepared = materials.map((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        return material;
      }

      return new THREE.MeshStandardMaterial({
        color: "#f5f5f4",
        roughness: 0.68,
        metalness: 0.04,
      });
    });
    // A lone material must not be an array: shared geometry may carry sole-band groups, and
    // an array missing the group's materialIndex breaks raycasting and rendering
    child.material = prepared.length === 1 ? prepared[0] : prepared;
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
      map: null,
      vertexColors: true,
      roughness: isSuede ? 0.94 : 0.72,
      metalness: isSuede ? 0 : 0.02,
      envMapIntensity: 0.15,
    });
  });
}

export const PRODUCTION_SHOE_GLB_VERSION = "studio-loafer-client-v4";

const UPPER_PARTS = new Set(["Body", "Upper", "Cover"]);

function createFabricMaterial(colorHex: string, materialSlug: string) {
  const isSuede = materialSlug.includes("suede");
  const isLeather = materialSlug.includes("leather");

  return new THREE.MeshStandardMaterial({
    name: isSuede ? "Suede_Material" : "Leather_Material",
    color: new THREE.Color(colorHex),
    roughness: isSuede ? 0.94 : isLeather ? 0.72 : 0.68,
    metalness: isSuede ? 0 : 0.02,
    envMapIntensity: isSuede ? 0.15 : 0.25,
  });
}

export function applyProductionUpperMaterial(
  root: THREE.Object3D,
  colorHex: string,
  materialSlug: string,
) {
  for (const partName of UPPER_PARTS) {
    const part = root.getObjectByName(partName);
    if (!part) {
      continue;
    }

    part.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.material = createFabricMaterial(colorHex, materialSlug);
    });
  }

  for (const partName of HEEL_COLOR_PARTS) {
    const part = root.getObjectByName(partName);
    if (!part) {
      continue;
    }

    part.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }

      child.material = new THREE.MeshStandardMaterial({
        name: "Heel_Material",
        color: new THREE.Color("#2a2420"),
        roughness: 0.82,
        metalness: 0,
        envMapIntensity: 0.1,
      });
    });
  }
}

function createSoleMaterial(colorHex: string) {
  return new THREE.MeshStandardMaterial({
    name: "Sole_Material",
    color: new THREE.Color(colorHex),
    roughness: 0.78,
    metalness: 0,
    envMapIntensity: 0.12,
  });
}

// Fraction of mesh height above the local bottom (per slice along the shoe length) that is
// painted as sole. On studio-loafer the sole sidewall is widest at ~10%, its welt ledge tops
// out at ~13%, and the upper wall starts narrowing at ~14%. The footbed (~11–19%) sits inside
// the outline and is excluded by normal + lateral position, not by height.
export const FULL_SHOE_SOLE_BAND_RATIO = 0.155;
const SOLE_PROFILE_BINS = 32;
const FOOTBED_NORMAL_Y = 0.5;
const FOOTBED_INTERIOR_RATIO = 0.8;

interface SoleSplitInfo {
  bandRatio: number;
  soleTriangles: number;
  totalTriangles: number;
}

// Signed height of each vertex above the sole line (<= 0 means sole). The line follows the
// bottom profile along the length axis so the sprung toe and raised heel get a sole band too,
// not just the flat midfoot.
export function computeSoleField(
  geometry: THREE.BufferGeometry,
  bandRatio = FULL_SHOE_SOLE_BAND_RATIO,
) {
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const count = position.count;
  const field = new Float32Array(count).fill(1);

  const height = box.max.y - box.min.y;
  if (height <= 0) {
    return field;
  }

  const lengthAxis = box.max.z - box.min.z >= box.max.x - box.min.x ? 2 : 0;
  const lateralAxis = lengthAxis === 2 ? 0 : 2;
  const lengthMin = box.min.getComponent(lengthAxis);
  const lengthRange = box.max.getComponent(lengthAxis) - lengthMin || 1;
  const binCoord = (index: number) =>
    ((position.getComponent(index, lengthAxis) - lengthMin) / lengthRange) * SOLE_PROFILE_BINS;
  const binOf = (index: number) =>
    Math.min(SOLE_PROFILE_BINS - 1, Math.max(0, Math.floor(binCoord(index))));

  const bins = new Int32Array(count);
  const bottom = new Float32Array(SOLE_PROFILE_BINS).fill(Infinity);
  for (let index = 0; index < count; index += 1) {
    const bin = binOf(index);
    bins[index] = bin;
    bottom[bin] = Math.min(bottom[bin], position.getY(index));
  }
  for (let bin = 0; bin < SOLE_PROFILE_BINS; bin += 1) {
    if (Number.isFinite(bottom[bin])) {
      continue;
    }
    for (let offset = 1; offset < SOLE_PROFILE_BINS; offset += 1) {
      const neighbor = [bottom[bin - offset], bottom[bin + offset]].find((value) =>
        Number.isFinite(value),
      );
      if (neighbor !== undefined) {
        bottom[bin] = neighbor;
        break;
      }
    }
  }

  const band = height * bandRatio;
  const lateralBoxMin = box.min.getComponent(lateralAxis);
  const lateralRange = box.max.getComponent(lateralAxis) - lateralBoxMin || 1;
  const lateralBinOf = (lateral: number) =>
    Math.min(
      SOLE_PROFILE_BINS - 1,
      Math.max(0, Math.floor(((lateral - lateralBoxMin) / lateralRange) * SOLE_PROFILE_BINS)),
    );

  // 2D outline of the low part of the shoe: lateral extent per length slice, and length
  // extent per lateral slice (so the toe/heel ends of the ledge don't read as footbed)
  const lateralMin = new Float32Array(SOLE_PROFILE_BINS).fill(Infinity);
  const lateralMax = new Float32Array(SOLE_PROFILE_BINS).fill(-Infinity);
  const lengthMinAt = new Float32Array(SOLE_PROFILE_BINS).fill(Infinity);
  const lengthMaxAt = new Float32Array(SOLE_PROFILE_BINS).fill(-Infinity);
  for (let index = 0; index < count; index += 1) {
    const bin = bins[index];
    if (position.getY(index) > bottom[bin] + band * 2) {
      continue;
    }
    const lateral = position.getComponent(index, lateralAxis);
    const along = position.getComponent(index, lengthAxis);
    const lateralBin = lateralBinOf(lateral);
    lateralMin[bin] = Math.min(lateralMin[bin], lateral);
    lateralMax[bin] = Math.max(lateralMax[bin], lateral);
    lengthMinAt[lateralBin] = Math.min(lengthMinAt[lateralBin], along);
    lengthMaxAt[lateralBin] = Math.max(lengthMaxAt[lateralBin], along);
  }
  const endMargin = (lateralRange / 2) * (1 - FOOTBED_INTERIOR_RATIO);

  // Linear between bin centers so the sole line doesn't step at bin edges
  const cutoffAt = (coord: number) => {
    const u = Math.min(SOLE_PROFILE_BINS - 1, Math.max(0, coord - 0.5));
    const lo = Math.floor(u);
    const hi = Math.min(SOLE_PROFILE_BINS - 1, lo + 1);
    return bottom[lo] + (bottom[hi] - bottom[lo]) * (u - lo) + band;
  };

  const lengthCenter = lengthMin + lengthRange / 2;
  const forcedUpper = height * 0.02;

  for (let index = 0; index < count; index += 1) {
    const bin = bins[index];
    const signed = position.getY(index) - cutoffAt(binCoord(index));
    field[index] = signed;
    if (signed > 0 || !normal) {
      continue;
    }

    const center = (lateralMin[bin] + lateralMax[bin]) / 2;
    const halfWidth = (lateralMax[bin] - lateralMin[bin]) / 2 || 1;
    const lateral = position.getComponent(index, lateralAxis);
    const along = position.getComponent(index, lengthAxis);
    const normalY = normal.getY(index);
    const normalLateral = normal.getComponent(index, lateralAxis);
    const normalAlong = normal.getComponent(index, lengthAxis);

    // Cavity walls and the footbed rim tilt toward the shoe center; the outer sole and its
    // welt ledge face away (or down)
    const outward =
      (normalLateral * (lateral - center)) / halfWidth +
      (normalAlong * (along - lengthCenter)) / (lengthRange / 2);
    if (normalY > -0.3 && outward < -0.05) {
      field[index] = forcedUpper;
      continue;
    }

    // Up-facing faces inside the shoe outline are the footbed, not the outsole
    if (normalY <= FOOTBED_NORMAL_Y) {
      continue;
    }
    const lateralBin = lateralBinOf(lateral);
    const insideWidth = Math.abs(lateral - center) < halfWidth * FOOTBED_INTERIOR_RATIO;
    const insideLength =
      along > lengthMinAt[lateralBin] + endMargin && along < lengthMaxAt[lateralBin] - endMargin;
    if (insideWidth && insideLength) {
      field[index] = forcedUpper;
    }
  }

  return field;
}

// Clips triangles along the sole line (field = 0) and reorders the index so upper triangles
// come first (group 0) and sole triangles last (group 1). Geometry is shared with the cached
// GLTF scene, so the split runs once and is reused; single-material assignments ignore
// groups and still render the whole mesh.
export function splitSoleBandGroups(
  geometry: THREE.BufferGeometry,
  bandRatio = FULL_SHOE_SOLE_BAND_RATIO,
): SoleSplitInfo {
  const cached = geometry.userData.soleSplit as SoleSplitInfo | undefined;
  if (cached && cached.bandRatio === bandRatio && geometry.groups.length === 2) {
    return cached;
  }

  const baseCount = geometry.attributes.position.count;
  if (!geometry.index) {
    const indices = new Uint32Array(baseCount);
    for (let index = 0; index < baseCount; index += 1) {
      indices[index] = index;
    }
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  }

  const field = Array.from(computeSoleField(geometry, bandRatio));
  const names = Object.keys(geometry.attributes);
  const sources = names.map((name) => geometry.getAttribute(name));
  const data = sources.map((attribute) => {
    const values: number[] = [];
    for (let index = 0; index < baseCount; index += 1) {
      for (let component = 0; component < attribute.itemSize; component += 1) {
        values.push(attribute.getComponent(index, component));
      }
    }
    return values;
  });

  let vertexCount = baseCount;
  const edgeVertices = new Map<number, number>();
  const cutEdge = (a: number, b: number) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const key = lo * baseCount * 4 + hi;
    const existing = edgeVertices.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const t = field[lo] / (field[lo] - field[hi]);
    sources.forEach((attribute, slot) => {
      const values = data[slot];
      for (let component = 0; component < attribute.itemSize; component += 1) {
        const from = values[lo * attribute.itemSize + component];
        const to = values[hi * attribute.itemSize + component];
        values.push(from + (to - from) * t);
      }
    });
    field.push(0);
    edgeVertices.set(key, vertexCount);
    return vertexCount++;
  };

  const source = geometry.index!.array;
  const triangleCount = Math.floor(source.length / 3);
  const upper: number[] = [];
  const sole: number[] = [];

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const corners = [source[triangle * 3], source[triangle * 3 + 1], source[triangle * 3 + 2]];
    const isSole = corners.map((vertex) => field[vertex] <= 0);
    const soleCorners = isSole.filter(Boolean).length;

    if (soleCorners === 0 || soleCorners === 3) {
      (soleCorners === 3 ? sole : upper).push(...corners);
      continue;
    }

    // One corner sits alone on its side of the line: keep winding (lone, next, prev)
    const lone = isSole.indexOf(soleCorners === 1);
    const l = corners[lone];
    const p = corners[(lone + 1) % 3];
    const q = corners[(lone + 2) % 3];
    const x = cutEdge(l, p);
    const y = cutEdge(l, q);
    const loneSide = isSole[lone] ? sole : upper;
    const otherSide = isSole[lone] ? upper : sole;
    loneSide.push(l, x, y);
    otherSide.push(x, p, q, x, q, y);
  }

  sources.forEach((attribute, slot) => {
    geometry.setAttribute(
      names[slot],
      new THREE.BufferAttribute(new Float32Array(data[slot]), attribute.itemSize),
    );
  });

  const ordered = upper.concat(sole);
  const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;
  geometry.setIndex(new THREE.BufferAttribute(new IndexArray(ordered), 1));
  geometry.clearGroups();
  geometry.addGroup(0, upper.length, 0);
  geometry.addGroup(upper.length, sole.length, 1);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const info: SoleSplitInfo = {
    bandRatio,
    soleTriangles: sole.length / 3,
    totalTriangles: ordered.length / 3,
  };
  geometry.userData.soleSplit = info;
  return info;
}

function firstMaterial(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material) ? material[0] : material;
}

// Body/Cover in client full-mesh GLBs include the sole region; paint their bottom band with
// the sole color while keeping the upper material already assigned (call after upper material).
export function applyFullShoeSoleBand(root: THREE.Object3D, colorHex: string) {
  if (!isFullShoeVariantPair(root)) {
    return;
  }

  for (const partName of ["Body", "Cover"]) {
    const part = root.getObjectByName(partName);
    part?.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.material) {
        return;
      }

      splitSoleBandGroups(child.geometry);
      child.material = [firstMaterial(child.material), createSoleMaterial(colorHex)];
    });
  }
}

export function applyProductionSoleMaterial(root: THREE.Object3D, colorHex: string) {
  root.getObjectByName("Sole")?.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) {
      return;
    }

    child.material = createSoleMaterial(colorHex);
  });

  applyFullShoeSoleBand(root, colorHex);
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
