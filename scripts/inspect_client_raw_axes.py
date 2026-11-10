"""Inspect raw client GLBs: bounds, PCA axes, and which side carries the flat sole."""
import bpy
import numpy as np
from pathlib import Path

JOBS = [
    ("backless", r"C:\Users\ORIGION\Downloads\white_mesh (1).glb"),
    ("covered", r"C:\Users\ORIGION\Downloads\white_mesh.glb"),
]

for label, path in JOBS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    obj = next(o for o in bpy.data.objects if o.type == "MESH")
    mw = obj.matrix_world
    me = obj.data
    P = np.array([tuple(mw @ v.co) for v in me.vertices])
    mn, mx = P.min(0), P.max(0)
    print(f"\n== {label}: verts={len(P)} min={mn.round(4)} max={mx.round(4)} size={(mx - mn).round(4)}")
    C = P - P.mean(0)
    w, V = np.linalg.eigh(np.cov(C.T))
    for i in np.argsort(w)[::-1]:
        print("  PCA axis", V[:, i].round(3), "std", round(float(np.sqrt(w[i])), 4))

    rot = mw.to_3x3()
    N = np.array([tuple((rot @ p.normal).normalized()) for p in me.polygons])
    A = np.array([p.area for p in me.polygons])
    Cc = np.array([tuple(mw @ p.center) for p in me.polygons])
    ext = mx - mn
    for axis in (1, 2):
        for sign in (1, -1):
            edge = mx[axis] if sign > 0 else mn[axis]
            near = np.abs(Cc[:, axis] - edge) < 0.08 * ext[axis]
            facing = N[:, axis] * sign > 0.85
            print(f"  {'+' if sign > 0 else '-'}{'XYZ'[axis]}: flat outward area near extreme = "
                  f"{A[near & facing].sum():.4f}  (faces {int((near & facing).sum())})")
    # thickness profile along length: max-min of Z and Y per slice
    xs = np.linspace(mn[0], mx[0], 9)
    for a, b in zip(xs[:-1], xs[1:]):
        s = P[(P[:, 0] >= a) & (P[:, 0] < b)]
        if len(s):
            print(f"  x[{a:+.2f},{b:+.2f}] Y[{s[:,1].min():+.3f},{s[:,1].max():+.3f}] Z[{s[:,2].min():+.3f},{s[:,2].max():+.3f}]")
print("DONE")
