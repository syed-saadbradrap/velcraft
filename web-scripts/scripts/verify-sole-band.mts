// Runs the production material pipeline on the studio-loafer GLB in Node and reports the
// sole-band split for Body (backless) and Cover (covered). Optionally writes vertex-colored
// PLYs (one per variant x color combo) for a visual check in Blender.
//
// Usage (from frontend/): node scripts/verify-sole-band.mts [--ply outDir]
import fs from "node:fs";
import path from "node:path";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  FULL_SHOE_SOLE_BAND_RATIO,
  applyProductionSoleMaterial,
  applyProductionUpperMaterial,
  applyShoeTypeVisibility,
  prepareImportedMesh,
} from "../src/lib/customize/material-utils.ts";

const glbPath = path.join("public", "models", "shoes", "studio-loafer", "shoe.glb");
const plyIndex = process.argv.indexOf("--ply");
const plyDir = plyIndex > -1 ? process.argv[plyIndex + 1] : null;

const combos = [
  { label: "white-upper_black-sole", upper: "#f5f5f4", sole: "#111111" },
  { label: "dark-upper_white-sole", upper: "#1f1a17", sole: "#FFFFFF" },
];

const data = fs.readFileSync(glbPath);
const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
const gltf = await new GLTFLoader().parseAsync(arrayBuffer, "");

let failed = false;
const check = (ok: boolean, message: string) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${message}`);
  if (!ok) failed = true;
};

function writePly(file: string, mesh: THREE.Mesh) {
  const geometry = mesh.geometry;
  const materials = mesh.material as THREE.MeshStandardMaterial[];
  const position = geometry.attributes.position;
  const index = geometry.index!.array;
  // Unshared vertices per face so colors stay flat per triangle, as three.js draws groups
  const vertexLines: string[] = [];
  for (const group of geometry.groups) {
    const c = materials[group.materialIndex!].color.clone().convertLinearToSRGB();
    const rgb = `${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)}`;
    for (let i = group.start; i < group.start + group.count; i += 1) {
      const v = index[i];
      vertexLines.push(`${position.getX(v)} ${position.getY(v)} ${position.getZ(v)} ${rgb}`);
    }
  }
  const lines = [
    "ply",
    "format ascii 1.0",
    `element vertex ${vertexLines.length}`,
    "property float x",
    "property float y",
    "property float z",
    "property uchar red",
    "property uchar green",
    "property uchar blue",
    `element face ${vertexLines.length / 3}`,
    "property list uchar int vertex_indices",
    "end_header",
    ...vertexLines,
  ];
  for (let i = 0; i < vertexLines.length; i += 3) {
    lines.push(`3 ${i} ${i + 1} ${i + 2}`);
  }
  fs.writeFileSync(file, lines.join("\n"));
}

console.log(`Sole band ratio: ${FULL_SHOE_SOLE_BAND_RATIO}`);

for (const combo of combos) {
  for (const shoeType of ["backless", "covered"] as const) {
    const root = gltf.scene.clone(true);
    prepareImportedMesh(root);
    applyProductionUpperMaterial(root, combo.upper, "suede");
    applyProductionSoleMaterial(root, combo.sole);
    applyShoeTypeVisibility(root, shoeType);

    const partName = shoeType === "backless" ? "Body" : "Cover";
    const part = root.getObjectByName(partName) as THREE.Mesh;
    const other = root.getObjectByName(shoeType === "backless" ? "Cover" : "Body")!;
    const sole = root.getObjectByName("Sole") as THREE.Mesh | undefined;
    const materials = part.material as THREE.MeshStandardMaterial[];
    const split = part.geometry.userData.soleSplit;
    const pct = ((split.soleTriangles / split.totalTriangles) * 100).toFixed(1);
    const tag = `${combo.label} ${shoeType} (${partName})`;

    check(part.visible && !other.visible, `${tag}: only ${partName} visible`);
    check(Array.isArray(materials) && materials.length === 2, `${tag}: upper + sole materials`);
    check(
      materials[0].color.getHexString() === new THREE.Color(combo.upper).getHexString(),
      `${tag}: group 0 = upper ${combo.upper}`,
    );
    check(
      materials[1].color.getHexString() === new THREE.Color(combo.sole).getHexString(),
      `${tag}: group 1 = sole ${combo.sole}`,
    );
    check(
      split.soleTriangles > 0 && split.soleTriangles / split.totalTriangles < 0.45,
      `${tag}: sole band ${split.soleTriangles}/${split.totalTriangles} tris (${pct}%)`,
    );
    if (sole) {
      const soleMat = sole.material as THREE.MeshStandardMaterial;
      check(
        soleMat.color.getHexString() === new THREE.Color(combo.sole).getHexString(),
        `${tag}: named Sole mesh = ${combo.sole}`,
      );
    }

    if (plyDir) {
      fs.mkdirSync(plyDir, { recursive: true });
      writePly(path.join(plyDir, `${shoeType}_${combo.label}.ply`), part);
    }
  }
}

process.exit(failed ? 1 : 0);
