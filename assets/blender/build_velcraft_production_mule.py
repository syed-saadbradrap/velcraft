"""
Velcraft Ivory Gold Bit Mule — covered + backless draft builder.

Photo-calibrated from ivory-gold-bit-mule + covered-loafer-top references.
Cover mesh is toggled in the web viewer (backless hides / covered shows).
Never export to website until APPROVED.txt exists.
"""
from __future__ import annotations

import bmesh
import bpy
import math
import os
from mathutils import Vector

OUTPUT_DIR = r"C:\xampp\htdocs\custom-shoes\assets\blender"
DRAFT_BLEND = os.path.join(OUTPUT_DIR, "draft", "shoe.blend")
DRAFT_GLB = os.path.join(OUTPUT_DIR, "draft", "shoe.glb")
REVISION = os.environ.get("VELCRAFT_REVISION", "revision-28")

# EU 42 ivory mule — metres (X width, Y toe+, Z up)
LENGTH = 0.270
WIDTH = 0.093
WALL_THICK = 0.0036
UPPER_THICK = 0.0018
SOLE_THICK = 0.0070
SOLE_LIP = 0.0012
HEEL_LIFT = 0.0098
PIPING_R = 0.00132
STITCH_R = 0.00021
STITCH_GAP = 0.00046

# Photo-measured from reference (Y metres from centre, toe ≈ +0.135)
FLAP_Y_FRONT = 0.016
FLAP_Y_BACK = 0.050
FLAP_PEAK_Y = 0.033
FLAP_HALF_W_FRONT = 0.027
FLAP_HALF_W_BACK = 0.035
MOC_CY = 0.078
MOC_RX = 0.037
MOC_RY = 0.025
BUCKLE_Y = 0.031
BUCKLE_Z = 0.0315
LOGO_Y = -0.092

# Side-profile — rev8: lower instep hump, sleeker camel-side curve
PROFILE_Y = [-0.132, -0.095, -0.055, -0.015, 0.025, 0.065, 0.105, 0.132]
PROFILE_Z = [0.011, 0.024, 0.039, 0.046, 0.049, 0.044, 0.030, 0.013]

# Footprint — rev7: blunter rounded toe (reference top view)
WIDTH_Y = [-0.130, -0.085, -0.035, 0.020, 0.070, 0.108, 0.132]
WIDTH_HW = [0.032, 0.044, 0.050, 0.051, 0.047, 0.038, 0.040]


def clear_scene() -> None:
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.objects, bpy.data.images):
        for item in list(block):
            block.remove(item, do_unlink=True)


def lerp(a, b, t):
    return a + (b - a) * max(0.0, min(1.0, t))


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a) if b != a else 0.0))
    return t * t * (3.0 - 2.0 * t)


def table_lerp(xs, ys, x):
    if x <= xs[0]:
        return ys[0]
    if x >= xs[-1]:
        return ys[-1]
    for i in range(len(xs) - 1):
        if xs[i] <= x <= xs[i + 1]:
            t = (x - xs[i]) / (xs[i + 1] - xs[i])
            return lerp(ys[i], ys[i + 1], t)
    return ys[-1]


def half_width_at(y: float) -> float:
    return table_lerp(WIDTH_Y, WIDTH_HW, y)


def wall_top_at(y: float, x_abs: float) -> float:
    base = table_lerp(PROFILE_Y, PROFILE_Z, y)
    edge = smoothstep(WIDTH * 0.10, WIDTH * 0.42, x_abs)
    base += 0.003 * edge * smoothstep(-0.05, 0.08, y)
    vol = smoothstep(WIDTH * 0.06, WIDTH * 0.38, x_abs) * smoothstep(-0.07, 0.06, y)
    base += 0.0018 * vol
    if -0.02 < y < 0.08:
        dip = smoothstep(-0.02, 0.035, y) * (1.0 - smoothstep(0.035, 0.08, y))
        base -= 0.002 * dip
    if y < -0.070:
        base += 0.0012 * smoothstep(WIDTH * 0.08, WIDTH * 0.36, x_abs)
    if y > 0.08:
        base -= 0.0010 * smoothstep(0.08, 0.12, y) * smoothstep(WIDTH * 0.06, WIDTH * 0.34, x_abs)
    if y > 0.095:
        base *= lerp(1.0, 0.48, smoothstep(0.095, 0.128, y))
    return max(SOLE_THICK + 0.003, base)


def footprint_point(angle: float) -> Vector:
    y = math.cos(angle) * LENGTH * 0.5
    hw = half_width_at(y)
    x = math.sin(angle) * hw
    if y > LENGTH * 0.04:
        t = (y - LENGTH * 0.04) / (LENGTH * 0.28)
        x *= max(0.82, 1.0 - 0.10 * t)
    if y < -LENGTH * 0.17:
        ht = abs(y + LENGTH * 0.17) / (LENGTH * 0.16)
        x *= 0.70 + 0.22 * (1.0 - ht)
    return Vector((x, y, 0.0))


