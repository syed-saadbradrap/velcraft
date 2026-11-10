# Remaining differences — revision-10

Compare each `compare_*.png` panel (Reference | Blender Render).

## Revision 10 fixes applied

- Footbed retopo: longitudinal Y×X grid (eliminates polar radial fan)
- Footbed Z tuned for grid-based heel-to-toe progression
- Inner subsurf×1 (stable tri budget, no heavy decimation)
- Retains rev9 sole chamfer + buckle ring stubs

## Build stats

- Triangles: **37,068** (within 25k–40k target, no decimation needed)
- Bounds: **103 × 270 × 49 mm**
- Buckle anchor: `(0.031, 0.0315)`
- Meshes: Body, Upper, Inner, Sole, Buckle, Logo

## Remaining gaps vs reference

1. **Overall silhouette** — Rev8 sleek profile retained; suede organic softness still procedural.
2. **Almond toe** — Rounded footprint from rev7–8.
3. **Moc-toe piping** — Soft integrated seam.
4. **Upper flap** — Lower crown from rev8.
5. **Side profile** — Sleek camel-side curve from rev8.
6. **Heel opening** — U-curve present; not photo-identical.
7. **Sole** — Chamfered edge + welt lip from rev9.
8. **Insole** — Grid footbed; rectangular footprint vs oval sole edge at toe/heel.
9. **Buckle** — Ring stubs; full luxury horsebit refinement pending.
10. **Material** — Clay render; no suede nap/velvet sheen.
11. **Camera mapping** — Front ortho vs reference 3/4 photo (known mismatch).

## Reference photo mapping

| View | Reference file |
|---|---|
| Front | ivory-gold-bit-mule-primary.png (approx.) |
| Left | camel-suede-mule-side.png |
| Right | camel-suede-mule-side.png (mirrored product) |
| Top | black-suede-mule-top.png |
| Perspective | ivory-gold-bit-mule-primary.png |

## Status

**DRAFT — awaiting your approval.** No production GLB. No website integration.
