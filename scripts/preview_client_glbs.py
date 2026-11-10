import bpy
from pathlib import Path
from mathutils import Vector

out_dir = Path(r"C:\xampp\htdocs\custom-shoes\assets\blender\previews\client_glbs")
out_dir.mkdir(parents=True, exist_ok=True)

jobs = [
    ("covered", r"C:\Users\ORIGION\Downloads\white_mesh.glb"),
    ("backless", r"C:\Users\ORIGION\Downloads\white_mesh (1).glb"),
]

def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

def scene_bbox():
    pts=[]
    for o in bpy.data.objects:
        if o.type!="MESH": continue
        pts += [o.matrix_world @ Vector(c) for c in o.bound_box]
    xs=[p.x for p in pts]; ys=[p.y for p in pts]; zs=[p.z for p in pts]
    mn=Vector((min(xs),min(ys),min(zs))); mx=Vector((max(xs),max(ys),max(zs)))
    return mn, mx, (mx-mn)

for label, path in jobs:
    clear()
    bpy.ops.import_scene.gltf(filepath=path)
    # material white
    mat=bpy.data.materials.new("Prev")
    mat.use_nodes=True
    bsdf=next(n for n in mat.node_tree.nodes if n.type=="BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value=(0.92,0.92,0.92,1)
    for o in bpy.data.objects:
        if o.type=="MESH":
            o.data.materials.clear(); o.data.materials.append(mat)
            bpy.context.view_layer.objects.active=o
            bpy.ops.object.shade_smooth()
    mn,mx,size=scene_bbox()
    center=(mn+mx)*0.5
    # scale to ~0.28 length for preview framing then render
    # camera
    for name in list(bpy.data.cameras.keys()):
        pass
    cam_data=bpy.data.cameras.new("Cam"); cam=bpy.data.objects.new("Cam",cam_data)
    bpy.context.collection.objects.link(cam); bpy.context.scene.camera=cam
    light_data=bpy.data.lights.new("L","AREA"); light_data.energy=400
    light=bpy.data.objects.new("L",light_data); bpy.context.collection.objects.link(light)
    # place camera based on bbox
    diag=max(size.x,size.y,size.z)
    views={
        "side": (Vector((center.x, center.y-diag*1.8, center.z+diag*0.15)), center),
        "threeq": (Vector((center.x+diag*1.2, center.y-diag*1.2, center.z+diag*0.5)), center),
        "top": (Vector((center.x, center.y, center.z+diag*2.0)), center),
        "rear": (Vector((center.x, center.y+diag*1.8, center.z+diag*0.2)), center),
    }
    light.location=center+Vector((diag, -diag, diag))
    scene=bpy.context.scene
    try:
        scene.render.engine="BLENDER_WORKBENCH"
    except Exception:
        pass
    scene.render.resolution_x=900; scene.render.resolution_y=700
    scene.render.film_transparent=True
    for vname,(loc,tgt) in views.items():
        cam.location=loc
        direction=(tgt-loc); cam.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(out_dir / f"{label}_{vname}.png")
        bpy.ops.render.render(write_still=True)
        print("WROTE", scene.render.filepath)
print("DONE")