def add_moc_apron(bm, z0):
    """Toe-box apron deck between moc seam and toe tip."""
    rows, cols = 9, 16
    z_base = z0 + wall_top_at(MOC_CY, 0.0) * 0.48
    grid = []
    y_front = LENGTH * 0.115
    y_back = MOC_CY - MOC_RY * 0.35
    for r in range(rows):
        row = []
        for c in range(cols):
            ty = r / (rows - 1)
            tx = (c / (cols - 1)) - 0.5
            y = lerp(y_front, y_back, ty)
            hw = lerp(MOC_RX * 0.62, MOC_RX * 1.02, ty ** 0.92)
            x = tx * hw * 2.0
            edge_blend = smoothstep(0.32, 0.50, abs(tx)) * smoothstep(0.0, 0.28, ty)
            dome = (1.0 - abs(tx) ** 1.05) * (1.0 - ty * 0.20)
            z = z_base + 0.0005 * dome * (1.0 - edge_blend * 0.70)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for r in range(rows - 1):
        for c in range(cols - 1):
            bm.faces.new((grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]))


def wall_flare(x: float, y: float, rt: float) -> tuple[float, float]:
    if rt < 0.40 or rt > 0.88:
        return x, y
    if abs(y) > 0.085:
        return x, y
    f = 0.0030 * math.sin((rt - 0.40) / 0.42 * math.pi)
    d = math.hypot(x, y)
    if d < 1e-6:
        return x, y
    return x + (x / d) * f, y + (y / d) * f * 0.35


def shrink_xy(x: float, y: float, amount: float) -> tuple[float, float]:
    d = math.hypot(x, y)
    if d < 1e-6:
        return x, y
    s = max(0.12, (d - amount) / d)
    return x * s, y * s


def toe_bulge(y: float, z: float, rt: float) -> tuple[float, float]:
    toe = max(0.0, (y - 0.008) / 0.072)
    if toe <= 0 or rt < 0.28:
        return 1.0, z
    t = min(1.0, toe ** 0.8) * ((rt - 0.28) / 0.72)
    dz = 0.0098 * t
    xs = 1.0 - 0.004 * t
    if y > 0.050 and rt > 0.74:
        dz += 0.0030 * smoothstep(0.050, 0.112, y) * ((rt - 0.74) / 0.26)
    if y > 0.080 and rt > 0.74:
        dz *= lerp(1.0, 0.82, smoothstep(0.080, 0.115, y))
    if y > 0.042 and rt > 0.62 and abs(y - MOC_CY) < MOC_RY * 1.15:
        dz += 0.0014 * smoothstep(0.62, 0.90, rt)
    return xs, z + dz


def opening_top_factor(y: float, x_abs: float, row_t: float) -> float:
    if row_t < 0.30:
        return 1.0
    if y > -0.022:
        return 1.0
    back = smoothstep(-0.022, -0.108, y)
    inside = 1.0 - smoothstep(WIDTH * 0.07, WIDTH * 0.24, x_abs)
    side_rim = 0.22 + 0.08 * smoothstep(WIDTH * 0.20, WIDTH * 0.38, x_abs)
    center_dip = smoothstep(WIDTH * 0.02, WIDTH * 0.16, x_abs)
    if y < -0.058:
        side_rim += 0.06 * (1.0 - center_dip)
    rim = side_rim
    center_u = smoothstep(-0.102, -0.048, y) * (1.0 - smoothstep(WIDTH * 0.03, WIDTH * 0.19, x_abs))
    rim = lerp(rim, 0.08, center_u * smoothstep(0.35, 0.88, row_t))
    return lerp(1.0, rim, back * inside * smoothstep(0.30, 0.90, row_t))


def mesh_from_bm(name, bm):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def add_subsurf(obj, levels):
    mod = obj.modifiers.new("Subdivision", "SUBSURF")
    mod.levels = levels
    mod.render_levels = levels


