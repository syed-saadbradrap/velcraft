"""Quick top + perspective preview of Body+Cover draft."""
from __future__ import annotations

import math
import os

import bpy
from mathutils import Euler, Vector

ROOT = r"C:\xampp\htdocs\custom-shoes\assets\blender"
GLB = os.path.join(ROOT, "draft", "shoe-covered-external.glb")
OUT = os.path.join(ROOT, "revisions", "revision-28-covered")
RES = 900


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=GLB)
    os.makedirs(OUT, exist_ok=True)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = RES
    scene.render.resolution_y = RES
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.world = bpy.data.worlds.new("W")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.12, 0.12, 0.12, 1.0)
    bg.inputs[1].default_value = 0.6

    key = bpy.data.lights.new("Key", "AREA")
    key.energy = 120
    key_o = bpy.data.objects.new("Key", key)
    bpy.context.collection.objects.link(key_o)
    key_o.location = (0.2, -0.25, 0.35)

    fill = bpy.data.lights.new("Fill", "AREA")
    fill.energy = 40
    fill_o = bpy.data.objects.new("Fill", fill)
    bpy.context.collection.objects.link(fill_o)
    fill_o.location = (-0.25, 0.15, 0.25)

    cam_data = bpy.data.cameras.new("Cam")
    cam = bpy.data.objects.new("Cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    views = {
        "top": {
            "ortho": True,
            "scale": 0.30,
            "loc": (0.0, 0.0, 0.45),
            "rot": (0.0, 0.0, 0.0),
        },
        "perspective": {
            "ortho": False,
            "loc": (0.14, -0.18, 0.13),
            "target": Vector((0.0, -0.02, 0.03)),
        },
        "back": {
            "ortho": True,
            "scale": 0.28,
            "loc": (0.0, -0.55, 0.05),
            "rot": (math.radians(90), 0.0, 0.0),
        },
        "side": {
            "ortho": True,
            "scale": 0.30,
            "loc": (0.50, 0.0, 0.05),
            "rot": (math.radians(90), 0.0, math.radians(90)),
        },
    }

    for name, cfg in views.items():
        cam_data.type = "ORTHO" if cfg.get("ortho") else "PERSP"
        if cfg.get("ortho"):
            cam_data.ortho_scale = cfg["scale"]
        else:
            cam_data.lens = 55
        cam.location = Vector(cfg["loc"])
        if "rot" in cfg:
            cam.rotation_euler = Euler(cfg["rot"], "XYZ")
        else:
            direction = cfg["target"] - cam.location
            cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        path = os.path.join(OUT, f"covered_{name}.png")
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        print("SAVED", path)


if __name__ == "__main__":
    main()
