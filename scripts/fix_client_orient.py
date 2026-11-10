import bpy, math
from mathutils import Vector
from pathlib import Path

ROOT = Path(r"C:\xampp\htdocs\custom-shoes")
OUT_FE = ROOT / "frontend/public/models/shoes/studio-loafer/shoe.glb"
OUT_BE = ROOT / "backend/storage/app/public/models/shoes/studio-loafer/shoe.glb"
SRC = ROOT / "assets/blender/studio_loafer_client.blend"

bpy.ops.wm.open_mainfile(filepath=str(SRC))

def bbox(obj):
    cs=[obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs=[c.x for c in cs]; ys=[c.y for c in cs]; zs=[c.z for c in cs]
    return Vector((min(xs),min(ys),min(zs))), Vector((max(xs),max(ys),max(zs)))

# Select all shoe parts and rotate so length (X) -> Y (Blender), then ground
parts=[o for o in bpy.data.objects if o.name in ("Body","Cover","Sole","Inner")]
bpy.ops.object.select_all(action="DESELECT")
for o in parts:
    o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
# rotate -90 Z: X -> -Y?  +90 Z: X->Y
for o in parts:
    o.rotation_euler = (0,0,math.radians(90))
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# After rotation length should be on Y. Ensure toe +Y (pointier)
body=bpy.data.objects["Body"]
mn,mx=bbox(body)
# sample widths
def end_w(y):
    xs=[]
    for v in body.data.vertices:
        w=body.matrix_world @ v.co
        if abs(w.y-y)<0.01: xs.append(w.x)
    return (max(xs)-min(xs)) if len(xs)>3 else 999
if end_w(mn.y+0.01) < end_w(mx.y-0.01):
    for o in parts:
        o.rotation_euler=(0,0,math.radians(180))
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# ground + center X
mn,mx=bbox(body)
cx=(mn.x+mx.x)/2
for o in parts:
    o.location.x -= cx
    o.location.z -= mn.z
bpy.ops.object.select_all(action="DESELECT")
for o in parts: o.select_set(True)
bpy.context.view_layer.objects.active=parts[0]
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

mn,mx=bbox(body)
print("Body size", round(mx.x-mn.x,4), round(mx.y-mn.y,4), round(mx.z-mn.z,4), "min", [round(mn.x,4),round(mn.y,4),round(mn.z,4)])

for path in (OUT_FE, OUT_BE):
    bpy.ops.object.select_all(action="DESELECT")
    for o in parts: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), use_selection=True, export_format="GLB", export_apply=True, export_yup=True, export_normals=True, export_materials="EXPORT")
    print("WROTE", path, path.stat().st_size)
bpy.ops.wm.save_as_mainfile(filepath=str(SRC))
print("DONE")