def apply_mods(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError:
            pass
    obj.select_set(False)


def smart_uv(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=55, island_margin=0.008)
    bpy.ops.object.mode_set(mode="OBJECT")
    obj.select_set(False)


def tube(bm, p0, p1, radius, sides=8):
    p0, p1 = Vector(p0), Vector(p1)
    d = (p1 - p0).normalized()
    up = Vector((0, 0, 1))
    if abs(d.dot(up)) > 0.92:
        up = Vector((1, 0, 0))
    r = d.cross(up).normalized()
    u = r.cross(d).normalized()

    def ring(c):
        return [bm.verts.new(c + r * math.cos(a) * radius + u * math.sin(a) * radius)
                for a in [((i / sides) * math.tau) for i in range(sides)]]

    a0, a1 = ring(p0), ring(p1)
    for i in range(sides):
        j = (i + 1) % sides
        try:
            bm.faces.new((a0[i], a0[j], a1[j], a1[i]))
        except ValueError:
            pass


def piping(bm, pts, radius=PIPING_R):
    for i in range(len(pts) - 1):
        tube(bm, pts[i], pts[i + 1], radius)


def stitch_pair(bm, pts, radius=STITCH_R):
    for i in range(len(pts) - 1):
        p0, p1 = Vector(pts[i]), Vector(pts[i + 1])
        n = (p1 - p0).normalized()
        perp = Vector((-n.y, n.x, 0.0))
        if perp.length > 1e-6:
            perp.normalize()
        else:
            perp = Vector((1, 0, 0))
        off = perp * STITCH_GAP
        tube(bm, p0 + off, p1 + off, radius, 6)
        tube(bm, p0 - off, p1 - off, radius, 6)


def solid_box(bm, x0, x1, y0, y1, z0, z1):
    c = [bm.verts.new((x, y, z)) for x, y, z in [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    ]]
    for f in ((0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
        bm.faces.new([c[i] for i in f])


def moc_curve(z):
    pts = []
    for i in range(33):
        t = i / 32
        a = math.pi * (0.16 + 0.68 * t)
        pts.append(Vector((math.cos(a) * MOC_RX, MOC_CY + math.sin(a) * MOC_RY, z)))
    return pts


def footbed_rt(y: float) -> float:
    return smoothstep(-LENGTH * 0.44, LENGTH * 0.40, y)


def footbed_z(x: float, y: float, rt: float) -> float:
    z0 = SOLE_THICK + 0.0030
    base = z0 + 0.0012 + (rt ** 1.05) * 0.0072
    ball = smoothstep(-0.02, 0.045, y) * (1.0 - smoothstep(WIDTH * 0.06, WIDTH * 0.36, abs(x)))
    base += ball * 0.0014
    arch = smoothstep(-0.04, 0.015, y) * (1.0 - smoothstep(0.015, 0.055, y))
    arch *= 1.0 - smoothstep(WIDTH * 0.04, WIDTH * 0.26, abs(x))
    base -= arch * 0.0008
    toe_lift = smoothstep(0.015, 0.095, y) * 0.0018
    heel = smoothstep(-0.025, -0.090, y) * smoothstep(WIDTH * 0.08, WIDTH * 0.32, abs(x)) * 0.0010
    return base + toe_lift + heel


def cap_wall_ring(bm, outer_row, inner_row, segs, skip_gap=False):
    for i in range(segs):
        j = (i + 1) % segs
        oy = (outer_row[i].co.y + outer_row[j].co.y) * 0.5
        ox = abs(outer_row[i].co.x)
        if skip_gap and heel_opening_gap(oy, ox):
            continue
        bm.faces.new((outer_row[i], outer_row[j], inner_row[j], inner_row[i]))


def heel_opening_gap(y: float, x_abs: float) -> bool:
    """True where the backless heel opening should remain uncapped."""
    return y < -0.070 and x_abs < WIDTH * 0.17


def cap_wall_shelves(bm, outer, inner, segs, rows):
    """Seal wall cavity at upper rows to hide interior geometry in perspective."""
    cap_wall_ring(bm, outer[-1], inner[-1], segs, skip_gap=True)
    for r in (1, 2, 3, 4, 5, 6, 7):
        for i in range(segs):
            j = (i + 1) % segs
            oy = (outer[r][i].co.y + outer[r][j].co.y) * 0.5
            ox = abs(outer[r][i].co.x)
            if oy > 0.008:
                bm.faces.new((outer[r][i], outer[r][j], inner[r][j], inner[r][i]))
            elif oy > 0.004:
                bm.faces.new((outer[r][i], outer[r][j], inner[r][j], inner[r][i]))
            elif oy > 0.0015:
                bm.faces.new((outer[r][i], outer[r][j], inner[r][j], inner[r][i]))
            elif oy > -0.052 or ox > WIDTH * 0.18:
                bm.faces.new((outer[r][i], outer[r][j], inner[r][j], inner[r][i]))


def create_sole():
    bm = bmesh.new()
    segs = 96
    ring = [bm.verts.new(footprint_point((i / segs) * math.tau)) for i in range(segs)]
    bm.faces.new(ring)
    ext = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    top = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert) and e.co.z > 0]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, SOLE_THICK))
    side = [v for v in bm.verts if SOLE_THICK * 0.12 < v.co.z < SOLE_THICK * 0.96]
    for v in side:
        fp = footprint_point(math.atan2(v.co.x, v.co.y if abs(v.co.y) > 1e-8 else 1e-8))
        d = math.hypot(v.co.x - fp.x, v.co.y - fp.y)
        if d < SOLE_LIP * 9:
            v.co.z += SOLE_LIP * 0.85
            push = 1.0 + SOLE_LIP * 0.35 / max(d, 1e-4)
            v.co.x = fp.x + (v.co.x - fp.x) * push
            v.co.y = fp.y + (v.co.y - fp.y) * push
        if v.co.y < -LENGTH * 0.12:
            t = min(1.0, abs(v.co.y + LENGTH * 0.12) / (LENGTH * 0.14))
            v.co.z -= HEEL_LIFT * t
    bottom = [v for v in bm.verts if v.co.z < SOLE_THICK * 0.06]
    for v in bottom:
        fp = footprint_point(math.atan2(v.co.x, v.co.y if abs(v.co.y) > 1e-8 else 1e-8))
        v.co.x = fp.x + (v.co.x - fp.x) * 0.988
        v.co.y = fp.y + (v.co.y - fp.y) * 0.988
    top_rim = [v for v in bm.verts if v.co.z > SOLE_THICK * 0.94]
    for v in top_rim:
        v.co.z += 0.00055
    edge_chamfer = [v for v in bm.verts if SOLE_THICK * 0.82 < v.co.z < SOLE_THICK * 1.08]
    for v in edge_chamfer:
        fp = footprint_point(math.atan2(v.co.x, v.co.y if abs(v.co.y) > 1e-8 else 1e-8))
        d = math.hypot(v.co.x - fp.x, v.co.y - fp.y)
        if d > SOLE_LIP * 2.5:
            v.co.z -= 0.00032
    obj = mesh_from_bm("Sole", bm)
    add_subsurf(obj, 1)
    return obj


