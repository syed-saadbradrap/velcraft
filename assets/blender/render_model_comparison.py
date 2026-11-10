"""Render 5 orthographic/perspective views and composite next to reference photos."""
from __future__ import annotations

import json
import math
import os
import subprocess
import sys

import bmesh
import bpy
from mathutils import Euler, Vector

ROOT = r"C:\xampp\htdocs\custom-shoes\assets\blender"
REVISION = os.environ.get("VELCRAFT_REVISION", "revision-27")
OUT_DIR = os.path.join(ROOT, "revisions", REVISION)
REF_DIR = os.path.join(ROOT, "references")
DRAFT_BLEND = os.path.join(ROOT, "draft", "shoe.blend")
RES = 960

REF_MAP = {
    "front": os.path.join(REF_DIR, "ivory-gold-bit-mule-primary.png"),
    "perspective": os.path.join(REF_DIR, "ivory-gold-bit-mule-primary.png"),
    "top": os.path.join(REF_DIR, "covered-loafer-top.png")
    if os.path.exists(os.path.join(REF_DIR, "covered-loafer-top.png"))
    else os.path.join(REF_DIR, "black-suede-mule-top.png"),
    "left": os.path.join(REF_DIR, "camel-suede-mule-side.png"),
    "right": os.path.join(REF_DIR, "camel-suede-mule-side.png"),
}

TARGET = Vector((0.0, 0.0, 0.024))

VIEWS = {
    "front": {"ortho": True, "location": (0.065, -0.405, 0.026), "rotation": (math.radians(90), 0.0, math.radians(9))},
    "left": {"ortho": True, "location": (0.42, 0.0, 0.026), "rotation": (math.radians(90), 0.0, math.radians(90))},
    "right": {"ortho": True, "location": (-0.42, 0.0, 0.026), "rotation": (math.radians(90), 0.0, math.radians(-90))},
    "top": {"ortho": True, "location": (0.0, 0.0, 0.42), "rotation": (0.0, 0.0, 0.0)},
    "perspective": {"ortho": False, "location": (0.12, -0.155, 0.115), "rotation": None, "target": Vector((0.0, -0.01, 0.022))},
}


def setup_render():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = RES
    scene.render.resolution_y = RES
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    if hasattr(scene, "eevee"):
        eevee = scene.eevee
        if hasattr(eevee, "use_gtao"):
            eevee.use_gtao = True
            eevee.gtao_distance = 0.08
        if hasattr(eevee, "use_soft_shadows"):
            eevee.use_soft_shadows = True
    if hasattr(scene, "view_settings"):
        scene.view_settings.exposure = -0.92
        if hasattr(scene.view_settings, "view_transform"):
            scene.view_settings.view_transform = "Filmic"
    scene.world = bpy.data.worlds.new("StudioWorld")
    scene.world.use_nodes = True
    bg = scene.world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.68, 0.66, 0.63, 1.0)
    bg.inputs[1].default_value = 0.85

    floor = bpy.data.meshes.new("Floor")
    floor_obj = bpy.data.objects.new("Floor", floor)
    bpy.context.collection.objects.link(floor_obj)
    bm = bmesh.new()
    s = 1.2
    v = [bm.verts.new((x, y, 0)) for x, y in [(-s, -s), (s, -s), (s, s), (-s, s)]]
    bm.faces.new(v)
    bm.to_mesh(floor)
    bm.free()
    floor_mat = bpy.data.materials.new("Floor")
    floor_mat.use_nodes = True
    floor_mat.node_tree.nodes["Principled BSDF"].inputs[0].default_value = (0.72, 0.70, 0.66, 1.0)
    floor_obj.data.materials.append(floor_mat)

    key = bpy.data.lights.new("Key", "AREA")
    key_obj = bpy.data.objects.new("Key", key)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (0.20, -0.18, 0.24)
    key_obj.rotation_euler = (math.radians(55), 0, math.radians(18))
    key_obj.data.energy = 58
    key_obj.data.size = 0.40

    fill = bpy.data.lights.new("Fill", "AREA")
    fill_obj = bpy.data.objects.new("Fill", fill)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-0.24, 0.16, 0.14)
    fill_obj.data.energy = 38
    fill_obj.data.size = 0.50

    rim = bpy.data.lights.new("Rim", "AREA")
    rim_obj = bpy.data.objects.new("Rim", rim)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 0.22, 0.08)
    rim_obj.data.energy = 22
    rim_obj.data.size = 0.35


