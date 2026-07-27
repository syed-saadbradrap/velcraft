import * as THREE from "three";

function traceFootOutline(shape: THREE.Shape) {
  shape.moveTo(0, 1.02);
  shape.bezierCurveTo(0.34, 0.98, 0.5, 0.62, 0.48, 0.18);
  shape.bezierCurveTo(0.46, -0.18, 0.4, -0.62, 0.18, -0.86);
  shape.bezierCurveTo(0.08, -0.94, -0.08, -0.94, -0.18, -0.86);
  shape.bezierCurveTo(-0.4, -0.62, -0.46, -0.18, -0.48, 0.18);
  shape.bezierCurveTo(-0.5, 0.62, -0.34, 0.98, 0, 1.02);
}

function traceFootOpening(path: THREE.Path) {
  path.moveTo(0, 0.72);
  path.bezierCurveTo(0.24, 0.68, 0.3, 0.34, 0.28, 0.02);
  path.bezierCurveTo(0.26, -0.28, 0.18, -0.58, 0, -0.64);
  path.bezierCurveTo(-0.18, -0.58, -0.26, -0.28, -0.28, 0.02);
  path.bezierCurveTo(-0.3, 0.34, -0.24, 0.68, 0, 0.72);
}

export function createSoleGeometry() {
  const shape = new THREE.Shape();
  traceFootOutline(shape);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.05, 0);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}

export function createHeelLiftGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.28, -0.82);
  shape.lineTo(0.28, -0.82);
  shape.lineTo(0.24, -0.58);
  shape.lineTo(-0.24, -0.58);
  shape.lineTo(-0.28, -0.82);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.04, 0);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}

export function createUpperWallGeometry() {
  const shape = new THREE.Shape();
  traceFootOutline(shape);

  const opening = new THREE.Path();
  traceFootOpening(opening);
  shape.holes.push(opening);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.16, 0);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}

export function createInsoleGeometry() {
  const shape = new THREE.Shape();
  traceFootOpening(shape);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: false,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.145, 0);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}

export function createToeCapGeometry() {
  const geometry = new THREE.SphereGeometry(0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  geometry.scale(1.15, 0.55, 0.95);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.18, 0.48);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}

export function createHeelCoverGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.3, -0.86);
  shape.lineTo(0.3, -0.86);
  shape.lineTo(0.26, -0.58);
  shape.lineTo(-0.26, -0.58);
  shape.lineTo(-0.3, -0.86);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.18, 0);
  geometry.scale(0.58, 0.58, 0.58);

  return geometry;
}