def create_body():
    """Thick-walled side shell + moc-toe piping (rev2 volume)."""
    bm = bmesh.new()
    z0 = SOLE_THICK + 0.0012
    segs, rows = 80, 10
    outer, inner = [], []
    for r in range(rows):
        orow, irow = [], []
        rt = r / (rows - 1)
        for i in range(segs):
            fp = footprint_point((i / segs) * math.tau)
            x, y = fp.x, fp.y
            top_z = wall_top_at(y, abs(x))
            factor = opening_top_factor(y, abs(x), rt)
            z_out = z0 + (top_z - z0) * rt * factor
            xs, z_out = toe_bulge(y, z_out, rt)
            x *= xs
            x, y = wall_flare(x, y, rt)
            puff = smoothstep(WIDTH * 0.04, WIDTH * 0.34, abs(x)) * smoothstep(-0.05, 0.07, y) * 0.0022 * rt
            puff *= 1.0 + 0.18 * smoothstep(-0.02, 0.04, y)
            z_out += puff
            thick = WALL_THICK * (1.08 + 0.28 * rt)
            ix, iy = shrink_xy(x, y, thick)
            z_in = z_out - thick * 0.52
            orow.append(bm.verts.new((x, y, z_out)))
            irow.append(bm.verts.new((ix, iy, z_in)))
        outer.append(orow)
        inner.append(irow)

    for r in range(rows - 1):
        for i in range(segs):
            j = (i + 1) % segs
            bm.faces.new((outer[r][i], outer[r][j], outer[r + 1][j], outer[r + 1][i]))
            bm.faces.new((inner[r][j], inner[r][i], inner[r + 1][i], inner[r + 1][j]))

    for i in range(segs):
        j = (i + 1) % segs
        bm.faces.new((outer[0][i], outer[0][j], inner[0][j], inner[0][i]))

    cap_wall_shelves(bm, outer, inner, segs, rows)

    # Heel opening collar rim — soft U lip visible from back/perspective
    rim_pts = []
    for i in range(33):
        t = i / 32
        a = math.pi * (1.12 - 0.76 * t)
        y = -0.085 + math.cos(a) * 0.027
        x = math.sin(a) * WIDTH * 0.155
        z = z0 + wall_top_at(y, abs(x)) * 0.88 + 0.0016
        rim_pts.append(Vector((x, y, z)))
    piping(bm, rim_pts, PIPING_R * 0.58)

    z_pipe = z0 + wall_top_at(MOC_CY, MOC_RX) * 0.50 + 0.00145
    piping(bm, moc_curve(z_pipe), PIPING_R * 0.68)
    piping(bm, moc_curve(z_pipe + 0.00018), PIPING_R * 0.38)
    stitch_pair(bm, moc_curve(z_pipe - 0.00024), STITCH_R * 0.82)

    obj = mesh_from_bm("Body", bm)
    add_subsurf(obj, 1)
    return obj


def cover_wall_top(y: float, x_abs: float) -> float:
    """Full closed-heel collar height — photo covered loafer (closed behind, U opening)."""
    # Target collar ~45–50mm at sides, slightly lower at center back topline
    side = 0.049
    center = 0.044
    across = smoothstep(0.0, WIDTH * 0.28, x_abs)
    z = lerp(center, side, across)
    # Rise from join (near midfoot) toward heel, then soft drop at extreme heel tip
    along = smoothstep(0.010, -0.085, y)
    z *= 0.55 + 0.45 * along
    z += 0.006 * along * across
    if y < -0.095:
        z *= lerp(1.0, 0.88, smoothstep(-0.095, -0.125, y))
    return max(SOLE_THICK + 0.016, z)


def create_cover():
    """Closed heel counter for covered style. Object name 'Cover' drives viewer toggle."""
    bm = bmesh.new()
    z0 = SOLE_THICK + 0.0008
    # Wider rear arc so cover reads clearly from top + 3/4 views
    a_start = math.pi * 0.42
    a_end = math.pi * 1.58
    segs, rows = 56, 14
    outer, inner = [], []
    for r in range(rows):
        orow, irow = [], []
        rt = r / (rows - 1)
        for i in range(segs):
            a = lerp(a_start, a_end, i / (segs - 1))
            fp = footprint_point(a)
            x, y = fp.x, fp.y
            # Pull front of cover slightly inward so it meets body walls cleanly
            join = smoothstep(0.005, -0.070, y)
            # Inflate heel tip a touch for a fuller covered counter
            inflate = 1.0 + 0.035 * join * smoothstep(-0.040, -0.120, y)
            x *= inflate
            y = lerp(y, y - 0.004, join * rt * 0.35)
            top_z = cover_wall_top(y, abs(x))
            # Ease height near the side join so cover blends into body
            if y > -0.025:
                top_z = lerp(wall_top_at(y, abs(x)) * 0.92, top_z, smoothstep(0.010, -0.035, y))
            z_out = z0 + (top_z - z0) * (0.05 + 0.95 * (rt ** 0.92))
            # Leather counter belly
            belly = 0.0028 * math.sin(max(0.0, (rt - 0.12) / 0.88) * math.pi) * join
            d = math.hypot(x, y) or 1.0
            x += (x / d) * belly
            y += (y / d) * belly * 0.45
            thick = WALL_THICK * (1.35 + 0.35 * rt)
            ix, iy = shrink_xy(x, y, thick)
            z_in = z_out - thick * 0.48
            orow.append(bm.verts.new((x, y, z_out)))
            irow.append(bm.verts.new((ix, iy, z_in)))
        outer.append(orow)
        inner.append(irow)

    for r in range(rows - 1):
        for i in range(segs - 1):
            bm.faces.new((outer[r][i], outer[r][i + 1], outer[r + 1][i + 1], outer[r + 1][i]))
            bm.faces.new((inner[r][i + 1], inner[r][i], inner[r + 1][i], inner[r + 1][i + 1]))

    for i in range(segs - 1):
        bm.faces.new((outer[0][i], outer[0][i + 1], inner[0][i + 1], inner[0][i]))
        bm.faces.new((outer[-1][i], inner[-1][i], inner[-1][i + 1], outer[-1][i + 1]))

    for r in range(rows - 1):
        bm.faces.new((outer[r][0], inner[r][0], inner[r + 1][0], outer[r + 1][0]))
        bm.faces.new((outer[r][-1], outer[r + 1][-1], inner[r + 1][-1], inner[r][-1]))

    # Topline collar piping + double stitch (matches covered photo)
    rim = [outer[-1][i].co.copy() for i in range(segs)]
    piping(bm, rim, PIPING_R * 0.90)
    stitch_pair(bm, rim, STITCH_R * 0.90)
    rim_in = [inner[-1][i].co.copy() for i in range(segs)]
    piping(bm, rim_in, PIPING_R * 0.42)

    # Center-back heel seam
    mid = segs // 2
    seam = [outer[r][mid].co.copy() for r in range(2, rows)]
    stitch_pair(bm, seam, STITCH_R * 0.65)

    obj = mesh_from_bm("Cover", bm)
    add_subsurf(obj, 1)
    return obj