def tone_down_shoe_materials():
    """Clay-review pass: keep metal readable but prevent ivory surfaces blowing out."""
    clay = {
        "Body_Material": (0.72, 0.70, 0.66),
        "Upper_Material": (0.74, 0.72, 0.68),
        "Inner_Material": (0.56, 0.55, 0.52),
        "Lining_Material": (0.04, 0.04, 0.04),
        "HeelPad_Material": (0.13, 0.04, 0.05),
        "Sole_Material": (0.015, 0.015, 0.015),
        "Logo_Material": (0.52, 0.53, 0.56),
    }
    for mat in bpy.data.materials:
        if mat.name == "Metal_Buckle" and mat.use_nodes:
            bsdf = mat.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = (0.58, 0.44, 0.12, 1.0)
                bsdf.inputs["Roughness"].default_value = 0.22
                bsdf.inputs["Metallic"].default_value = 1.0
                key = "Specular IOR Level" if "Specular IOR Level" in bsdf.inputs else "Specular"
                if key in bsdf.inputs:
                    bsdf.inputs[key].default_value = 0.55
            continue
        if mat.name not in clay or not mat.use_nodes:
            continue
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            continue
        bsdf.inputs["Base Color"].default_value = (*clay[mat.name], 1.0)
        bsdf.inputs["Roughness"].default_value = max(
            float(bsdf.inputs["Roughness"].default_value), 0.88 if "Metal" not in mat.name else 0.12
        )
        key = "Specular IOR Level" if "Specular IOR Level" in bsdf.inputs else "Specular"
        if key in bsdf.inputs:
            bsdf.inputs[key].default_value = min(float(bsdf.inputs[key].default_value), 0.18)


def look_at(obj, target: Vector):
    direction = target - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def render_views():
    os.makedirs(OUT_DIR, exist_ok=True)
    setup_render()
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("CompareCam")
    cam_obj = bpy.data.objects.new("CompareCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    rendered = {}
    for name, cfg in VIEWS.items():
        cam_data.type = "ORTHO" if cfg.get("ortho") else "PERSP"
        cam_data.ortho_scale = 0.29 if name == "top" else (
            0.265 if name == "front" else (0.275 if name in ("left", "right") else (0.28 if cfg.get("ortho") else 1.0))
        )
        if not cfg.get("ortho"):
            cam_data.lens = 55
        cam_obj.location = Vector(cfg["location"])
        if cfg.get("rotation"):
            cam_obj.rotation_euler = Euler(cfg["rotation"], "XYZ")
        else:
            look_at(cam_obj, Vector(cfg["target"]))
        path = os.path.join(OUT_DIR, f"model_{name}.png")
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
        rendered[name] = path
        print("RENDERED", path)
    return rendered


def composite_with_pillow(rendered: dict[str, str]):
    script = os.path.join(ROOT, "composite_comparison.py")
    payload = {"out_dir": OUT_DIR, "rendered": rendered, "refs": REF_MAP, "revision": REVISION}
    env = os.environ.copy()
    env["VELCRAFT_COMPOSITE_JSON"] = json.dumps(payload)
    py_candidates = [
        r"C:\Users\ORIGION\AppData\Local\Programs\Python\Python313\python.exe",
        r"C:\Users\ORIGION\AppData\Local\Programs\Python\Python312\python.exe",
        "py",
    ]
    for py in py_candidates:
        try:
            cmd = [py, script] if py != "py" else ["py", "-3", script]
            subprocess.run(cmd, check=True, env=env)
            return
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    print("COMPOSITE_SKIP no system Python with Pillow found")


def main():
    if not os.path.exists(DRAFT_BLEND):
        raise SystemExit(f"Missing draft blend: {DRAFT_BLEND}")
    bpy.ops.wm.open_mainfile(filepath=DRAFT_BLEND)
    tone_down_shoe_materials()
    rendered = render_views()
    composite_with_pillow(rendered)
    print("COMPARISON_DIR", OUT_DIR)


if __name__ == "__main__":
    main()
