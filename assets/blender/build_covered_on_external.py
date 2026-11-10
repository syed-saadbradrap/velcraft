"""
Covered style from reference photo (covered-loafer-top.png).

Builds a photo-like low heel cup + collar DECK (solid leather band around
an oval opening) so top view matches the white covered loafer — not a tall box.
"""
from __future__ import annotations

import bmesh
import bpy
import math
import os
import shutil
from mathutils import Vector

ROOT = r"C:\xampp\htdocs\custom-shoes\assets\blender"
PUBLIC_GLB = r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\ivory-gold-bit-mule\shoe.glb"
DRAFT_GLB = os.path.join(ROOT, "draft", "shoe-covered-external.glb")
DRAFT_BLEND = os.path.join(ROOT, "draft", "shoe-covered-external.blend")
BACKUP_GLB = os.path.join(ROOT, "draft", "shoe-body-backup.glb")


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def lerp(a, b, t):
    return a + (b - a) * max(0.0, min(1.0, t))


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a) if b != a else 0.0))
    return t * t * (3.0 - 2.0 * t)


def make_material(name, color, roughness=0.72, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color[:3], 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat


def import_body() -> bpy.types.Object:
    if not os.path.exists(BACKUP_GLB):
        shutil.copy2(PUBLIC_GLB, BACKUP_GLB)
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=BACKUP_GLB)
    added = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for obj in added:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = added[0]
    if len(added) > 1:
        bpy.ops.object.join()
    body = bpy.context.view_layer.objects.active
    body.name = "Body"
    body.data.name = "Body"
    return body


def bounds(obj):
    coords = [obj.matrix_world @ v.co for v in obj.data.vertices]
    xs = [c.x for c in coords]
    ys = [c.y for c in coords]
    zs = [c.z for c in coords]
    return min(xs), max(xs), min(ys), max(ys), min(zs), max(zs)


def world_verts(body):
    return [body.matrix_world @ v.co for v in body.data.vertices]


def half_width_at_y(coords, y, tol, cx):
    band = [c for c in coords if abs(c.y - y) <= tol]
    if not band:
        return None
    return max(abs(c.x - cx) for c in band)