def create_upper():
    bm = bmesh.new()
    z_base = SOLE_THICK + wall_top_at(FLAP_PEAK_Y, 0.0) * 0.78
    rows, cols = 12, 20
    top_grid, bot_grid = [], []
    for r in range(rows):
        trow, brow = [], []
        for c in range(cols):
            ty = r / (rows - 1)
            tx = (c / (cols - 1)) - 0.5
            y = lerp(FLAP_Y_FRONT, FLAP_Y_BACK, ty ** 0.94)
            hw = lerp(FLAP_HALF_W_FRONT, FLAP_HALF_W_BACK, ty ** 0.78)
            hw *= 1.0 - 0.11 * abs(tx) ** 1.45
            x = tx * hw * 2.0
            peak = math.exp(-((y - FLAP_PEAK_Y) ** 2) / 0.0040 ** 2)
            edge_fall = 1.0 - 0.07 * abs(tx) ** 1.15
            crown = (1.0 - abs(tx) ** 0.80) * peak
            z_top = z_base + 0.0010 + peak * 0.0022 * edge_fall + crown * 0.0012
            z_top += (1.0 - abs(tx) ** 1.35) * peak * 0.0015
            z_top += math.sin(tx * math.pi) * 0.00085 * peak
            z_top -= 0.0007 * abs(tx) ** 2
            if abs(tx) > 0.30:
                z_top -= (abs(tx) - 0.30) * 0.0026 * peak
            if ty > 0.55:
                z_top += smoothstep(0.55, 0.92, ty) * (1.0 - abs(tx) ** 0.65) * 0.0016
            if ty < 0.22:
                z_top -= smoothstep(0.22, 0.0, ty) * abs(tx) * 0.0011
            if abs(y - BUCKLE_Y) < 0.008 and abs(tx) < 0.20:
                z_top += peak * 0.0006
            if 0.38 < ty < 0.62 and abs(tx) < 0.14:
                z_top -= peak * 0.0009
            if ty > 0.78 and abs(tx) > 0.52:
                z_top -= (ty - 0.78) * 0.0030 * abs(tx)
            if ty > 0.72:
                z_top -= (ty - 0.72) * 0.0024
            z_bot = z_top - UPPER_THICK
            trow.append(bm.verts.new((x, y, z_top)))
            brow.append(bm.verts.new((x, y, z_bot)))
        top_grid.append(trow)
        bot_grid.append(brow)

    for r in range(rows - 1):
        for c in range(cols - 1):
            bm.faces.new((top_grid[r][c], top_grid[r][c + 1], top_grid[r + 1][c + 1], top_grid[r + 1][c]))
            bm.faces.new((bot_grid[r][c + 1], bot_grid[r][c], bot_grid[r + 1][c], bot_grid[r + 1][c + 1]))
    for r in range(rows - 1):
        for c in range(cols):
            bm.faces.new((top_grid[r][c], top_grid[r + 1][c], bot_grid[r + 1][c], bot_grid[r][c]))
    for r in range(rows):
        for c in range(cols - 1):
            bm.faces.new((top_grid[r][c], top_grid[r][c + 1], bot_grid[r][c + 1], bot_grid[r][c]))

    edge = [top_grid[0][c].co.copy() for c in range(cols)]
    for r in range(1, rows):
        edge.append(top_grid[r][cols - 1].co.copy())
    for c in range(cols - 1, -1, -1):
        edge.append(top_grid[rows - 1][c].co.copy())
    for r in range(rows - 2, 0, -1):
        edge.append(top_grid[r][0].co.copy())
    edge.append(edge[0].copy())
    piping(bm, edge, PIPING_R * 0.86)
    stitch_pair(bm, edge, STITCH_R * 0.82)
    front_edge = [top_grid[0][c].co.copy() for c in range(cols)]
    stitch_pair(bm, front_edge, STITCH_R * 0.72)
    tube(bm, (-FLAP_HALF_W_BACK * 0.90, FLAP_Y_FRONT + 0.001, z_base + 0.0003),
         (FLAP_HALF_W_BACK * 0.90, FLAP_Y_FRONT + 0.001, z_base + 0.0003), STITCH_R, 6)
    strap_z = BUCKLE_Z - 0.001
    for sx in (-FLAP_HALF_W_BACK * 0.70, FLAP_HALF_W_BACK * 0.70):
        tube(bm, (sx, BUCKLE_Y - 0.0032, strap_z), (sx, BUCKLE_Y + 0.0032, strap_z), 0.00068, 6)
    attach_z = z_base + 0.0008
    for sx, ty in ((-FLAP_HALF_W_BACK * 0.92, 0.72), (FLAP_HALF_W_BACK * 0.92, 0.72)):
        y0 = lerp(FLAP_Y_FRONT, FLAP_Y_BACK, ty ** 0.94)
        tube(bm, (sx, y0, attach_z), (sx * 0.88, y0 - 0.004, attach_z - 0.0012), 0.00042, 6)

    obj = mesh_from_bm("Upper", bm)
    add_subsurf(obj, 1)
    return obj


