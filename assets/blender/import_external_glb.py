"""Normalize an external GLB for the ivory-gold-bit-mule R3F viewer."""
from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector

TARGET_LENGTH = 0.270
SOURCE = os.environ.get(
    "VELCRAFT_EXTERNAL_GLB",
    r"c:\Users\ORIGION\Downloads\9ebff9b9-8671-4f43-b950-97287b9ec2ae.glb",
)
OUT_BLEND = r"C:\xampp\htdocs\custom-shoes\assets\blender\draft\external-shoe.blend"
OUT_GLB = r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\ivory-gold-bit-mule\shoe.glb"
ARCHIVE_DIR = r"C:\xampp\htdocs\custom-shoes\assets\blender\external"
ARCHIVE_GLB = os.path.join(ARCHIVE_DIR, os.path.basename(SOURCE))


def bounds(objects):
    mins = Vector((1e9, 1e9, 1e9))
    maxs = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        for corner in obj.bound_box:
            w = obj.matrix_world @ Vector(corner)
            mins = Vector((min(mins[i], w[i]) for i in range(3)))
            maxs = Vector((max(maxs[i], w[i]) for i in range(3)))
    return mins, maxs


def main() -> None:
    if not os.path.exists(SOURCE):
        print("MISSING", SOURCE)
        sys.exit(1)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SOURCE)

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        print("No mesh objects found")
        sys.exit(1)

    root = bpy.data.objects.new("ShoeRoot", None)
    bpy.context.collection.objects.link(root)

    for obj in meshes:
        obj.parent = root

    # Source asset is length ~X; our pipeline uses Y = toe direction, Z = up.
    root.rotation_euler = (0.0, 0.0, math.radians(90.0))
    bpy.context.view_layer.update()

    mins, maxs = bounds(meshes)
    size = maxs - mins
    length_axis = max(range(3), key=lambda i: size[i])
    length = size[length_axis]
    if length < 1e-6:
        print("Degenerate bounds", size[:])
        sys.exit(1)

    scale = TARGET_LENGTH / length
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.update()

    mins, maxs = bounds(meshes)
    center = Vector(((mins.x + maxs.x) * 0.5, (mins.y + maxs.y) * 0.5, mins.z))
    root.location = -center
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    for obj in meshes:
        obj.name = "Body" if obj.name.startswith("geometry") else obj.name
        mat = bpy.data.materials.new(name="Body_Material")
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = (0.90, 0.88, 0.84, 1.0)
            bsdf.inputs["Roughness"].default_value = 0.82
        obj.data.materials.clear()
        obj.data.materials.append(mat)

    os.makedirs(os.path.dirname(OUT_BLEND), exist_ok=True)
    os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
    os.makedirs(ARCHIVE_DIR, exist_ok=True)

    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
    bpy.ops.export_scene.gltf(
        filepath=OUT_GLB,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_yup=True,
    )

    import shutil

    shutil.copy2(SOURCE, ARCHIVE_GLB)

    mins, maxs = bounds(meshes)
    size = maxs - mins
    tris = sum(len(obj.data.loop_triangles) for obj in meshes if obj.data)
    print("NORMALIZED_GLB", OUT_GLB)
    print("BOUNDS_M", round(size.x, 4), round(size.y, 4), round(size.z, 4))
    print("TRIS", tris)


if __name__ == "__main__":
    main()
