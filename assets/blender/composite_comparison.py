"""Side-by-side reference vs model render sheets + remaining differences report."""
from __future__ import annotations

import json
import os

from PIL import Image, ImageDraw

payload = json.loads(os.environ.get("VELCRAFT_COMPOSITE_JSON", "{}"))
OUT_DIR = payload.get("out_dir", "")
rendered = payload.get("rendered", {})
refs = payload.get("refs", {})
revision = payload.get("revision", "revision-01")

DIFFERENCES = """# Remaining differences — {revision}

Compare each `compare_*.png` panel (Reference | Blender Render).

## Revision 27 fixes applied

- Sleeker almond toe tip (reduced front bulge)
- Extended wall flare for softer side silhouette
- Buckle hardware seat bump on upper flap
- Denser footbed grid (12 lateral slices)
- Expanded heel-pad zone + tighter side ortho

## Remaining gaps vs reference

1. **Overall silhouette** — Procedural loft still reads flatter/angular than real suede volume.
2. **Almond toe** — Improved curve tables; toe may still look slightly sharp in orthographic views.
3. **Moc-toe piping** — Raised tubes present; reference piping is softer and more integrated.
4. **Upper flap** — Width/position calibrated; curvature still simplified (flat grid vs real leather fold).
5. **Side profile** — Profile table from photo; instep height may need ±2mm tweak.
6. **Heel opening** — Backless rim modeled; opening curve not yet identical to reference.
7. **Sole** — Thin sole + heel lift; black edge visibility depends on render angle.
8. **Insole** — Footbed contour approximate; logo is placeholder block not brand artwork.
9. **Buckle** — Horsebit block-out at photo position; lacks full luxury hardware refinement.
10. **Material** — Clay render for shape review; no suede nap/velvet sheen yet.

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
"""


def load_fit(path: str, size: tuple[int, int]) -> Image.Image:
    img = Image.open(path).convert("RGB")
    img.thumbnail(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (210, 206, 198))
    ox = (size[0] - img.width) // 2
    oy = (size[1] - img.height) // 2
    canvas.paste(img, (ox, oy))
    return canvas


def label(img: Image.Image, text: str) -> Image.Image:
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, img.width, 36), fill=(20, 18, 16))
    draw.text((12, 10), text, fill=(230, 220, 200))
    return img


def pair(model_path: str, ref_path: str | None, title: str) -> Image.Image:
    cell = (480, 480)
    left = label(load_fit(model_path, cell), f"Blender Render — {title}")
    if ref_path and os.path.exists(ref_path):
        right = label(load_fit(ref_path, cell), f"Reference Photo — {title}")
    else:
        right = Image.new("RGB", cell, (180, 176, 168))
        right = label(right, f"Reference Photo — {title} (missing)")
    sheet = Image.new("RGB", (cell[0] * 2 + 20, cell[1] + 10), (30, 28, 26))
    sheet.paste(left, (0, 5))
    sheet.paste(right, (cell[0] + 20, 5))
    return sheet


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    order = [
        ("front", "Front", refs.get("front")),
        ("left", "Left", refs.get("left")),
        ("right", "Right", refs.get("right")),
        ("top", "Top", refs.get("top")),
        ("perspective", "Perspective", refs.get("perspective")),
    ]
    rows = []
    for key, title, ref in order:
        model_path = rendered.get(key)
        if not model_path or not os.path.exists(model_path):
            continue
        sheet = pair(model_path, ref, title)
        out = os.path.join(OUT_DIR, f"compare_{key}.png")
        sheet.save(out)
        rows.append(sheet)
        print("SAVED", out)

    if rows:
        w = max(r.width for r in rows)
        h = sum(r.height + 12 for r in rows) + 48
        grid = Image.new("RGB", (w, h), (24, 22, 20))
        draw = ImageDraw.Draw(grid)
        draw.rectangle((0, 0, w, 40), fill=(18, 16, 14))
        draw.text((12, 12), f"{revision} — Reference Photo | Blender Render (DRAFT)", fill=(240, 230, 210))
        y = 48
        for r in rows:
            grid.paste(r, (0, y))
            y += r.height + 12
        grid_path = os.path.join(OUT_DIR, f"comparison_sheet_{revision}.png")
        grid.save(grid_path)
        print("SAVED", grid_path)

    diff_path = os.path.join(OUT_DIR, "REMAINING_DIFFERENCES.md")
    with open(diff_path, "w", encoding="utf-8") as fh:
        fh.write(DIFFERENCES.format(revision=revision))
    print("SAVED", diff_path)


if __name__ == "__main__":
    main()