def footprint_angles_at_y(y_target: float, tol: float = 0.0022) -> tuple[float, float] | None:
    left_a, right_a = None, None
    left_x, right_x = 0.0, 0.0
    steps = 720
    for i in range(steps):
        a = (i / steps) * math.tau
        fp = footprint_point(a)
        if abs(fp.y - y_target) > tol:
            continue
        if fp.x <= 0.0 and (left_a is None or fp.x < left_x):
            left_a, left_x = a, fp.x
        if fp.x >= 0.0 and (right_a is None or fp.x > right_x):
            right_a, right_x = a, fp.x
    if left_a is None or right_a is None:
        best_l = best_r = None
        best_dl = best_dr = 1e9
        for i in range(steps):
            a = (i / steps) * math.tau
            fp = footprint_point(a)
            d = abs(fp.y - y_target)
            if fp.x <= 0.0 and d < best_dl:
                best_dl, best_l = d, a
            if fp.x >= 0.0 and d < best_dr:
                best_dr, best_r = d, a
        if best_l is None or best_r is None or best_dl > tol * 8.0:
            return None
        return best_l, best_r
    return left_a, right_a


def footbed_point_at(y_target: float, tx: float, inset: float) -> tuple[float, float, float] | None:
    """Uniform lateral grid at each Y slice — avoids toe fan from polar angle lerp."""
    rt = footbed_rt(y_target)
    hw = half_width_at(y_target) * (1.0 - inset * (0.34 + 0.38 * rt))
    if hw < 1e-5:
        return None
    x = tx * hw
    y = y_target * (1.0 - inset * 0.07)
    z = footbed_z(x, y, rt)
    if y > 0.025:
        z += 0.0030 * smoothstep(0.025, 0.100, y) * (1.0 - smoothstep(WIDTH * 0.10, WIDTH * 0.36, abs(x)))
    heel_cup = smoothstep(-0.105, -0.055, y) * (1.0 - smoothstep(WIDTH * 0.04, WIDTH * 0.30, abs(x)))
    z += heel_cup * 0.0016
    edge = smoothstep(WIDTH * 0.20, WIDTH * 0.40, abs(x)) * smoothstep(-0.035, -0.100, y)
    z += 0.0018 * edge
    return x, y, z


def create_inner():
    """Footprint-aligned footbed slices — uniform Y×X grid, no angular toe fan."""
    bm = bmesh.new()
    y_rows, x_cols = 28, 12
    y_back = -LENGTH * 0.44
    y_front = LENGTH * 0.40
    inset = 0.0055
    grid = []
    for r in range(y_rows):
        y_tgt = lerp(y_back, y_front, r / (y_rows - 1))
        row = []
        for c in range(x_cols):
            tx = (c / (x_cols - 1)) * 2.0 - 1.0
            pt = footbed_point_at(y_tgt, tx, inset)
            if pt is None:
                break
            row.append(bm.verts.new(pt))
        if len(row) == x_cols:
            grid.append(row)
    for ri in range(len(grid) - 1):
        for c in range(x_cols - 1):
            bm.faces.new((grid[ri][c], grid[ri][c + 1], grid[ri + 1][c + 1], grid[ri + 1][c]))

    obj = mesh_from_bm("Inner", bm)
    add_subsurf(obj, 1)
    return obj


def horsebit_side_link(bm, ox, cy, cz, mirror):
    """Nested U-links — closer to luxury horsebit hardware than rectangular frame."""
    ox *= mirror
    w, h = 0.0080, 0.0068
    z = cz + 0.0035
    outer = []
    for i in range(17):
        t = i / 16
        a = math.pi * (1.08 - 0.92 * t)
        outer.append(Vector((ox + math.cos(a) * w, cy + math.sin(a) * h * 0.52, z + 0.0003 * math.cos(a))))
    piping(bm, outer, 0.00058)
    inner = []
    for i in range(11):
        t = i / 10
        a = math.pi * (1.04 - 0.68 * t)
        inner.append(Vector((ox + math.cos(a) * w * 0.54, cy + math.sin(a) * h * 0.36, z - 0.0002)))
    piping(bm, inner, 0.00042)
    for sign in (-1.0, 1.0):
        tube(bm, (ox + sign * w * 0.94, cy - h * 0.18, z - 0.0006),
             (ox + sign * w * 0.94, cy + h * 0.32, z + 0.0004), 0.00028, 8)
    tube(bm, (ox - w * 0.52 * mirror, cy, z), (0.0108 * mirror, cy - 0.0004, cz + 0.0033), 0.00040, 10)


