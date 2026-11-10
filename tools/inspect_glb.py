import json
import struct
import sys


def inspect(path: str) -> None:
    with open(path, "rb") as fh:
        data = fh.read()
    jlen = struct.unpack_from("<I", data, 12)[0]
    jstart = data.index(b"{")
    doc = json.loads(data[jstart : jstart + jlen])
    meshes = doc.get("meshes", [])
    print(f"\n=== {path.split(chr(92))[-1]} ({len(data):,} bytes) ===")
    for i, node in enumerate(doc.get("nodes", [])):
        tr = node.get("translation", [0, 0, 0])
        sc = node.get("scale", [1, 1, 1])
        mesh_name = None
        if "mesh" in node:
            mesh_name = meshes[node["mesh"]].get("name", f"mesh_{node['mesh']}")
        print(
            f"  {node.get('name', '?')} mesh={mesh_name} "
            f"T={[round(x, 4) for x in tr]} S={[round(x, 4) for x in sc]}"
        )
    mins = [1e9] * 3
    maxs = [-1e9] * 3
    for acc in doc.get("accessors", []):
        if "min" not in acc or acc["type"] != "VEC3":
            continue
        for k in range(3):
            mins[k] = min(mins[k], acc["min"][k])
            maxs[k] = max(maxs[k], acc["max"][k])
    if mins[0] < 1e8:
        print(f"  bounds min={[round(x, 4) for x in mins]} max={[round(x, 4) for x in maxs]}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        inspect(p)
