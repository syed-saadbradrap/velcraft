/**
 * Import a downloaded GLB into the customize studio for a shoe slug.
 *
 * Usage:
 *   node scripts/import-shoe-glb.mjs ivory-gold-bit-mule "C:/Users/ORIGION/Downloads/white_mesh.glb"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const slug = process.argv[2];
const source = process.argv[3];

if (!slug || !source) {
  console.error("Usage: node scripts/import-shoe-glb.mjs <shoe-slug> <path-to-glb>");
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error(`Source file not found: ${source}`);
  process.exit(1);
}

const targets = [
  `public/models/shoes/${slug}/body.glb`,
  `backend/storage/app/public/models/shoes/${slug}/body.glb`,
  `backend/public/storage/models/shoes/${slug}/body.glb`,
];

for (const relativePath of targets) {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.copyFileSync(source, fullPath);
  console.log(`Copied -> ${relativePath}`);
}

console.log("");
console.log(`Next step: add "${slug}" to importedModelSlugs in src/lib/customize/config-builder.ts`);
console.log("Then hard refresh the customize page.");
