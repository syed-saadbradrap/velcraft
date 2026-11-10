import bpy, json
from mathutils import Vector
from pathlib import Path

ROOT = Path(r"C:\xampp\htdocs\custom-shoes")
IVORY = ROOT / "frontend/public/models/shoes/ivory-gold-bit-mule"
OUT_FE = ROOT / "frontend/public/models/shoes/studio-loafer/shoe.glb"
OUT_BE = ROOT / "backend/storage/app/public/models/shoes/studio-loafer/shoe.glb"
OUT_BLEND = ROOT / "assets/blender/studio_loafer.blend"

bpy.ops.wm.read_factory_settings(use_empty=True)

def import_glb(path, keep_names=None):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    new = [o for o in bpy.data.objects if o not in before]
    return new

# Import combined first
import_glb(IVORY / "shoe.glb")
# Also try parts if missing
have = {o.name for o in bpy.data.objects if o.type=="MESH"}
print("AFTER SHOE", sorted(have))

for part, file in [("Sole","sole.glb"),("Inner","inner.glb"),("Upper","upper.glb"),("Body","body.glb")]:
    if part not in have and (IVORY/file).exists():
        objs = import_glb(IVORY/file)
        for o in objs:
            if o.type=="MESH":
                o.name = part
                have.add(part)
                print("IMPORTED PART", part, "verts", len(o.data.vertices))

# Ensure names
# Prefer Body from shoe.glb
body = bpy.data.objects.get("Body")
cover = bpy.data.objects.get("Cover")
sole = bpy.data.objects.get("Sole")
inner = bpy.data.objects.get("Inner")

# If Upper exists and no Body, rename
if not body and bpy.data.objects.get("Upper"):
    bpy.data.objects["Upper"].name = "Body"
    body = bpy.data.objects["Body"]

# Create simple sole/inner if still missing using Body bbox
def bbox(obj):
    corners = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs=[c.x for c in corners]; ys=[c.y for c in corners]; zs=[c.z for c in corners]
    return min(xs),max(xs),min(ys),max(ys),min(zs),max(zs)

if body and not sole:
    xmin,xmax,ymin,ymax,zmin,zmax = bbox(body)
    bpy.ops.mesh.primitive_cube_add(size=1)
    sole = bpy.context.active_object
    sole.name = "Sole"
    sole.scale = ((xmax-xmin)*1.02/2, (ymax-ymin)*1.02/2, 0.006)
    sole.location = ((xmin+xmax)/2, (ymin+ymax)/2, zmin+0.003)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    print("CREATED Sole proxy")

if body and not inner:
    xmin,xmax,ymin,ymax,zmin,zmax = bbox(body)
    bpy.ops.mesh.primitive_cube_add(size=1)
    inner = bpy.context.active_object
    inner.name = "Inner"
    inner.scale = ((xmax-xmin)*0.72/2, (ymax-ymin)*0.78/2, 0.004)
    inner.location = ((xmin+xmax)/2, (ymin+ymax)/2, zmin+0.012)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    print("CREATED Inner proxy")

# Soften horsebit / hardware bulge on Body: smooth high verts near vamp center
if body:
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    xmin,xmax,ymin,ymax,zmin,zmax = bbox(body)
    cy = ymin + (ymax-ymin)*0.62  # vamp region toward opening from toe
    # In glTF Y-up after import, axes may differ — work in object local
    bpy.ops.object.mode_set(mode="EDIT")
    import bmesh
    bm = bmesh.from_edit_mesh(body.data)
    bm.verts.ensure_lookup_table()
    # select verts in middle band with high Z relative
    zs = [v.co.z for v in bm.verts]
    z_thr = sorted(zs)[int(len(zs)*0.72)]
    for v in bm.verts:
        # local coords
        if v.co.z >= z_thr and abs(v.co.x) < (xmax-xmin)*0.35:
            v.select = True
        else:
            v.select = False
    bmesh.update_edit_mesh(body.data)
    try:
        bpy.ops.mesh.vertices_smooth(factor=0.85, repeat=12)
    except Exception as e:
        print("smooth fail", e)
    bpy.ops.object.mode_set(mode="OBJECT")
    # Laplacian smooth modifier on whole body lightly
    lap = body.modifiers.new("Lap", "LAPLACIANSMOOTH")
    lap.iterations = 4
    lap.lambda_factor = 0.35
    bpy.ops.object.modifier_apply(modifier="Lap")
    print("Smoothed Body hardware region")

# Materials
def ensure_mat(obj, name, color, rough=0.7):
    if obj is None: return
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nodes=m.node_tree.nodes; links=m.node_tree.links
    nodes.clear()
    out=nodes.new("ShaderNodeOutputMaterial"); bsdf=nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value=(*color,1)
    bsdf.inputs["Roughness"].default_value=rough
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    obj.data.materials.clear(); obj.data.materials.append(m)

ensure_mat(body, "BodyMat", (0.96,0.96,0.95), 0.74)
ensure_mat(cover, "CoverMat", (0.96,0.96,0.95), 0.74)
ensure_mat(sole, "SoleMat", (0.92,0.92,0.91), 0.5)
ensure_mat(inner, "InnerMat", (0.12,0.12,0.12), 0.85)

# Keep only needed
keep = {"Body","Sole","Inner","Cover"}
for o in list(bpy.data.objects):
    if o.name not in keep:
        bpy.data.objects.remove(o, do_unlink=True)

OUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))

for path in (OUT_FE, OUT_BE):
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for name in ("Body","Sole","Inner","Cover"):
        o=bpy.data.objects.get(name)
        if o: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), use_selection=True, export_format="GLB", export_apply=True, export_yup=True)
    print("WROTE", path, path.stat().st_size)

print("FINAL", [o.name for o in bpy.data.objects])
