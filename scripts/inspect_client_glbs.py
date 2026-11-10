import json, sys
from pathlib import Path

try:
    import bpy
except ImportError:
    print("NO_BPY")
    sys.exit(1)

paths = [
    r"C:\Users\ORIGION\Downloads\white_mesh.glb",
    r"C:\Users\ORIGION\Downloads\white_mesh (1).glb",
]
labels = ["COVERED_FILE", "BACKLESS_FILE"]

for label, path in zip(labels, paths):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    p = Path(path)
    print(f"\n===== {label}: {p.name} size={p.stat().st_size} =====")
    if not p.exists():
        print("MISSING")
        continue
    bpy.ops.import_scene.gltf(filepath=str(p))
    meshes = []
    for o in bpy.data.objects:
        if o.type != "MESH":
            continue
        import mathutils
        corners = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        xs=[v.x for v in corners]; ys=[v.y for v in corners]; zs=[v.z for v in corners]
        mats = [s.material.name if s.material else None for s in o.material_slots]
        meshes.append({
            "name": o.name,
            "verts": len(o.data.vertices),
            "faces": len(o.data.polygons),
            "has_uv": bool(o.data.uv_layers),
            "materials": mats,
            "size": [round(max(xs)-min(xs),4), round(max(ys)-min(ys),4), round(max(zs)-min(zs),4)],
            "min": [round(min(xs),4), round(min(ys),4), round(min(zs),4)],
            "max": [round(max(xs),4), round(max(ys),4), round(max(zs),4)],
        })
    # whole scene bbox
    import mathutils
    allc=[]
    for o in bpy.data.objects:
        if o.type=="MESH":
            allc += [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    if allc:
        xs=[v.x for v in allc]; ys=[v.y for v in allc]; zs=[v.z for v in allc]
        scene = {
            "count": len(meshes),
            "names": [m["name"] for m in meshes],
            "size": [round(max(xs)-min(xs),4), round(max(ys)-min(ys),4), round(max(zs)-min(zs),4)],
            "min": [round(min(xs),4), round(min(ys),4), round(min(zs),4)],
            "max": [round(max(xs),4), round(max(ys),4), round(max(zs),4)],
        }
    else:
        scene={"count":0}
    print(json.dumps({"scene":scene, "meshes":meshes}, indent=2))
