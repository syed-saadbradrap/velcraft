"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { ShoeScene } from "@/components/customize/viewer/ShoeScene";

function ViewerFallback() {
  return (
    <div className="flex h-full min-h-[100vh] items-center justify-center text-sm uppercase tracking-[0.28em] text-stone-600">
      Preparing 3D preview...
    </div>
  );
}

export function ShoeViewer() {
  return (
    <div className="relative h-[100vh] min-h-[100vh] overflow-hidden rounded-[2rem] border border-border bg-transparent">
      <Suspense fallback={<ViewerFallback />}>
        <Canvas
          className="h-full w-full !bg-transparent"
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <PerspectiveCamera position={[2.2, 1.0, 2.4]} fov={38} />
          <ambientLight intensity={0.72} />
          <directionalLight
            castShadow
            intensity={1.15}
            position={[3, 5, 2]}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight intensity={0.45} position={[-3, 2, -2]} />
          <spotLight intensity={0.4} position={[0, 4, 1]} angle={0.35} penumbra={1} />

          <Suspense fallback={null}>
            <ShoeScene />
          </Suspense>

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.22}
            scale={6}
            blur={2.4}
            far={4}
            color="#78716c"
          />
          <Environment preset="studio" environmentIntensity={0.55} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={1.2}
            maxDistance={6.5}
            minPolarAngle={0.55}
            maxPolarAngle={1.45}
            target={[0, 0.4, 0]}
            makeDefault
          />
        </Canvas>
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-600">
          Live 3D preview · Drag to rotate · Scroll to zoom
        </p>
      </div>
    </div>
  );
}
