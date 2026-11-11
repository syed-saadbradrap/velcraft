"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { ShoeScene } from "@/components/customize/viewer/ShoeScene";

function ViewerFallback({ label = "Preparing 3D preview..." }: { label?: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.28em] text-stone-600">
      {label}
    </div>
  );
}

class ViewerErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-600">
            Preview failed to load
          </p>
          <button
            type="button"
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-800"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload preview
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ShoeViewer() {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-[2rem] border border-border bg-transparent">
      <ViewerErrorBoundary>
        <Suspense fallback={<ViewerFallback />}>
          <Canvas
            className="h-full w-full !bg-transparent"
            shadows
            dpr={[1, 1.75]}
            gl={{
              antialias: true,
              alpha: true,
              premultipliedAlpha: false,
              powerPreference: "high-performance",
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <PerspectiveCamera makeDefault position={[2.4, 1.35, 2.6]} fov={36} />
            <ambientLight intensity={0.85} />
            <directionalLight
              castShadow
              intensity={1.25}
              position={[3, 5, 2]}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight intensity={0.55} position={[-3, 2, -2]} />
            <spotLight intensity={0.45} position={[0, 4, 1]} angle={0.35} penumbra={1} />
            <hemisphereLight intensity={0.35} color="#fff8f0" groundColor="#b0a89e" />

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
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={1.2}
              maxDistance={6.5}
              minPolarAngle={0.55}
              maxPolarAngle={1.45}
              target={[0, 0.55, 0]}
              makeDefault
            />
          </Canvas>
        </Suspense>
      </ViewerErrorBoundary>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-600">
          Live 3D preview · Drag to rotate · Scroll to zoom
        </p>
      </div>
    </div>
  );
}
