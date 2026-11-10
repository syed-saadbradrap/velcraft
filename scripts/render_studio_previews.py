import bpy
from pathlib import Path
out = Path(r"C:\xampp\htdocs\custom-shoes\assets\blender\previews")
out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=r"C:\xampp\htdocs\custom-shoes\assets\blender\studio_loafer.blend")
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in dir(bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items) else "BLENDER_WORKBENCH"
# prefer workbench for speed
try:
    scene.render.engine = "BLENDER_WORKBENCH"
except Exception:
    pass
scene.render.resolution_x = 900
scene.render.resolution_y = 700
scene.render.film_transparent = True
# camera
cam_data = bpy.data.cameras.new("QA_Cam")
cam = bpy.data.objects.new("QA_Cam", cam_data)
bpy.context.collection.objects.link(cam)
scene.camera = cam
cam_data.lens = 50
# light
light_data = bpy.data.lights.new("QA_Light", type="AREA")
light_data.energy = 200
light = bpy.data.objects.new("QA_Light", light_data)
bpy.context.collection.objects.link(light)
light.location = (0.4, -0.3, 0.6)
views = {
  "side": ((0.55, 0.0, 0.12), (0.0, 0.0, 0.04)),
  "threeq": ((0.35, -0.35, 0.18), (0.0, 0.0, 0.04)),
  "top": ((0.0, 0.0, 0.55), (0.0, 0.0, 0.0)),
  "rear": ((0.0, 0.55, 0.14), (0.0, 0.0, 0.05)),
}
import math
from mathutils import Vector
for name,(loc,tgt) in views.items():
    cam.location = loc
    direction = Vector(tgt) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(out / f"studio_{name}.png")
    bpy.ops.render.render(write_still=True)
    print("WROTE", scene.render.filepath)
