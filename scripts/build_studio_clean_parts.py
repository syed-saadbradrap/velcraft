import bpy
from pathlib import Path
from mathutils import Vector

ROOT = Path(r"C:\xampp\htdocs\custom-shoes")
IVORY = ROOT / "frontend/public/models/shoes/ivory-gold-bit-mule"
OUT_FE = ROOT / "frontend/public/models/shoes/studio-loafer/shoe.glb"
OUT_BE = ROOT / "backend/storage/app/public/models/shoes/studio-loafer/shoe.glb"
OUT_BLEND = ROOT / "assets/blender/studio_loafer.blend"

bpy.ops.wm.read_factory_settings(use_empty=True)

def load(path):
    before=set(bpy.data.objects.keys())
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [bpy.data.objects[n] for n in bpy.data.objects.keys() if n not in before]

# Base assembly from known-good parts
for f, rename in [
    ("body.glb", "Body"),
    ("sole.glb", "Sole"),
    ("inner.glb", "Inner"),
]:
    objs = load(IVORY/f)
    meshes=[o for o in objs if o.type=="MESH"]
    if not meshes:
        continue
    main=meshes[0]
    main.name=rename
    for o in meshes[1:]:
        bpy.data.objects.remove(o, do_unlink=True)
    print("loaded", rename, "verts", len(main.data.vertices))

# Cover from combined shoe if present
objs = load(IVORY/"shoe.glb")
cover=None
for o in objs:
    if o.type=="MESH" and "cover" in o.name.lower():
        cover=o
        o.name="Cover"
    elif o.type=="MESH":
        # remove duplicate body from shoe.glb
        bpy.data.objects.remove(o, do_unlink=True)
if cover is None:
    # duplicate heel region proxy from body bbox rear
    body=bpy.data.objects.get("Body")
    if body:
        bpy.ops.object.select_all(action="DESELECT")
        body.select_set(True)
        bpy.context.view_layer.objects.active=body
        bpy.ops.object.duplicate()
        cover=bpy.context.active_object
        cover.name="Cover"
        # scale/shrink to rear half via shapekey-less bbox cut using boolean cube keep rear
        print("duplicated Body as Cover fallback")

# Materials white blank look
def paint(obj,name,col,rough):
    if not obj: return
    m=bpy.data.materials.new(name); m.use_nodes=True
    nodes=m.node_tree.nodes; links=m.node_tree.links; nodes.clear()
    out=nodes.new("ShaderNodeOutputMaterial"); bsdf=nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value=(*col,1)
    bsdf.inputs["Roughness"].default_value=rough
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    obj.data.materials.clear(); obj.data.materials.append(m)

paint(bpy.data.objects.get("Body"),"BodyMat",(0.97,0.97,0.96),0.75)
paint(bpy.data.objects.get("Cover"),"CoverMat",(0.97,0.97,0.96),0.75)
paint(bpy.data.objects.get("Sole"),"SoleMat",(0.93,0.93,0.92),0.48)
paint(bpy.data.objects.get("Inner"),"InnerMat",(0.1,0.1,0.1),0.88)

# delete non-essentials
keep={"Body","Sole","Inner","Cover"}
for o in list(bpy.data.objects):
    if o.name not in keep:
        bpy.data.objects.remove(o, do_unlink=True)

print("FINAL", [(o.name,len(o.data.vertices)) for o in bpy.data.objects if o.type=="MESH"])
OUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
for path in (OUT_FE, OUT_BE):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for n in keep:
        o=bpy.data.objects.get(n)
        if o: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), use_selection=True, export_format="GLB", export_apply=True, export_yup=True)
    print("WROTE", path, path.stat().st_size)
