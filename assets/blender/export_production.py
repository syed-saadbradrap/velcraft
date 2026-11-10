"""Export approved production GLB to frontend — ONLY run after visual approval."""
from __future__ import annotations

import os
import shutil
import sys

APPROVAL_FILE = r"C:\xampp\htdocs\custom-shoes\assets\blender\APPROVED.txt"
DRAFT_GLB = r"C:\xampp\htdocs\custom-shoes\assets\blender\draft\shoe.glb"
PRODUCTION_GLB = r"C:\xampp\htdocs\custom-shoes\assets\blender\shoe.glb"
PUBLIC_DIR = r"C:\xampp\htdocs\custom-shoes\frontend\public\models\shoes\ivory-gold-bit-mule"


def main() -> None:
    if not os.path.exists(APPROVAL_FILE):
        print("BLOCKED: No APPROVED.txt — comparison renders not approved yet.")
        sys.exit(1)
    if not os.path.exists(DRAFT_GLB):
        print("BLOCKED: Missing draft GLB. Run build first.")
        sys.exit(1)
    approved_revision = open(APPROVAL_FILE, encoding="utf-8").read().strip()
    print(f"Exporting approved revision: {approved_revision}")
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    shutil.copy2(DRAFT_GLB, PRODUCTION_GLB)
    shutil.copy2(DRAFT_GLB, os.path.join(PUBLIC_DIR, "shoe.glb"))
    print("Exported to", PRODUCTION_GLB)
    print("Exported to", os.path.join(PUBLIC_DIR, "shoe.glb"))
    print("Next: set PRODUCTION_GLB_APPROVED=true in config-builder.ts and verify R3F.")


if __name__ == "__main__":
    main()
