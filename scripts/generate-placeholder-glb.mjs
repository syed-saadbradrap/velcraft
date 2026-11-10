/**
 * Generates minimal valid GLB placeholder files for development.
 * Replace these files with production assets without changing application logic.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function createMinimalGlb(name) {
  const gltf = {
    asset: { version: "2.0", generator: "custom-shoes-placeholder" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        max: [0.5, 0.5, 0],
        min: [-0.5, -0.5, 0],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: 3,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 6 },
    ],
    buffers: [{ byteLength: 42 }],
  };

  const json = JSON.stringify(gltf);
  const jsonBuffer = Buffer.from(json);
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const jsonChunk = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);
  const jsonChunkLength = jsonChunk.length;

  const binaryBuffer = Buffer.alloc(42);
  binaryBuffer.writeFloatLE(-0.5, 0);
  binaryBuffer.writeFloatLE(-0.5, 4);
  binaryBuffer.writeFloatLE(0, 8);
  binaryBuffer.writeFloatLE(0.5, 12);
  binaryBuffer.writeFloatLE(-0.5, 16);
  binaryBuffer.writeFloatLE(0, 20);
  binaryBuffer.writeFloatLE(0, 24);
  binaryBuffer.writeFloatLE(0.5, 28);
  binaryBuffer.writeFloatLE(0, 32);
  binaryBuffer.writeUInt16LE(0, 36);
  binaryBuffer.writeUInt16LE(1, 38);
  binaryBuffer.writeUInt16LE(2, 40);

  const binaryPadding = (4 - (binaryBuffer.length % 4)) % 4;
  const binaryChunkLength = binaryBuffer.length + binaryPadding;
  const totalLength = 12 + 8 + jsonChunkLength + 8 + binaryChunkLength;

  const glb = Buffer.alloc(totalLength);
  let offset = 0;

  glb.writeUInt32LE(0x46546c67, offset);
  offset += 4;
  glb.writeUInt32LE(2, offset);
  offset += 4;
  glb.writeUInt32LE(totalLength, offset);
  offset += 4;

  glb.writeUInt32LE(jsonChunkLength, offset);
  offset += 4;
  glb.write("JSON", offset);
  offset += 4;
  jsonBuffer.copy(glb, offset);
  offset += jsonBuffer.length;
  if (jsonPadding > 0) {
    Buffer.alloc(jsonPadding, 0x20).copy(glb, offset);
    offset += jsonPadding;
  }

  glb.writeUInt32LE(binaryChunkLength, offset);
  offset += 4;
  glb.write("BIN\0", offset);
  offset += 4;
  binaryBuffer.copy(glb, offset);
  offset += binaryBuffer.length;

  return glb;
}

const targets = [
  "backend/storage/app/public/models/shoes/ivory-gold-bit-mule/body.glb",
  "backend/storage/app/public/models/shoes/ivory-gold-bit-mule/sole.glb",
  "backend/storage/app/public/models/shoes/ivory-gold-bit-mule/logo.glb",
  "backend/storage/app/public/models/shoes/ivory-gold-bit-mule/inner.glb",
  "backend/storage/app/public/models/shoes/noir-minimal-mule/body.glb",
  "backend/storage/app/public/models/shoes/noir-minimal-mule/sole.glb",
  "backend/storage/app/public/models/shoes/noir-minimal-mule/logo.glb",
  "backend/storage/app/public/models/shoes/noir-minimal-mule/inner.glb",
  "backend/storage/app/public/models/shoes/camel-suede-mule/body.glb",
  "backend/storage/app/public/models/shoes/camel-suede-mule/sole.glb",
  "backend/storage/app/public/models/shoes/camel-suede-mule/logo.glb",
  "backend/storage/app/public/models/shoes/camel-suede-mule/inner.glb",
  "backend/storage/app/public/models/shoes/espresso-horsebit-mule/body.glb",
  "backend/storage/app/public/models/shoes/espresso-horsebit-mule/sole.glb",
  "backend/storage/app/public/models/shoes/espresso-horsebit-mule/logo.glb",
  "backend/storage/app/public/models/shoes/espresso-horsebit-mule/inner.glb",
  "backend/storage/app/public/models/buckles/classic-oval.glb",
  "backend/storage/app/public/models/buckles/heritage-square.glb",
  "backend/storage/app/public/models/buckles/minimal-bar.glb",
  "public/models/shoes/ivory-gold-bit-mule/body.glb",
  "public/models/shoes/ivory-gold-bit-mule/sole.glb",
  "public/models/shoes/ivory-gold-bit-mule/logo.glb",
  "public/models/shoes/ivory-gold-bit-mule/inner.glb",
  "public/models/shoes/noir-minimal-mule/body.glb",
  "public/models/shoes/noir-minimal-mule/sole.glb",
  "public/models/shoes/noir-minimal-mule/logo.glb",
  "public/models/shoes/noir-minimal-mule/inner.glb",
  "public/models/shoes/camel-suede-mule/body.glb",
  "public/models/shoes/camel-suede-mule/sole.glb",
  "public/models/shoes/camel-suede-mule/logo.glb",
  "public/models/shoes/camel-suede-mule/inner.glb",
  "public/models/shoes/espresso-horsebit-mule/body.glb",
  "public/models/shoes/espresso-horsebit-mule/sole.glb",
  "public/models/shoes/espresso-horsebit-mule/logo.glb",
  "public/models/shoes/espresso-horsebit-mule/inner.glb",
  "public/models/buckles/classic-oval.glb",
  "public/models/buckles/heritage-square.glb",
  "public/models/buckles/minimal-bar.glb",
];

for (const relativePath of targets) {
  const fullPath = path.join(root, relativePath);
  const name = path.basename(relativePath, ".glb");
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, createMinimalGlb(name));
  console.log(`Created ${relativePath}`);
}