def create_cover(body: bpy.types.Object) -> bpy.types.Object:
    """Photo-matched covered loafer rear: outer shell + collar deck + black lining."""
    coords = world_verts(body)
    xmin, xmax, ymin, ymax, zmin, zmax = bounds(body)
    cx = (xmin + xmax) * 0.5
    length = ymax - ymin
    width = xmax - xmin
    height = zmax - zmin

    # Photo proportions (top view):
    # - opening is an oval in the rear half
    # - leather band wraps fully around heel
    # - low collar (not boot height)
    y_join = ymin + length * 0.55
    y_heel = ymin + length * 0.02
    # Inner opening oval (foot hole) — calibrated to reference photo
    open_cy = ymin + length * 0.28
    open_rx = width * 0.28
    open_ry = length * 0.16

    z_collar = zmin + height * 0.38  # low like photo
    z_collar_side = zmin + height * 0.42
    z_bot = zmin + height * 0.02
    wall_t = width * 0.04
    segs = 80

    # --- Outer path: body silhouette from left join → heel → right join ---
    outer_pts = []
    for i in range(segs):
        t = i / (segs - 1)
        if t < 0.20:
            u = t / 0.20
            y = lerp(y_join, y_heel + width * 0.20, u)
            hw = half_width_at_y(coords, y, length * 0.012, cx) or (width * 0.48)
            x = cx - (hw + width * 0.008)
        elif t > 0.80:
            u = (t - 0.80) / 0.20
            y = lerp(y_heel + width * 0.20, y_join, u)
            hw = half_width_at_y(coords, y, length * 0.012, cx) or (width * 0.48)
            x = cx + (hw + width * 0.008)
        else:
            u = (t - 0.20) / 0.60
            a = math.pi + u * math.pi
            y_mid = ymin + length * 0.12
            hw_mid = half_width_at_y(coords, y_mid, length * 0.02, cx) or (width * 0.45)
            rx = hw_mid + width * 0.008
            ry = max(width * 0.15, y_mid - y_heel)
            x = cx + math.cos(a) * rx
            y = max(y_heel + ry + math.sin(a) * ry, ymin + length * 0.003)

        hw = half_width_at_y(coords, y, length * 0.011, cx)
        if hw is not None and abs(x - cx) > 1e-6:
            target = cx + math.copysign(hw + width * 0.008, x - cx)
            tip = smoothstep(y_join - length * 0.12, y_heel, y)
            x = lerp(x, target, 0.88 - 0.35 * tip)

        side = abs(x - cx) / max(width * 0.5, 1e-6)
        z = lerp(z_collar, z_collar_side, side)
        # slight dip at center-back topline
        if abs(x - cx) < width * 0.12 and y < ymin + length * 0.18:
            z *= 0.94
        outer_pts.append(Vector((x, y, z)))

    # --- Inner path: oval opening (photo foot hole), same segs parameterization ---
    inner_pts = []
    for i in range(segs):
        t = i / (segs - 1)
        # Map U parameter to oval angle: start left-forward, around heel, to right-forward
        # Photo opening faces forward — oval center open_cy, rear is -Y
        a = math.pi * (0.5 + t)  # 90° → 270°+... use full rear-biased oval
        # Better: angle from +Y around through -Y
        a = math.radians(100 + t * 260)  # 100° → 360°
        x = cx + math.cos(a) * open_rx
        y = open_cy + math.sin(a) * open_ry
        # Keep inner opening forward of extreme heel (leather band behind)
        y = max(y, ymin + length * 0.10)
        # At join ends, pull inner toward body opening so deck meets mule walls
        end = min(t, 1.0 - t) * 2.0
        if end < 0.22:
            blend = 1.0 - end / 0.22
            x = lerp(x, outer_pts[i].x * 0.55, blend * 0.35)
            y = lerp(y, y_join - length * 0.02, blend * 0.55)
        z = outer_pts[i].z * 0.98
        inner_pts.append(Vector((x, y, z)))

    bm = bmesh.new()
    # Collar deck (TOP VIEW solid leather band) — this is what matches the photo
    ov = [bm.verts.new(p) for p in outer_pts]
    iv = [bm.verts.new(p) for p in inner_pts]
    for i in range(segs - 1):
        bm.faces.new((ov[i], ov[i + 1], iv[i + 1], iv[i]))

    # Outer wall down to sole (closed heel cup)
    rows = 8
    wall_outer = [ov]
    for r in range(1, rows):
        rt = r / (rows - 1)
        row = []
        for i, p in enumerate(outer_pts):
            z = lerp(p.z, z_bot, rt ** 0.9)
            # slight tuck at bottom toward sole
            s = 1.0 - 0.03 * rt
            x = cx + (p.x - cx) * s
            y = p.y
            row.append(bm.verts.new((x, y, z)))
        wall_outer.append(row)
    for r in range(rows - 1):
        for i in range(segs - 1):
            bm.faces.new((
                wall_outer[r][i], wall_outer[r + 1][i],
                wall_outer[r + 1][i + 1], wall_outer[r][i + 1],
            ))

    # Inner lining wall (short drop into cavity — black)
    rows_in = 5
    wall_inner = [iv]
    for r in range(1, rows_in):
        rt = r / (rows_in - 1)
        row = []
        for i, p in enumerate(inner_pts):
            z = lerp(p.z, z_bot + height * 0.08, rt)
            s = 1.0 - 0.04 * rt
            x = cx + (p.x - cx) * s
            y = open_cy + (p.y - open_cy) * s
            row.append(bm.verts.new((x, y, z)))
        wall_inner.append(row)
    for r in range(rows_in - 1):
        for i in range(segs - 1):
            bm.faces.new((
                wall_inner[r][i], wall_inner[r][i + 1],
                wall_inner[r + 1][i + 1], wall_inner[r + 1][i],
            ))

    # Cap join ends (outer wall only — avoid duplicate-vert seals with shorter inner)
    for r in range(rows - 1):
        try:
            bm.faces.new((
                wall_outer[r][0], wall_outer[r][1],
                wall_outer[r + 1][1], wall_outer[r + 1][0],
            ))
        except ValueError:
            pass
        try:
            bm.faces.new((
                wall_outer[r][-1], wall_outer[r + 1][-1],
                wall_outer[r + 1][-2], wall_outer[r][-2],
            ))
        except ValueError:
            pass

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new("Cover")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new("Cover", mesh)
    bpy.context.collection.objects.link(obj)

    # White pebbled leather look (color; grain comes from viewer fabric later)
    outer_mat = make_material("Cover_Outer", (0.96, 0.96, 0.95), 0.82, 0.0)
    lining = make_material("Cover_Lining", (0.04, 0.04, 0.04), 0.40, 0.0)
    obj.data.materials.append(outer_mat)
    obj.data.materials.append(lining)
    for poly in obj.data.polygons:
        c = Vector((0, 0, 0))
        for idx in poly.vertices:
            c += obj.data.vertices[idx].co
        c /= max(1, len(poly.vertices))
        n = poly.normal
        # Inner wall / underside → black lining like photo
        toward = Vector((cx - c.x, open_cy - c.y, 0.0))
        if toward.length > 1e-8 and n.dot(toward.normalized()) > 0.15:
            poly.material_index = 1
        elif n.z < -0.25:
            poly.material_index = 1
        elif c.z < z_collar * 0.85 and abs(c.x - cx) < open_rx * 1.1:
            # lower inner region
            if math.hypot(c.x - cx, c.y - open_cy) < open_rx * 1.35:
                poly.material_index = 1

    mod = obj.modifiers.new("Subdivision", "SUBSURF")
    mod.levels = 1
    mod.render_levels = 1
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
    except RuntimeError:
        pass
    bpy.ops.object.shade_smooth()
    obj.select_set(False)
    return obj


def export(objects):
    os.makedirs(os.path.dirname(DRAFT_GLB), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=DRAFT_BLEND)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=DRAFT_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
    )
    shutil.copy2(DRAFT_GLB, PUBLIC_GLB)
    shutil.copy2(DRAFT_GLB, os.path.join(ROOT, "shoe.glb"))
    print("EXPORTED", DRAFT_GLB)
    for o in objects:
        xmin, xmax, ymin, ymax, zmin, zmax = bounds(o)
        print(
            f"{o.name}: x=({xmin:.3f},{xmax:.3f}) y=({ymin:.3f},{ymax:.3f}) "
            f"z=({zmin:.3f},{zmax:.3f}) h={zmax - zmin:.3f} verts={len(o.data.vertices)}"
        )


def main():
    clear_scene()
    body = import_body()
    if not body.data.materials:
        body.data.materials.append(make_material("Body_Material", (0.96, 0.96, 0.95), 0.82, 0.0))
    cover = create_cover(body)
    export([body, cover])


if __name__ == "__main__":
    main()