def create_buckle():
    bm = bmesh.new()
    cx, cy, cz = 0.0, BUCKLE_Y, BUCKLE_Z
    solid_box(bm, cx - 0.0148, cx + 0.0148, cy - 0.00062, cy + 0.00062, cz + 0.0015, cz + 0.0048)
    solid_box(bm, cx - 0.0122, cx + 0.0122, cy - 0.00038, cy + 0.00038, cz + 0.0024, cz + 0.0040)
    tube(bm, (cx - 0.0125, cy, cz + 0.0037), (cx + 0.0125, cy, cz + 0.0037), 0.00048, 14)
    tube(bm, (cx - 0.0125, cy, cz + 0.0031), (cx + 0.0125, cy, cz + 0.0031), 0.00032, 12)
    tube(bm, (cx - 0.0125, cy, cz + 0.0025), (cx + 0.0125, cy, cz + 0.0025), 0.00026, 10)
    for sign in (-1.0, 1.0):
        tube(bm, (cx + sign * 0.0125, cy, cz + 0.0037), (cx + sign * 0.0125, cy, cz + 0.0046), 0.00020, 8)
        tube(bm, (cx + sign * 0.0125, cy, cz + 0.0025), (cx + sign * 0.0125, cy, cz + 0.0037), 0.00018, 8)
    scroll = []
    for i in range(11):
        t = i / 10
        a = math.pi * (0.35 + 0.50 * t)
        scroll.append(Vector((cx + math.cos(a) * 0.0048, cy + math.sin(a) * 0.0032, cz + 0.0036)))
    piping(bm, scroll, 0.00022)
    for sx in (-FLAP_HALF_W_BACK * 0.66, FLAP_HALF_W_BACK * 0.66):
        tube(bm, (sx, cy - 0.0018, cz + 0.0013), (sx, cy + 0.0018, cz + 0.0013), 0.00058, 8)
        tube(bm, (sx, cy + 0.0005, cz + 0.0010), (sx * 0.55, cy + 0.0005, cz + 0.0038), 0.00044, 8)
    horsebit_side_link(bm, cx + 0.0220, cy, cz, 1.0)
    horsebit_side_link(bm, cx + 0.0220, cy, cz, -1.0)
    for ox in (cx + 0.0220, cx - 0.0220):
        solid_box(bm, ox - 0.0028, ox + 0.0028, cy - 0.0012, cy + 0.0012, cz + 0.0026, cz + 0.0036)
        tube(bm, (ox, cy - 0.0012, cz + 0.0032), (ox, cy + 0.0012, cz + 0.0032), 0.00028, 8)
    obj = mesh_from_bm("Buckle", bm)
    add_subsurf(obj, 1)
    return obj


def create_logo():
    """Heel footbed brand patch — rounded slab with border frame and V emboss."""
    bm = bmesh.new()
    cy = LOGO_Y
    w, h = 0.0094, 0.0068
    z0 = SOLE_THICK + 0.00435
    z1 = SOLE_THICK + 0.00505
    solid_box(bm, -w, w, cy - h, cy + h, z0, z1)
    solid_box(bm, -w * 0.62, w * 0.62, cy - h * 0.55, cy + h * 0.55, z1, z1 + 0.00018)
    border_z = z1 + 0.00006
    frame_pts = [
        (-w, cy - h, border_z),
        (w, cy - h, border_z),
        (w, cy + h, border_z),
        (-w, cy + h, border_z),
        (-w, cy - h, border_z),
    ]
    for i in range(4):
        tube(bm, frame_pts[i], frame_pts[i + 1], 0.00017, 6)
    crest = z1 + 0.00012
    tube(bm, (0.0, cy - 0.0028, crest), (-0.0032, cy + 0.0022, crest), 0.00013, 6)
    tube(bm, (0.0, cy - 0.0028, crest), (0.0032, cy + 0.0022, crest), 0.00013, 6)
    for dy, half in ((-0.0045, 0.0055), (0.0015, 0.0048)):
        tube(bm, (-half, cy + dy, crest), (half, cy + dy, crest), 0.00010, 6)
    obj = mesh_from_bm("Logo", bm)
    add_subsurf(obj, 1)
    return obj


