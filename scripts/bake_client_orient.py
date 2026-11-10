"""Bake the client studio-loafer GLB (Body = backless, Cover = covered, thin Sole).

Raw client meshes (measured with inspect_client_raw_axes.py): length = X with toe at +X
(heel counter of the covered mesh sits at -X), width = Y, up = +Z (flat sole faces -Z).
Width and height are almost equal, so the axes are fixed explicitly instead of guessed
from bounding-box sizes.

Blender target before export: width = X, length = +Y with toe at +Y, height = Z, min Z = 0.
export_yup maps that to glTF: X width, Y up, toe at -Z.
"""
import bpy
import bmesh
from mathutils import Vector
from pathlib import Path

OUT_FE = Path(r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\studio-loafer\shoe.glb")
OUT_BE = Path(r"C:\xampp\htdocs\custom-shoes\backend\storage\app\public\models\shoes\studio-loafer\shoe.glb")
COVERED = Path(r"C:\Users\ORIGION\Downloads\white_mesh.glb")
BACKLESS = Path(r"C:\Users\ORIGION\Downloads\white_mesh (1).glb")
TARGET_LENGTH = 0.28
SOLE_THICKNESS = 0.004
SOLE_EMBED = 0.0015
SOLE_CONTACT = 0.003
SOLE_INSET = 0.0015
SOLE_END_TRIM = 0.006
SOLE_ROWS = 90
SOLE_COLS = 12

bpy.ops.wm.read_factory_settings(use_empty=True)


def load(path, name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    for o in new:
        if o != obj and o.name in bpy.data.objects:
            bpy.data.objects.remove(o, do_unlink=True)
    obj.parent = None
    obj.name = name
    obj.data.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def bounds(obj):
    cs = [v.co for v in obj.data.vertices]
    mn = Vector((min(c.x for c in cs), min(c.y for c in cs), min(c.z for c in cs)))
    mx = Vector((max(c.x for c in cs), max(c.y for c in cs), max(c.z for c in cs)))
    return mn, mx


def edit_verts(obj, fn):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for v in bm.verts:
        v.co = fn(v.co)
    bm.normal_update()
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def raw_to_blender(co):
    # Proper rotation (+90 deg about Z): raw +X toe -> +Y, raw Y width -> -X, Z stays up.
    return Vector((-co.y, co.x, co.z))


body = load(BACKLESS, "Body")
cover = load(COVERED, "Cover")

for o in (body, cover):
    edit_verts(o, raw_to_blender)

mn, mx = bounds(body)
scale = TARGET_LENGTH / (mx.y - mn.y)
center = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, 0.0))
for o in (body, cover):
    edit_verts(o, lambda c: (c - center) * scale)

# Ground both meshes on the same floor (they differ by < 1 mm in the raw files).
floor = min(bounds(body)[0].z, bounds(cover)[0].z)
for o in (body, cover):
    edit_verts(o, lambda c: Vector((c.x, c.y, c.z - floor)))


