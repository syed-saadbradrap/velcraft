"""Render the exported studio-loafer GLB (backless Body + Sole) on a ground plane."""
import bpy
import math
from mathutils import Vector
from pathlib import Path

GLB = Path(r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\studio-loafer\shoe.glb")
OUT = Path(r"C:\xampp\htdocs\custom-shoes\assets\blender\previews\studio_loafer_client_v3")
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(GLB))
for name in ("BodyMat", "CoverMat"):
    m = bpy.data.materials.get(name)
    if m:
        b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        b.inputs["Base Color"].default_value = (0.85, 0.42, 0.33, 1)


def show_variant(variant):
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name in ("Body", "Cover"):
            hidden = (o.name == "Cover") == (variant == "backless")
            o.hide_render = hidden

bpy.ops.mesh.primitive_plane_add(size=2, location=(0, 0, 0))
ground = bpy.context.active_object
gm = bpy.data.materials.new("Ground")
gm.use_nodes = True
next(n for n in gm.node_tree.nodes if n.type == "BSDF_PRINCIPLED").inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1)
ground.data.materials.append(gm)

scene = bpy.context.scene
try:
    scene.render.engine = "BLENDER_EEVEE"
except TypeError as e:
    print("engine fallback", e)
    scene.render.engine = "BLENDER_WORKBENCH"
scene.render.resolution_x = 960
scene.render.resolution_y = 640
world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs["Strength"].default_value = 0.8

sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 3
sun.rotation_euler = (math.radians(40), 0, math.radians(30))
scene.collection.objects.link(sun)

cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
cam.data.lens = 60
scene.collection.objects.link(cam)
scene.camera = cam

# Imported glTF is back in Blender Z-up: toe at +Y, ground at Z=0.
target = Vector((0, 0, 0.04))
views = {
    "side": Vector((0.55, 0.0, 0.06)),
    "threeq": Vector((0.38, 0.30, 0.26)),
    "rear_threeq": Vector((-0.35, -0.32, 0.24)),
}
jobs = [("backless", v) for v in views] + [("covered", "side"), ("covered", "threeq")]
for variant, name in jobs:
    show_variant(variant)
    loc = views[name]
    cam.location = loc
    cam.rotation_euler = (target - loc).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = str(OUT / f"{variant}_{name}.png")
    bpy.ops.render.render(write_still=True)
    print("WROTE", scene.render.filepath)
print("DONE")