def make_material(name, color, roughness=0.5, metallic=0.0, specular=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color[:3], 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        key = "Specular IOR Level" if "Specular IOR Level" in bsdf.inputs else "Specular"
        bsdf.inputs[key].default_value = specular
    return mat


def assign_materials(objects):
    mats = {
        "Body_Material": make_material("Body_Material", (0.90, 0.88, 0.84), 0.80, 0.0, 0.22),
        "Upper_Material": make_material("Upper_Material", (0.90, 0.88, 0.84), 0.80, 0.0, 0.22),
        "Inner_Material": make_material("Inner_Material", (0.82, 0.81, 0.78), 0.52, 0.0, 0.25),
        "Lining_Material": make_material("Lining_Material", (0.06, 0.06, 0.06), 0.38, 0.0, 0.30),
        "HeelPad_Material": make_material("HeelPad_Material", (0.17, 0.05, 0.07), 0.58, 0.0, 0.22),
        "Sole_Material": make_material("Sole_Material", (0.025, 0.025, 0.025), 0.90, 0.0, 0.08),
        "Metal_Buckle": make_material("Metal_Buckle", (0.78, 0.58, 0.18), 0.08, 1.0, 0.92),
        "Enamel_Black": make_material("Enamel_Black", (0.02, 0.02, 0.02), 0.28, 0.0, 0.50),
        "Logo_Material": make_material("Logo_Material", (0.72, 0.73, 0.76), 0.16, 0.62, 0.68),
    }
    mapping = {
        "Body": mats["Body_Material"], "Upper": mats["Upper_Material"],
        "Cover": mats["Body_Material"],
        "Inner": mats["Inner_Material"], "Sole": mats["Sole_Material"],
        "Buckle": mats["Metal_Buckle"], "Logo": mats["Logo_Material"],
    }
    for obj in objects:
        obj.data.materials.clear()
        obj.data.materials.append(mapping[obj.name])
        if obj.name == "Inner":
            obj.data.materials.append(mats["Lining_Material"])
            obj.data.materials.append(mats["HeelPad_Material"])
            for poly in obj.data.polygons:
                c = Vector((0.0, 0.0, 0.0))
                for idx in poly.vertices:
                    c += obj.data.vertices[idx].co
                c /= len(poly.vertices)
                if (c.z > SOLE_THICK + 0.0040 and c.y < -0.065 and abs(c.x) < 0.016):
                    poly.material_index = 2
                elif (c.z > SOLE_THICK + 0.0042 and abs(c.y - LOGO_Y) < 0.013
                        and abs(c.x) < 0.011):
                    poly.material_index = 2
                elif c.z > SOLE_THICK + 0.011 and c.y < -0.048 and abs(c.x) < WIDTH * 0.22:
                    poly.material_index = 1
        if obj.name == "Cover":
            obj.data.materials.clear()
            obj.data.materials.append(mats["Body_Material"])
            obj.data.materials.append(mats["Lining_Material"])
            for poly in obj.data.polygons:
                c = Vector((0.0, 0.0, 0.0))
                for idx in poly.vertices:
                    c += obj.data.vertices[idx].co
                c /= len(poly.vertices)
                # Inner wall / collar underside → black lining like reference photo
                if abs(c.x) < half_width_at(c.y) * 0.82 and c.z > SOLE_THICK + 0.012:
                    n = poly.normal
                    if n.x * c.x + n.y * c.y < 0.0 or n.z < -0.15:
                        poly.material_index = 1
        if obj.name == "Logo":
            obj.data.materials.clear()
            obj.data.materials.append(mats["HeelPad_Material"])
        if obj.name == "Buckle":
            obj.data.materials.append(mats["Enamel_Black"])
            for poly in obj.data.polygons:
                c = Vector((0.0, 0.0, 0.0))
                for idx in poly.vertices:
                    c += obj.data.vertices[idx].co
                c /= len(poly.vertices)
                if abs(c.x) > 0.013 and c.z < BUCKLE_Z + 0.0032:
                    poly.material_index = 1
                elif c.z < BUCKLE_Z + 0.0025 and abs(c.x) > 0.010:
                    poly.material_index = 1


def tri_count():
    total = 0
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.data:
            obj.data.calc_loop_triangles()
            total += len(obj.data.loop_triangles)
    return total


def tune_tris(objects, lo=25000, hi=40000):
    for obj in objects:
        apply_mods(obj)
    tris = tri_count()
    print("Initial tris:", tris)
    if tris > hi:
        ratio = max(0.38, (hi - 1500) / tris)
        for name in ("Body", "Upper", "Cover", "Inner", "Buckle"):
            obj = bpy.data.objects.get(name)
            if obj:
                dec = obj.modifiers.new("Decimate", "DECIMATE")
                dec.ratio = ratio
                apply_mods(obj)
    print("Final tris:", tri_count())


def bounds_of(objects):
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        for c in obj.bound_box:
            w = obj.matrix_world @ Vector(c)
            mins = Vector((min(mins[i], w[i]) for i in range(3)))
            maxs = Vector((max(maxs[i], w[i]) for i in range(3)))
    return mins, maxs


def center_and_apply(objects):
    mins, maxs = bounds_of(objects)
    center = (mins + maxs) * 0.5
    center.z = mins.z
    for obj in objects:
        obj.location -= center
    for obj in objects:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        obj.select_set(False)


def save_draft(objects):
    os.makedirs(os.path.join(OUTPUT_DIR, "draft"), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=DRAFT_BLEND)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(
        filepath=DRAFT_GLB, export_format="GLB", use_selection=True,
        export_apply=True, export_texcoords=True, export_normals=True,
        export_materials="EXPORT", export_yup=True,
    )
    print("DRAFT_SAVED", DRAFT_BLEND)
    print("BUCKLE_ANCHOR", round(BUCKLE_Y, 5), round(BUCKLE_Z, 5))
    print("REVISION", REVISION)


def main():
    clear_scene()
    objects = [
        create_sole(),
        create_body(),
        create_cover(),
        create_upper(),
        create_inner(),
        create_buckle(),
        create_logo(),
    ]
    tune_tris(objects)
    for obj in objects:
        smart_uv(obj)
    assign_materials(objects)
    center_and_apply(objects)
    size = bounds_of(objects)[1] - bounds_of(objects)[0]
    print("Bounds:", round(size.x, 4), round(size.y, 4), round(size.z, 4), "tris", tri_count())
    print("PARTS", [obj.name for obj in objects])
    save_draft(objects)


if __name__ == "__main__":
    main()
