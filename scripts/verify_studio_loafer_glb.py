"""Check the studio-loafer GLBs: node/mesh/material names and bounds (no third-party deps)."""
import json
import struct
import sys

PATHS = [
    r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\studio-loafer\shoe.glb",
    r"C:\xampp\htdocs\custom-shoes\backend\storage\app\public\models\shoes\studio-loafer\shoe.glb",
]
REQUIRED = {"Body", "Sole", "Cover"}
REQUIRED_MATS = {"BodyMat", "SoleMat", "CoverMat"}
# glTF Y-up: X = width, Y = up (ground at 0), Z = length (toe at -Z), ~0.28 m long.
EXPECTED_SIZE = (0.09, 0.09, 0.28)
SIZE_TOLERANCE = 0.02


def read_gltf_json(path):
    with open(path, "rb") as fh:
        magic, version, _length = struct.unpack("<III", fh.read(12))
        if magic != 0x46546C67:
            raise ValueError("not a GLB")
        chunk_len, chunk_type = struct.unpack("<II", fh.read(8))
        return version, json.loads(fh.read(chunk_len))


ok = True
for path in PATHS:
    version, gltf = read_gltf_json(path)
    nodes = {n.get("name"): n for n in gltf.get("nodes", []) if "mesh" in n}
    meshes = gltf.get("meshes", [])
    mats = {m.get("name") for m in gltf.get("materials", [])}
    print(f"\n{path}\n  glTF v{version}, mesh nodes: {sorted(nodes)}  materials: {sorted(mats)}")
    lo = [1e9] * 3
    hi = [-1e9] * 3
    for name, node in sorted(nodes.items()):
        mesh = meshes[node["mesh"]]
        prim_info = []
        for prim in mesh["primitives"]:
            acc = gltf["accessors"][prim["attributes"]["POSITION"]]
            lo = [min(a, b) for a, b in zip(lo, acc["min"])]
            hi = [max(a, b) for a, b in zip(hi, acc["max"])]
            mat = gltf["materials"][prim["material"]]["name"] if "material" in prim else None
            prim_info.append(f"verts={acc['count']} attrs={sorted(prim['attributes'])} mat={mat}")
        print(f"  {name}: mesh='{mesh.get('name')}' " + "; ".join(prim_info))
    size = [h - l for h, l in zip(hi, lo)]
    print(f"  bounds (m) min={[round(v, 4) for v in lo]} max={[round(v, 4) for v in hi]} "
          f"size={[round(v, 4) for v in size]}")
    bad_axes = [
        "XYZ"[i] for i, (s, e) in enumerate(zip(size, EXPECTED_SIZE)) if abs(s - e) > SIZE_TOLERANCE
    ]
    if bad_axes or abs(lo[1]) > 0.002:
        ok = False
        print(f"  ORIENTATION FAIL: off-size axes={bad_axes} minY={lo[1]:.4f}")
    missing = REQUIRED - set(nodes)
    missing_mats = REQUIRED_MATS - mats
    if missing or missing_mats:
        ok = False
        print("  MISSING:", missing, missing_mats)

print("\nRESULT:", "OK" if ok else "FAIL")
sys.exit(0 if ok else 1)