def build_sole(*srcs):
    """Smooth thin sole traced from the overlap of the meshes' contact outlines (follows toe spring)."""
    clouds = [[v.co.copy() for v in s.data.vertices] for s in srcs]
    y0 = max(bounds(s)[0].y for s in srcs) + SOLE_END_TRIM
    y1 = min(bounds(s)[1].y for s in srcs) - SOLE_END_TRIM
    half = (y1 - y0) / SOLE_ROWS
    rows = []
    for i in range(SOLE_ROWS):
        y = y0 + (y1 - y0) * (i + 0.5) / SOLE_ROWS
        spans = []
        for cos in clouds:
            band = [c for c in cos if abs(c.y - y) <= half]
            if not band:
                break
            zmin = min(c.z for c in band)
            foot = [c for c in band if c.z < zmin + SOLE_CONTACT]
            spans.append((min(c.x for c in foot), max(c.x for c in foot), zmin))
        if len(spans) != len(clouds):
            continue
        rows.append([y, max(s[0] for s in spans), min(s[1] for s in spans), max(s[2] for s in spans)])

    def smooth(idx):
        vals = [r[idx] for r in rows]
        out = []
        for i in range(len(vals)):
            win = vals[max(0, i - 2): i + 3]
            out.append(sum(win) / len(win))
        for r, v in zip(rows, out):
            r[idx] = v

    for idx in (1, 2, 3):
        smooth(idx)

    bm = bmesh.new()
    top, bot = [], []
    for y, x0, x1, z in rows:
        x0 += SOLE_INSET
        x1 -= SOLE_INSET
        if x1 - x0 < 0.002:
            cx = (x0 + x1) / 2
            x0, x1 = cx - 0.001, cx + 0.001
        zt = z + SOLE_EMBED
        zb = zt - SOLE_THICKNESS
        top.append([bm.verts.new((x0 + (x1 - x0) * j / (SOLE_COLS - 1), y, zt)) for j in range(SOLE_COLS)])
        bot.append([bm.verts.new((x0 + (x1 - x0) * j / (SOLE_COLS - 1), y, zb)) for j in range(SOLE_COLS)])
    n = len(rows)
    for i in range(n - 1):
        for j in range(SOLE_COLS - 1):
            bm.faces.new((top[i][j], top[i][j + 1], top[i + 1][j + 1], top[i + 1][j]))
            bm.faces.new((bot[i][j], bot[i + 1][j], bot[i + 1][j + 1], bot[i][j + 1]))
    ring_top = [top[0][j] for j in range(SOLE_COLS)] + [top[i][-1] for i in range(1, n)] + \
        [top[-1][j] for j in range(SOLE_COLS - 2, -1, -1)] + [top[i][0] for i in range(n - 2, 0, -1)]
    ring_bot = [bot[0][j] for j in range(SOLE_COLS)] + [bot[i][-1] for i in range(1, n)] + \
        [bot[-1][j] for j in range(SOLE_COLS - 2, -1, -1)] + [bot[i][0] for i in range(n - 2, 0, -1)]
    for k in range(len(ring_top)):
        a, b = ring_top[k], ring_top[(k + 1) % len(ring_top)]
        c, d = ring_bot[(k + 1) % len(ring_bot)], ring_bot[k]
        bm.faces.new((a, b, c, d))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new("Sole")
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("Sole", me)
    bpy.context.collection.objects.link(obj)
    return obj


sole = build_sole(body, cover)

# Sole bottom becomes the ground plane.
lift = -bounds(sole)[0].z
for o in (body, cover, sole):
    edit_verts(o, lambda c: Vector((c.x, c.y, c.z + lift)))


def mat(name, rgb, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    return m


for o, m in (
    (body, mat("BodyMat", (0.96, 0.96, 0.95), 0.74)),
    (cover, mat("CoverMat", (0.96, 0.96, 0.95), 0.74)),
    (sole, mat("SoleMat", (0.08, 0.08, 0.08), 0.6)),
):
    o.data.materials.clear()
    o.data.materials.append(m)
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    if o is not sole:
        bpy.ops.object.shade_smooth()
        o["fullShoeVariant"] = True

for o in (body, cover, sole):
    mn, mx = bounds(o)
    s = mx - mn
    print(f"{o.name}: W,L,H = {s.x:.4f}, {s.y:.4f}, {s.z:.4f}  min={tuple(round(v, 4) for v in mn)}  "
          f"max={tuple(round(v, 4) for v in mx)}  verts={len(o.data.vertices)}")

bmn, bmx = bounds(body)
bs = bmx - bmn
assert abs(bs.y - TARGET_LENGTH) < 1e-3, "length must be on Blender Y"
assert 0.07 < bs.x < 0.11 and 0.07 < bs.z < 0.11, "width/height out of range"


def end_height(obj, toe):
    vs = [v.co for v in obj.data.vertices]
    mn, mx = bounds(obj)
    band = 0.25 * (mx.y - mn.y)
    sel = [c.z for c in vs if (c.y > mx.y - band if toe else c.y < mn.y + band)]
    return max(sel)


toe_h, heel_h = end_height(cover, True), end_height(cover, False)
print(f"Cover toe-quarter max Z {toe_h:.4f}, heel-quarter max Z {heel_h:.4f}")
assert heel_h > toe_h, "covered heel counter should be at -Y (toe at +Y)"

for path in (OUT_FE, OUT_BE):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in (body, cover, sole):
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(path), use_selection=True, export_format="GLB", export_apply=True,
        export_yup=True, export_normals=True, export_materials="EXPORT", export_extras=True,
    )
    print("WROTE", path, path.stat().st_size)

bpy.ops.wm.save_as_mainfile(filepath=r"C:\xampp\htdocs\custom-shoes\assets\blender\studio_loafer_client.blend")
print("DONE")
