"""
Procedural builder for the "studio-loafer" configurator model.

Builds a minimal apron-toe loafer / mule as four parts:
  Body  - upper (vamp + low heel rim). On its own it reads as the backless mule.
  Cover - heel counter band sitting on top of the Body rim (closed-back variant).
  Sole  - thin flat cupsole with a small lip.
  Inner - footbed + lining inside the Body.

Run headless:
  blender --background --python scripts/build_studio_loafer.py [-- --no-preview]

Modelling space is centimetres with x = length (heel 0 -> toe), y = width,
z = up. Everything is converted at the end to Blender metres with the toe on +Y,
which the glTF exporter turns into Y-up with the toe on -Z.
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

ROOT = r"C:\xampp\htdocs\custom-shoes"
OUT_GLBS = [
    os.path.join(ROOT, r"frontend\public\models\shoes\studio-loafer\shoe.glb"),
    os.path.join(ROOT, r"backend\storage\app\public\models\shoes\studio-loafer\shoe.glb"),
]
OUT_BLEND = os.path.join(ROOT, r"assets\blender\studio_loafer.blend")
PREVIEW_DIR = os.path.join(ROOT, r"assets\blender\previews\studio_loafer")

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MAKE_PREVIEWS = "--no-preview" not in ARGS

CM = 0.01

# ---------------------------------------------------------------------------
# Shape parameters (cm)
# ---------------------------------------------------------------------------
# Tuned to the client's backless side photo (05_left_side_view): high pointed tongue at the
# instep, near-level apron seam, low open-heel rim, thin flat sole with a gentle rocker.
LU = 27.3            # last footprint length (sole adds SOLE_LIP all round -> ~28 cm)
SOLE_LIP = 0.28
W_HEEL = 3.25        # half widths of the last footprint
W_BALL = 4.55
X_HEEL_CAP = 3.4
X_BALL = 19.0

SOLE_TOP = 1.30      # sole wall height at the ball; rises a little toward the heel
SOLE_HEEL_EXTRA = 0.25
ZB = SOLE_TOP - 0.17  # upper base (sits inside the sole cup)

X_T = 12.6           # throat top (centre of the vamp edge)
SLANT = 1.1          # throat edge sweeps forward toward its lower corners
X_C = X_T + SLANT    # throat corner on the footprint

SEAM_D = 0.95        # apron seam: plan distance in from the footprint edge

N_BACK = 36          # perimeter segments per side behind the throat corner
N_FRONT = 60         # perimeter segments per side from corner to toe tip
U_BODY = 56          # rows along each Body path (base -> opening edge)
U_COVER = 22         # rows along each Cover path (rim -> collar)

BODY_THICK = 0.16
LINING_GAP = 0.035
LINING_THICK = 0.05


def smoothstep(t):
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def half_width(x):
    x = np.atleast_1d(np.asarray(x, float))
    w = np.zeros_like(x)
    m = x < X_HEEL_CAP
    t = np.clip((X_HEEL_CAP - x[m]) / X_HEEL_CAP, 0.0, 1.0)
    w[m] = W_HEEL * (1.0 - t ** 2.2) ** (1.0 / 2.2)
    m = (x >= X_HEEL_CAP) & (x <= X_BALL)
    w[m] = W_HEEL + (W_BALL - W_HEEL) * smoothstep((x[m] - X_HEEL_CAP) / (X_BALL - X_HEEL_CAP))
    m = x > X_BALL
    t = np.clip((x[m] - X_BALL) / (LU - X_BALL), 0.0, 1.0)
    w[m] = W_BALL * (1.0 - t ** 2.5) ** (1.0 / 2.5)
    return np.maximum(w, 0.0)


def crown_height(x):
    """Vamp centre-line height above ZB: high tongue at the throat falling almost linearly to the toe."""
    s = np.clip((x - X_T) / (LU - X_T), 0.0, 1.0)
    return CROWN_TOP - CROWN_A * s - CROWN_B * s * s - CROWN_C * s ** 3


# Least-squares fit to the reference side photo's vamp line (slight S: steep mid-vamp, flatter toe).
CROWN_TOP = 8.47
CROWN_A = 3.30
CROWN_B = 7.01
CROWN_C = -3.79
SIDE_WALL = 3.75     # front side-wall height above ZB (apron seam sits just below it)
SIDE_TOE = 2.8
DOME_P = 3.4         # apron plug cross-section exponent (higher = boxier)


def side_height(x):
    hc = crown_height(x)
    wall = SIDE_WALL - (SIDE_WALL - SIDE_TOE) * smoothstep((np.asarray(x) - 20.0) / (LU - 20.0))
    front = np.minimum(wall, 0.8 * hc)
    k = smoothstep((x - (X_T - 1.5)) / (X_C + 1.0 - (X_T - 1.5)))
    return hc * (1.0 - k) + front * k


def shoulder_radius(x):
    return 1.55 + 0.05 * smoothstep((x - 21.0) / 5.0) - 0.15 * smoothstep((4.0 - x) / 4.0)


def shoulder(t, p=2.2):
    t = np.clip(t, 0.0, 1.0)
    return (1.0 - (1.0 - t) ** p) ** (1.0 / p)


def rim_height(x):
    """Backless rim height above ZB: low open-heel wall rising gently to the throat corner."""
    return RIM_HEEL + (RIM_CORNER - RIM_HEEL) * smoothstep(np.asarray(x) / X_C)


RIM_HEEL = 2.75
RIM_CORNER = 3.85


def collar_height(x):
    """Closed-back collar height above ZB."""
    return 5.6 - 1.15 * smoothstep(np.asarray(x) / X_C)


def throat_x(y):
    # Below the collar height the throat edge is vertical at X_C so the Cover can butt against it.
    return X_T + SLANT * smoothstep((np.abs(y) / Y_COLLAR - 0.45) / 0.55)


def toe_spring(x):
    """Gentle rocker: flat under the ball, slight heel lift, toe springs up ~1.2 cm."""
    toe = 1.2 * np.clip((x - 19.5) / (LU + SOLE_LIP - 19.5), 0.0, 1.0) ** 2.2
    heel = 0.3 * smoothstep((16.5 - np.asarray(x)) / 9.0)
    return toe + heel


def sole_top(x):
    return SOLE_TOP + SOLE_HEEL_EXTRA * smoothstep((9.0 - np.asarray(x)) / 7.0)


# ---------------------------------------------------------------------------
# Footprint outline
# ---------------------------------------------------------------------------
def resample_polyline(P, fractions):
    seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    t = np.asarray(fractions) * cum[-1]
    return np.stack([np.interp(t, cum, P[:, k]) for k in range(P.shape[1])], 1)


def dense_half_outline(n=6000):
    s = np.linspace(0.0, 1.0, n)
    x = LU * (1.0 - np.cos(np.pi * s)) / 2.0
    P = np.stack([x, half_width(x)], 1)
    return resample_polyline(P, np.linspace(0.0, 1.0, 1500))


HALF = dense_half_outline()
HALF_CUM = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(HALF, axis=0), axis=1))])
HALF_LEN = HALF_CUM[-1]
_tan = np.gradient(HALF, axis=0)
_tan /= np.linalg.norm(_tan, axis=1, keepdims=True)
HALF_NORMAL = np.stack([-_tan[:, 1], _tan[:, 0]], 1)  # outward (loop runs clockwise)
_loop = np.concatenate([HALF, HALF[-2:0:-1] * [1.0, -1.0], HALF[:1]], 0)
SEG_A = _loop[:-1]
SEG_AB = _loop[1:] - _loop[:-1]
SEG_LEN2 = np.maximum((SEG_AB * SEG_AB).sum(1), 1e-12)
Y0 = float(half_width(X_C)[0])


def sample_half(arcs):
    pts = np.stack([np.interp(arcs, HALF_CUM, HALF[:, k]) for k in range(2)], 1)
    nrm = np.stack([np.interp(arcs, HALF_CUM, HALF_NORMAL[:, k]) for k in range(2)], 1)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    return pts, nrm


def symmetric_loop(arcs_half):
    """Closed loop: index 0 heel centre, H toe tip, i and N-i mirrored."""
    pts, nrm = sample_half(arcs_half)
    mirror = [1.0, -1.0]
    loop_p = np.concatenate([pts, pts[-2:0:-1] * mirror], 0)
    loop_n = np.concatenate([nrm, nrm[-2:0:-1] * mirror], 0)
    return loop_p, loop_n


def dist_to_outline(P):
    """Exact distance to the footprint polyline (the shoulder is very steep at d=0)."""
    out = np.empty(len(P))
    for s in range(0, len(P), 128):
        ap = P[s:s + 128, None, :] - SEG_A[None, :, :]
        t = np.clip((ap * SEG_AB[None]).sum(-1) / SEG_LEN2[None], 0.0, 1.0)
        q = ap - t[..., None] * SEG_AB[None]
        out[s:s + 128] = np.sqrt((q * q).sum(-1).min(1))
    return out


def last_surface(P):
    """Height of the shoe last over plan points P (n, 2); returns (z, d)."""
    x, y = P[:, 0], P[:, 1]
    w = np.maximum(half_width(x), 1e-3)
    # The raised apron plug spans the area inside the seam; outside it the side wall sits at hs.
    rho = np.clip(np.abs(y) / np.maximum(w - SEAM_D, 0.6), 0.0, 1.0)
    hs = side_height(x)
    hc = crown_height(x)
    htot = hs + (hc - hs) * (1.0 - rho ** DOME_P)
    d = dist_to_outline(P)
    return ZB + htot * shoulder(d / shoulder_radius(x)), d


def _collar_y_at_corner():
    ys = np.linspace(0.0, Y0 * 0.999, 4000)
    z, _ = last_surface(np.stack([np.full_like(ys, X_C), ys], 1))
    target = ZB + float(collar_height(X_C))
    return float(ys[np.where(z >= target)[0][-1]])


Y_COLLAR = _collar_y_at_corner()


# ---------------------------------------------------------------------------
# Paths over the last
# ---------------------------------------------------------------------------
def lift(P):
    z, d = last_surface(P)
    return np.column_stack([P, z]), d


def resample_path(pts, d, n, seam=False):
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    if seam:
        fade = smoothstep((pts[:, 0] - (X_C + 0.3)) / 1.5)
        w = 1.0 + 7.0 * np.exp(-((d - SEAM_D) / 0.22) ** 2) * fade
        seg = seg * 0.5 * (w[1:] + w[:-1])
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    t = np.linspace(0.0, cum[-1], n)
    res = np.stack([np.interp(t, cum, pts[:, k]) for k in range(3)], 1)
    return res, np.interp(t, cum, d)


def march_until(P0, direction, z_target, length=6.0, n=500):
    s = np.linspace(0.0, 1.0, n)
    P = P0[None, :] + direction[None, :] * (length * s ** 1.8)[:, None]
    pts, d = lift(P)
    above = np.where(pts[:, 2] >= z_target)[0]
    k = int(above[0]) if len(above) else n - 1
    k = max(k, 1)
    z0, z1 = pts[k - 1, 2], pts[k, 2]
    f = 1.0 if z1 == z0 else np.clip((z_target - z0) / (z1 - z0), 0.0, 1.0)
    cross = pts[k - 1] + f * (pts[k] - pts[k - 1])
    cross[2] = z_target
    dc = d[k - 1] + f * (d[k] - d[k - 1])
    return np.vstack([pts[:k], cross]), np.append(d[:k], dc)


def build_throat(n_pts):
    ys = np.linspace(0.0, Y0 * 0.999, 4000)
    pts, _ = lift(np.stack([throat_x(ys), ys], 1))
    target = ZB + float(rim_height(X_C))
    idx = int(np.where(pts[:, 2] >= target)[0][-1])
    z0, z1 = pts[idx, 2], pts[idx + 1, 2]
    y_e = ys[idx] + (z0 - target) / (z0 - z1) * (ys[idx + 1] - ys[idx])
    yy = np.linspace(y_e, -y_e, 3000)
    curve, d = lift(np.stack([throat_x(yy), yy], 1))
    T, Td = resample_path(curve, d, n_pts)
    return T, Td, y_e


def corner_cover_path(y_e, sign):
    yy = np.linspace(y_e, 0.0, 1500) * sign
    pts, d = lift(np.stack([throat_x(yy), yy], 1))
    target = ZB + float(collar_height(X_C))
    k = max(int(np.where(pts[:, 2] >= target)[0][0]), 1)
    z0, z1 = pts[k - 1, 2], pts[k, 2]
    f = np.clip((target - z0) / (z1 - z0), 0.0, 1.0)
    cross = pts[k - 1] + f * (pts[k] - pts[k - 1])
    return np.vstack([pts[:k], cross]), np.append(d[:k], d[k])


def build_upper_grids():
    a_corner = float(np.interp(X_C, HALF[:, 0], HALF_CUM))
    arcs = np.concatenate([
        np.linspace(0.0, a_corner, N_BACK + 1),
        np.linspace(a_corner, HALF_LEN, N_FRONT + 1)[1:],
    ])
    loop_p, loop_n = symmetric_loop(arcs)
    H = N_BACK + N_FRONT
    N = 2 * H
    corner_a, corner_b = N_BACK, N - N_BACK

    T, _, y_e = build_throat(2 * N_FRONT + 1)

    body = np.zeros((N, U_BODY + 1, 3))
    body_d = np.zeros((N, U_BODY + 1))
    rim_extra = {}
    for i in range(N):
        P0 = loop_p[i]
        if corner_a <= i <= corner_b:
            j = i - corner_a
            s = np.linspace(0.0, 1.0, 500) ** 1.8
            P = P0[None, :] + (T[j, :2] - P0)[None, :] * s[:, None]
            pts, d = lift(P)
            pts[-1] = T[j]
            body[i], body_d[i] = resample_path(pts, d, U_BODY + 1, seam=True)
        else:
            direction = -loop_n[i]
            pts, d = march_until(P0, direction, ZB + float(rim_height(P0[0])))
            body[i], body_d[i] = resample_path(pts, d, U_BODY + 1)
            rim_extra[i] = (pts[-1, :2], direction)

    cover_cols = list(range(corner_b, N)) + list(range(0, corner_a + 1))
    cover = np.zeros((len(cover_cols), U_COVER + 1, 3))
    for c, i in enumerate(cover_cols):
        if i in (corner_a, corner_b):
            pts, d = corner_cover_path(y_e, 1.0 if i == corner_a else -1.0)
        else:
            start, direction = rim_extra[i]
            pts, d = march_until(start, direction, ZB + float(collar_height(loop_p[i][0])))
        cover[c], _ = resample_path(pts, d, U_COVER + 1)
        cover[c, 0] = body[i, -1]
    return body, body_d, cover


# ---------------------------------------------------------------------------
# Blender helpers
# ---------------------------------------------------------------------------
def to_blender(P):
    P = np.asarray(P, float)
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    return np.stack([y * CM, (x - LU / 2.0) * CM, (z + toe_spring(x)) * CM], -1)


def interior_ref(co_m):
    """Reference point inside the shoe for orienting normals (metres)."""
    y_len = co_m.y / CM + LU / 2.0
    return Vector((0.0, (min(max(y_len, 4.0), LU - 4.0) - LU / 2.0) * CM, (ZB + 1.5) * CM))


def orient_outward(bm):
    bm.normal_update()
    score = 0.0
    for f in bm.faces:
        c = f.calc_center_median()
        score += f.normal.dot(c - interior_ref(c)) * f.calc_area()
    if score < 0:
        bmesh.ops.reverse_faces(bm, faces=list(bm.faces))
        bm.normal_update()


def grid_to_bmesh(grid_m, cyclic):
    C, R, _ = grid_m.shape
    bm = bmesh.new()
    verts = [[bm.verts.new(Vector(grid_m[c, r])) for r in range(R)] for c in range(C)]
    cols = C if cyclic else C - 1
    for c in range(cols):
        c2 = (c + 1) % C
        for r in range(R - 1):
            bm.faces.new((verts[c][r], verts[c2][r], verts[c2][r + 1], verts[c][r + 1]))
    return bm, verts


def bmesh_to_object(bm, name, material):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    me.materials.append(material)
    return obj


def apply_solidify(obj, thickness_m, offset=-1.0):
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = thickness_m
    mod.offset = offset
    mod.use_even_offset = True
    mod.use_quality_normals = True
    mod.use_rim = True
    depsgraph = bpy.context.evaluated_depsgraph_get()
    new_me = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph))
    old = obj.data
    name = old.name
    obj.modifiers.remove(mod)
    obj.data = new_me
    bpy.data.meshes.remove(old)
    new_me.name = name


def finish_mesh(obj, material, sharp_deg=50.0, uv_scale=10.0):
    me = obj.data
    me.materials.clear()
    me.materials.append(material)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    limit = math.radians(sharp_deg)
    for f in bm.faces:
        f.smooth = True
        f.material_index = 0
    for e in bm.edges:
        e.smooth = not (len(e.link_faces) == 2 and e.calc_face_angle(0.0) > limit)
    bm.to_mesh(me)
    bm.free()

    uv = me.uv_layers.new(name="UVMap")
    co = [v.co for v in me.vertices]
    for poly in me.polygons:
        n = poly.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for li in poly.loop_indices:
            p = co[me.loops[li].vertex_index]
            if ax == 0:
                u, v = p.y, p.z
            elif ax == 1:
                u, v = p.x, p.z
            else:
                u, v = p.x, p.y
            uv.data[li].uv = (u * uv_scale, v * uv_scale)
    me.update()


def make_material(name, rgb, roughness):
    mat = bpy.data.materials.new(name)
    try:
        mat.use_nodes = True
    except Exception:
        pass
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    mat.diffuse_color = (*rgb, 1.0)
    mat.roughness = roughness
    return mat


# ---------------------------------------------------------------------------
# Closed loop solids (sole, footbed)
# ---------------------------------------------------------------------------
def add_cap(bm, loop_verts, z_fn, M=8):
    N = len(loop_verts)
    H = N // 2
    rows = []
    for i in range(H + 1):
        a = loop_verts[i]
        b = loop_verts[(N - i) % N]
        if i in (0, H):
            rows.append([a] * (M + 1))
            continue
        row = [a]
        for c in range(1, M):
            f = c / M
            co = a.co.lerp(b.co, f)
            co.z = z_fn(co, f)
            row.append(bm.verts.new(co))
        row.append(b)
        rows.append(row)
    for i in range(H):
        r0, r1 = rows[i], rows[i + 1]
        for c in range(M):
            quad = []
            for v in (r0[c], r1[c], r1[c + 1], r0[c + 1]):
                if v not in quad:
                    quad.append(v)
            if len(quad) >= 3:
                bm.faces.new(quad)


def loft_loops(bm, loops):
    for a, b in zip(loops[:-1], loops[1:]):
        N = len(a)
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((a[i], a[j], b[j], b[i]))


def offset_loop_verts(bm, loop_p, loop_n, offset, z):
    xy = loop_p + loop_n * offset
    z = z(xy[:, 0]) if callable(z) else np.full(len(loop_p), z)
    P = np.column_stack([xy, z])
    return [bm.verts.new(Vector(p)) for p in to_blender(P)]


def build_sole(mat):
    H = 110
    loop_p, loop_n = symmetric_loop(np.linspace(0.0, HALF_LEN, H + 1))
    # Thin flat cupsole hugging the upper (no stacked midsole groove)
    profile = [  # (outward offset from last footprint, z) cm
        (0.10, 0.00),
        (0.21, 0.04),
        (SOLE_LIP, 0.14),
        (SOLE_LIP, lambda x: sole_top(x) - 0.07),
        (SOLE_LIP - 0.07, sole_top),
        (-0.02, sole_top),
        (-0.02, ZB - 0.04),
    ]
    bm = bmesh.new()
    loops = [offset_loop_verts(bm, loop_p, loop_n, off, z) for off, z in profile]
    loft_loops(bm, loops)
    add_cap(bm, loops[0], lambda co, f: co.z)
    add_cap(bm, loops[-1], lambda co, f: co.z)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    obj = bmesh_to_object(bm, "Sole", mat)
    finish_mesh(obj, mat, sharp_deg=60.0)
    return obj


def build_footbed_bmesh():
    H = 90
    loop_p, loop_n = symmetric_loop(np.linspace(0.0, HALF_LEN, H + 1))
    bm = bmesh.new()
    bottom = offset_loop_verts(bm, loop_p, loop_n, -0.42, ZB + 0.03)
    edge = offset_loop_verts(bm, loop_p, loop_n, -0.42, ZB + 0.44)
    crest = offset_loop_verts(bm, loop_p, loop_n, -0.58, ZB + 0.54)
    loft_loops(bm, [bottom, edge, crest])
    add_cap(bm, bottom, lambda co, f: co.z)
    base = (ZB + 0.40) * CM
    add_cap(bm, crest, lambda co, f: co.z + (base + 0.14 * CM * (2 * f - 1) ** 4 - (ZB + 0.54) * CM), M=10)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm


# ---------------------------------------------------------------------------
# Upper parts
# ---------------------------------------------------------------------------
def apply_seam(bm, verts, body, body_d):
    bm.normal_update()
    C, R = body_d.shape
    for c in range(C):
        for r in range(R):
            x_cm = body[c, r, 0]
            fade = float(smoothstep((x_cm - (X_C + 0.3)) / 1.5))
            if fade <= 0.0:
                continue
            d = body_d[c, r]
            disp = (-0.08 * math.exp(-((d - SEAM_D) / 0.055) ** 2)
                    + 0.045 * math.exp(-((d - SEAM_D - 0.14) / 0.07) ** 2)) * fade
            if abs(disp) < 1e-5:
                continue
            v = verts[c][r]
            v.co += v.normal * (disp * CM)


def offset_shell(bm, distance_m):
    """Copy of an open surface pushed inward, using Solidify's robust even-offset normals."""
    tmp_me = bpy.data.meshes.new("OffsetTmp")
    bm.to_mesh(tmp_me)
    tmp = bpy.data.objects.new("OffsetTmp", tmp_me)
    bpy.context.scene.collection.objects.link(tmp)
    mod = tmp.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = distance_m
    mod.offset = -1.0
    mod.use_even_offset = True
    mod.use_quality_normals = True
    mod.use_rim = False
    depsgraph = bpy.context.evaluated_depsgraph_get()
    ev = tmp.evaluated_get(depsgraph).to_mesh()
    n = len(bm.verts)
    shell = [ev.vertices[n + i].co.copy() for i in range(n)]
    orig = [ev.vertices[i].co.copy() for i in range(n)]
    tmp.evaluated_get(depsgraph).to_mesh_clear()
    bpy.data.objects.remove(tmp)
    bpy.data.meshes.remove(tmp_me)

    bm.verts.ensure_lookup_table()
    gaps = [(s - o).length for s, o in zip(shell, orig)]
    if abs(sorted(gaps)[len(gaps) // 2] - distance_m) > distance_m * 0.2:
        raise RuntimeError("Unexpected Solidify vertex order while building lining")
    out = bm.copy()
    out.verts.ensure_lookup_table()
    for i, v in enumerate(out.verts):
        v.co = shell[i]
    out.normal_update()
    return out


def build_upper(body_mat, cover_mat, inner_mat):
    body, body_d, cover = build_upper_grids()

    bm, verts = grid_to_bmesh(to_blender(body), cyclic=True)
    orient_outward(bm)
    # Offset the lining from the seam-free surface; the narrow seam groove would cusp when offset.
    lining_bm = offset_shell(bm, (BODY_THICK + LINING_GAP) * CM)
    apply_seam(bm, verts, body, body_d)
    bm.normal_update()

    body_obj = bmesh_to_object(bm, "Body", body_mat)
    apply_solidify(body_obj, BODY_THICK * CM)
    finish_mesh(body_obj, body_mat)

    lining_obj = bmesh_to_object(lining_bm, "InnerLining", inner_mat)
    apply_solidify(lining_obj, LINING_THICK * CM)

    inner_bm = bmesh.new()
    inner_bm.from_mesh(lining_obj.data)
    footbed_bm = build_footbed_bmesh()
    tmp = bpy.data.meshes.new("FootbedTmp")
    footbed_bm.to_mesh(tmp)
    footbed_bm.free()
    inner_bm.from_mesh(tmp)
    bpy.data.meshes.remove(tmp)
    bpy.data.objects.remove(lining_obj)
    inner_obj = bmesh_to_object(inner_bm, "Inner", inner_mat)
    finish_mesh(inner_obj, inner_mat)

    cbm, _ = grid_to_bmesh(to_blender(cover), cyclic=False)
    orient_outward(cbm)
    cover_obj = bmesh_to_object(cbm, "Cover", cover_mat)
    apply_solidify(cover_obj, BODY_THICK * CM)
    finish_mesh(cover_obj, cover_mat)
    return body_obj, inner_obj, cover_obj


# ---------------------------------------------------------------------------
# Export / previews
# ---------------------------------------------------------------------------
def export_glb(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    kwargs = dict(
        filepath=path,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_yup=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )
    try:
        bpy.ops.export_scene.gltf(**kwargs)
    except TypeError as exc:
        print("glTF exporter rejected options, retrying minimal:", exc)
        bpy.ops.export_scene.gltf(filepath=path, export_format="GLB")
    print("Exported", path, os.path.getsize(path), "bytes")


def look_at(cam, target):
    direction = Vector(target) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_previews(cover_obj):
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_WORKBENCH"
    except TypeError as exc:
        print("Workbench unavailable:", exc)
        return
    scene.render.resolution_x = 900
    scene.render.resolution_y = 700
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.show_cavity = True
    shading.cavity_type = "BOTH"
    shading.show_shadows = False
    world = bpy.data.worlds.new("PreviewWorld")
    world.color = (0.75, 0.78, 0.82)
    scene.world = world

    cam_data = bpy.data.cameras.new("PreviewCam")
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    mid_z = 0.045
    views = {
        "side": ((0.6, 0.0, mid_z), "ORTHO", 0.32),
        "top": ((0.0, 0.0, 0.6), "ORTHO", 0.40),
        "rear": ((0.0, -0.6, mid_z + 0.02), "ORTHO", 0.17),
        "front": ((0.0, 0.6, mid_z + 0.02), "ORTHO", 0.17),
        "threequarter": ((0.34, 0.36, 0.26), "PERSP", None),
        "rear_threequarter": ((-0.30, -0.36, 0.30), "PERSP", None),
    }
    for mode in ("covered", "backless"):
        cover_obj.hide_render = mode == "backless"
        for color_type in ("MATERIAL", "RANDOM"):
            shading.color_type = color_type
            for vname, (loc, ctype, oscale) in views.items():
                if color_type == "RANDOM" and vname not in ("threequarter", "side"):
                    continue
                cam_data.type = ctype
                if oscale:
                    cam_data.ortho_scale = oscale
                else:
                    cam_data.lens = 50
                cam.location = Vector(loc)
                if vname == "top":
                    cam.rotation_euler = (0.0, 0.0, math.pi)
                else:
                    look_at(cam, (0.0, 0.0, mid_z * 0.7))
                suffix = "" if color_type == "MATERIAL" else "_parts"
                scene.render.filepath = os.path.join(PREVIEW_DIR, f"{mode}_{vname}{suffix}.png")
                bpy.ops.render.render(write_still=True)
    cover_obj.hide_render = False
    bpy.data.objects.remove(cam)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0

    body_mat = make_material("BodyMat", (0.93, 0.93, 0.91), 0.55)
    sole_mat = make_material("SoleMat", (0.96, 0.96, 0.95), 0.6)
    inner_mat = make_material("InnerMat", (0.96, 0.96, 0.95), 0.72)
    cover_mat = make_material("CoverMat", (0.93, 0.93, 0.91), 0.55)

    sole = build_sole(sole_mat)
    body, inner, cover = build_upper(body_mat, cover_mat, inner_mat)

    for obj in (body, sole, inner, cover):
        me = obj.data
        print(f"{obj.name}: verts={len(me.vertices)} faces={len(me.polygons)} "
              f"dims_cm={[round(v * 100, 2) for v in obj.dimensions]}")

    for path in OUT_GLBS:
        export_glb(path)

    os.makedirs(os.path.dirname(OUT_BLEND), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
    print("Saved", OUT_BLEND)

    if MAKE_PREVIEWS:
        render_previews(cover)


if __name__ == "__main__":
    main()
