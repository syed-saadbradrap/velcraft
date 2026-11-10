"""
Integrate client covered + backless GLBs as full-mesh variants.

Body  = backless full shoe
Cover = covered full shoe (swapped via applyShoeTypeVisibility)
Sole/Inner = lightweight helpers (sole color targets Sole; optional)

Both meshes share the same scale/orientation.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"C:\xampp\htdocs\custom-shoes")
COVERED_SRC = Path(r"C:\Users\ORIGION\Downloads\white_mesh.glb")
BACKLESS_SRC = Path(r"C:\Users\ORIGION\Downloads\white_mesh (1).glb")
OUT_FE = ROOT / "frontend" / "public" / "models" / "shoes" / "studio-loafer" / "shoe.glb"
OUT_BE = ROOT / "backend" / "storage" / "app" / "public" / "models" / "shoes" / "studio-loafer" / "shoe.glb"
OUT_BLEND = ROOT / "assets" / "blender" / "studio_loafer_client.blend"
PREVIEW_DIR = ROOT / "assets" / "blender" / "previews" / "client_integrated"

TARGET_LENGTH = 0.280


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.objects):
        for block in list(coll):
            coll.remove(block)


def import_one(path: Path, name: str) -> bpy.types.Object:
    before = {o.name for o in bpy.data.objects}
    bpy.ops.import_scene.gltf(filepath=str(path))
    new = [o for o in bpy.data.objects if o.name not in before and o.type == "MESH"]
    if not new:
        raise RuntimeError(f"No mesh in {path}")
    if len(new) > 1:
        bpy.ops.object.select_all(action="DESELECT")
        for o in new:
            o.select_set(True)
        bpy.context.view_layer.objects.active = new[0]
        bpy.ops.object.join()
        obj = bpy.context.view_layer.objects.active
    else:
        obj = new[0]
    for o in list(bpy.data.objects):
        if o != obj and o.type != "MESH":
            bpy.data.objects.remove(o, do_unlink=True)
    obj.name = name
    if obj.data:
        obj.data.name = name
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def bbox(obj: bpy.types.Object):
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs = [c.x for c in corners]
    ys = [c.y for c in corners]
    zs = [c.z for c in corners]
    mn = Vector((min(xs), min(ys), min(zs)))
    mx = Vector((max(xs), max(ys), max(zs)))
    return mn, mx, mx - mn


def end_width(obj: bpy.types.Object, y: float) -> float:
    xs = []
    mat = obj.matrix_world
    for v in obj.data.vertices:
        w = mat @ v.co
        if abs(w.y - y) < 0.01:
            xs.append(w.x)
    if len(xs) < 4:
        return 999.0
    return max(xs) - min(xs)


def normalize(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    mn, mx, size = bbox(obj)
    scale = TARGET_LENGTH / max(size.x, size.y, size.z)
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    mn, mx, size = bbox(obj)
    # Put longest axis on Y
    axes = [("x", size.x), ("y", size.y), ("z", size.z)]
    axes.sort(key=lambda t: t[1], reverse=True)
    length_ax = axes[0][0]
    if length_ax == "x":
        obj.rotation_euler = (0, 0, math.radians(90))
    elif length_ax == "z":
        obj.rotation_euler = (math.radians(-90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    mn, mx, size = bbox(obj)
    # Ensure Z is height (larger than width typically close) — if X >> Z, rotate
    if size.x > size.z * 1.15 and size.x < size.y:
        obj.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    mn, mx, size = bbox(obj)
    # Toe at +Y (pointier end)
    if end_width(obj, mn.y + size.y * 0.03) < end_width(obj, mx.y - size.y * 0.03):
        obj.rotation_euler = (0, 0, math.radians(180))
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

    mn, mx, size = bbox(obj)
    center = (mn + mx) * 0.5
    obj.location -= Vector((center.x, center.y, mn.z))
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")


def make_mat(name: str, rgb, rough=0.72):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    mat.diffuse_color = (*rgb, 1.0)
    return mat


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def align_to(src: bpy.types.Object, target: bpy.types.Object) -> None:
    """Translate src so its bbox center/ground matches target."""
    sn, sx, ss = bbox(src)
    tn, tx, ts = bbox(target)
    sc = (sn + sx) * 0.5
    tc = (tn + tx) * 0.5
    src.location += Vector((tc.x - sc.x, tc.y - sc.y, tn.z - sn.z))
    bpy.ops.object.select_all(action="DESELECT")
    src.select_set(True)
    bpy.context.view_layer.objects.active = src
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)


def make_proxy_sole(body: bpy.types.Object, mat):
    """Thin sole plate under body — only for sole-color channel; kept subtle."""
    mn, mx, size = bbox(body)
    bpy.ops.mesh.primitive_cube_add(size=1)
    sole = bpy.context.active_object
    sole.name = "Sole"
    sole.data.name = "Sole"
    sole.scale = (size.x * 0.98 / 2, size.y * 0.98 / 2, 0.0035)
    sole.location = ((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z + 0.002)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
    assign(sole, mat)
    # slightly hide under body: push down a hair
    sole.location.z -= 0.0015
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    return sole


def make_proxy_inner(body: bpy.types.Object, mat):
    """Tiny inner marker so material pipeline has an Inner target (mostly occluded)."""
    mn, mx, size = bbox(body)
    bpy.ops.mesh.primitive_cube_add(size=1)
    inner = bpy.context.active_object
    inner.name = "Inner"
    inner.data.name = "Inner"
    inner.scale = (size.x * 0.35 / 2, size.y * 0.35 / 2, 0.002)
    inner.location = ((mn.x + mx.x) / 2, (mn.y + mx.y) / 2 - size.y * 0.05, mn.z + size.z * 0.2)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
    assign(inner, mat)
    return inner


def export_glb(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for name in ("Body", "Cover", "Sole", "Inner"):
        o = bpy.data.objects.get(name)
        if o:
            o.select_set(True)
            bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        use_selection=True,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_materials="EXPORT",
    )
    print("WROTE", path, path.stat().st_size)


def previews() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_WORKBENCH"
    except Exception:
        pass
    scene.render.resolution_x = 900
    scene.render.resolution_y = 700
    scene.render.film_transparent = True
    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    light_data = bpy.data.lights.new("Light", "AREA")
    light_data.energy = 280
    light = bpy.data.objects.new("Light", light_data)
    bpy.context.collection.objects.link(light)

    body = bpy.data.objects.get("Body")
    cover = bpy.data.objects.get("Cover")

    def shoot(prefix: str, show_cover: bool):
        if body:
            body.hide_render = show_cover
            body.hide_viewport = show_cover
        if cover:
            cover.hide_render = not show_cover
            cover.hide_viewport = not show_cover
        pts = []
        for o in bpy.data.objects:
            if o.type == "MESH" and not o.hide_render and o.name in ("Body", "Cover", "Sole"):
                pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
        if not pts:
            return
        mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
        mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        center = (mn + mx) * 0.5
        diag = max((mx - mn).x, (mx - mn).y, (mx - mn).z)
        light.location = center + Vector((diag, -diag, diag))
        views = {
            "side": (Vector((center.x + diag * 1.7, center.y, center.z + diag * 0.1)), center),
            "threeq": (Vector((center.x + diag * 1.05, center.y - diag * 1.05, center.z + diag * 0.4)), center),
            "rear": (Vector((center.x, center.y + diag * 1.7, center.z + diag * 0.15)), center),
        }
        for name, (loc, tgt) in views.items():
            cam.location = loc
            cam.rotation_euler = (tgt - loc).to_track_quat("-Z", "Y").to_euler()
            scene.render.filepath = str(PREVIEW_DIR / f"{prefix}_{name}.png")
            bpy.ops.render.render(write_still=True)
            print("PREVIEW", scene.render.filepath)

    shoot("backless", False)
    shoot("covered", True)
    if body:
        body.hide_render = False
        body.hide_viewport = False
    if cover:
        cover.hide_render = False
        cover.hide_viewport = False


def main() -> None:
    clear_scene()
    body = import_one(BACKLESS_SRC, "Body")
    cover = import_one(COVERED_SRC, "Cover")
    normalize(body)
    normalize(cover)
    align_to(cover, body)

    body_mat = make_mat("BodyMat", (0.96, 0.96, 0.95), 0.74)
    cover_mat = make_mat("CoverMat", (0.96, 0.96, 0.95), 0.74)
    sole_mat = make_mat("SoleMat", (0.08, 0.08, 0.08), 0.5)
    inner_mat = make_mat("InnerMat", (0.95, 0.95, 0.94), 0.82)

    assign(body, body_mat)
    assign(cover, cover_mat)
    for o in (body, cover):
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True)
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.shade_smooth()

    sole = make_proxy_sole(body, sole_mat)
    inner = make_proxy_inner(body, inner_mat)

    # Custom property so frontend can detect full-variant swap
    cover["fullShoeVariant"] = 1
    body["fullShoeVariant"] = 1

    OUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
    export_glb(OUT_FE)
    export_glb(OUT_BE)
    previews()
    print("FINAL", [(o.name, len(o.data.vertices)) for o in bpy.data.objects if o.type == "MESH"])
    for o in (body, cover):
        mn, mx, size = bbox(o)
        print(o.name, "size", [round(size.x, 4), round(size.y, 4), round(size.z, 4)])


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("FAILED:", e, file=sys.stderr)
        raise
