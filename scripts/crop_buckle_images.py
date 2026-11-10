"""Crop buckle PNGs (black bg) to tight transparent assets."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\ORIGION\Downloads\remove-bg-20261011T202657Z-1-001\remove-bg")
OUT_FRONT = Path(r"C:\xampp\htdocs\custom-shoes\frontend\public\images\buckles")
OUT_BACK = Path(r"C:\xampp\htdocs\custom-shoes\backend\storage\app\public\images\buckles")

# Stable order by filename
FILES = sorted(SRC.glob("*.png"), key=lambda p: p.name.lower())

# Descriptive non-brand names for storefront
NAMES = [
    "Logo Plaque",
    "Medallion Mesh",
    "Twin Horsebit",
    "Chain Link Bar",
    "Classic Bit",
    "Ornate Crest",
    "Slim Metal Bar",
    "Double Ring",
    "Heritage Plate",
    "Studio Emblem",
]


def crop_to_alpha(img: Image.Image, pad: int = 12) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size

    # Near-black background -> transparent
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r < 28 and g < 28 and b < 28:
                pixels[x, y] = (r, g, b, 0)
            elif r < 45 and g < 45 and b < 45:
                # soft edge fade
                pixels[x, y] = (r, g, b, max(0, min(255, int((max(r, g, b) - 20) * 8))))

    bbox = rgba.getbbox()
    if not bbox:
        return rgba

    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(w, right + pad)
    bottom = min(h, bottom + pad)
    cropped = rgba.crop((left, top, right, bottom))

    # Normalize to consistent canvas (wide buckles)
    cw, ch = cropped.size
    target_w = 900
    target_h = 360
    scale = min(target_w / cw, target_h / ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    ox = (target_w - nw) // 2
    oy = (target_h - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas


def main() -> None:
    OUT_FRONT.mkdir(parents=True, exist_ok=True)
    OUT_BACK.mkdir(parents=True, exist_ok=True)

    if len(FILES) == 0:
        raise SystemExit(f"No PNGs in {SRC}")

    print(f"Found {len(FILES)} images")
    for index, src in enumerate(FILES[:10], start=1):
        slug = f"buckle-{index:02d}"
        out_name = f"buckle_{index:02d}.png"
        img = Image.open(src)
        cropped = crop_to_alpha(img)
        front_path = OUT_FRONT / out_name
        back_path = OUT_BACK / out_name
        cropped.save(front_path, "PNG", optimize=True)
        cropped.save(back_path, "PNG", optimize=True)
        name = NAMES[index - 1] if index <= len(NAMES) else f"Buckle {index}"
        print(f"{index:02d} {src.name} -> {out_name} ({cropped.size[0]}x{cropped.size[1]}) [{name}|{slug}]")


if __name__ == "__main__":
    main()
