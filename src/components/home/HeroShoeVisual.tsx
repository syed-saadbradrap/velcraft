"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function HeroShoeVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 18,
  });
  const glareX = useSpring(useTransform(pointerX, [-0.5, 0.5], ["28%", "72%"]), {
    stiffness: 90,
    damping: 20,
  });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="hero-shoe-scene relative aspect-[4/5] w-full max-w-[34rem]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="hero-product-ring absolute left-1/2 top-[12%] h-[72%] w-[72%] -translate-x-1/2 rounded-full border border-accent/15" />
      <div className="hero-product-ring hero-product-ring--delayed absolute left-1/2 top-[16%] h-[64%] w-[64%] -translate-x-1/2 rounded-full border border-accent/10" />
      <div className="hero-product-spotlight absolute inset-x-[8%] bottom-[18%] top-[8%] rounded-[2.5rem]" />

      <motion.div
        className="hero-shoe-3d-stage absolute inset-x-[4%] bottom-[14%] top-[4%]"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
        }}
      >
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-full w-full overflow-hidden rounded-[2rem]"
        >
          <motion.div
            className="pointer-events-none absolute inset-y-[8%] z-10 w-[38%] bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.34),transparent)] opacity-60 mix-blend-screen"
            style={{ left: glareX }}
          />
          <svg
            viewBox="0 0 640 720"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full overflow-visible drop-shadow-[0_36px_60px_rgba(28,25,23,0.22)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="heroVelvetBase" x1="18%" y1="8%" x2="86%" y2="92%">
                <stop offset="0%" stopColor="#3d5688" />
                <stop offset="42%" stopColor="#1b2f57" />
                <stop offset="100%" stopColor="#0f1a33" />
              </linearGradient>
              <linearGradient id="heroVelvetSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
                <stop offset="38%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="heroSoleTop" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="50%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="heroSoleSide" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#52525b" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="heroGoldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f6e6b4" />
                <stop offset="34%" stopColor="#d4af63" />
                <stop offset="68%" stopColor="#9a7728" />
                <stop offset="100%" stopColor="#f0dba0" />
              </linearGradient>
              <linearGradient id="heroGoldEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6f5420" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#6f5420" stopOpacity="0.45" />
              </linearGradient>
              <radialGradient id="heroGroundGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c9a962" stopOpacity="0.34" />
                <stop offset="58%" stopColor="#c9a962" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#c9a962" stopOpacity="0" />
              </radialGradient>
              <filter id="heroSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="24" stdDeviation="18" floodColor="#1c1917" floodOpacity="0.24" />
              </filter>
              <filter id="heroGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#c9a962" floodOpacity="0.45" />
              </filter>
            </defs>

            <ellipse cx="320" cy="612" rx="220" ry="34" fill="url(#heroGroundGlow)" />
            <ellipse cx="320" cy="618" rx="178" ry="18" fill="#1c1917" opacity="0.12" />

            <g filter="url(#heroSoftShadow)">
              <path
                d="M112 470 C132 438 176 412 236 396 C286 384 360 378 426 388 C486 398 534 422 548 452 C556 468 548 484 520 496 C454 522 342 534 248 528 C182 524 128 508 112 470 Z"
                fill="url(#heroSoleSide)"
              />
              <path
                d="M118 468 C150 430 214 406 286 396 C360 386 438 388 512 404 C528 408 538 418 534 430 C520 454 448 470 350 476 C252 482 166 474 118 468 Z"
                fill="url(#heroSoleTop)"
              />

              <path
                d="M142 430 C168 352 228 286 308 248 C356 226 412 218 466 226 C514 234 548 258 560 292 C568 318 560 344 530 364 C470 404 362 432 262 444 C206 450 162 446 142 430 Z"
                fill="url(#heroVelvetBase)"
              />
              <path
                d="M142 430 C168 352 228 286 308 248 C356 226 412 218 466 226 C514 234 548 258 560 292 C568 318 560 344 530 364 C470 404 362 432 262 444 C206 450 162 446 142 430 Z"
                fill="url(#heroVelvetSheen)"
              />

              <path
                d="M176 392 C206 330 262 282 322 262 C362 250 404 248 442 256"
                stroke="#ffffff"
                strokeOpacity="0.16"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M186 404 C214 352 268 312 328 296 C372 286 412 286 448 294"
                stroke="#0f172a"
                strokeOpacity="0.22"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M248 318 C286 302 334 296 382 302 C418 306 448 318 462 334 C468 342 462 350 442 356 C392 370 322 372 272 360 C252 354 242 344 248 318 Z"
                fill="#101828"
                opacity="0.88"
              />

              <g filter="url(#heroGoldGlow)">
                <rect x="286" y="318" width="22" height="34" rx="8" fill="url(#heroGoldMetal)" />
                <rect x="332" y="318" width="22" height="34" rx="8" fill="url(#heroGoldMetal)" />
                <path
                  d="M308 334 C324 326 344 322 364 326 C378 328 392 334 404 342"
                  stroke="url(#heroGoldMetal)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M308 334 C324 326 344 322 364 326 C378 328 392 334 404 342"
                  stroke="url(#heroGoldEdge)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>

              <path
                d="M168 360 C214 286 286 242 360 232 C404 226 448 232 486 252"
                stroke="#ffffff"
                strokeOpacity="0.12"
                strokeWidth="2"
                strokeDasharray="5 8"
              />

              <path
                d="M520 300 C536 318 542 338 536 356 C528 378 498 396 452 408"
                stroke="#ffffff"
                strokeOpacity="0.08"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      <div className="hero-product-pedestal absolute inset-x-[12%] bottom-[8%] h-[14%]" />

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.95 }}
        className="absolute left-0 top-[18%] rounded-full border border-border bg-white/85 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-stone-600 shadow-[0_12px_32px_rgba(28,25,23,0.08)] backdrop-blur-md dark:bg-stone-900/80"
      >
        Live 3D Studio
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.05 }}
        className="absolute bottom-[28%] right-0 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-accent shadow-[0_12px_32px_rgba(201,169,98,0.12)]"
      >
        Premium Velvet
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.15 }}
        className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-stone-500 backdrop-blur-md dark:bg-stone-900/75"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Interactive 3D Preview
      </motion.div>
    </div>
  );
}
