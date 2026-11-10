# Velcraft Mule — Blender Approval Workflow

**Rule: Never use an unapproved GLB on the website.**

Website integration stays **OFF** until you explicitly approve a revision's comparison renders.

---

## Phase A — Iterative revisions (repeat until approved)

### Revision N

1. **Improve geometry** in `build_velcraft_production_mule.py`
2. **Build draft only** (no `frontend/public` export):
   ```powershell
   $env:VELCRAFT_REVISION="revision-01"
   & "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python "C:\Users\ORIGION\dev\blender-mcp-setup\build_velcraft_production_mule.py"
   ```
   Outputs: `assets/blender/draft/shoe.blend`, `draft/shoe.glb`

3. **Render 5 views + comparison sheets**:
   ```powershell
   $env:VELCRAFT_REVISION="revision-01"
   & "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python "C:\Users\ORIGION\dev\blender-mcp-setup\render_model_comparison.py"
   ```

4. **Review** `assets/blender/revisions/revision-01/`:
   | File | Content |
   |---|---|
   | `model_front.png` | Front |
   | `model_left.png` | Left |
   | `model_right.png` | Right |
   | `model_top.png` | Top |
   | `model_perspective.png` | Perspective |
   | `compare_*.png` | **Reference Photo \| Blender Render** |
   | `comparison_sheet_revision-01.png` | Full sheet |

5. **Wait for your approval.** Do not export to website.

### Revision N+1

Fix every issue you mention → rebuild → re-render → new comparison sheet → wait again.

---

## Phase B — After you approve renders (only then)

1. Export production GLB (`VELCRAFT_EXPORT_WEB=1` + `export_production.py`)
2. Verify:
   - [ ] Meshes: Body, Upper, Inner, Sole, Buckle, Logo
   - [ ] UVs on all meshes
   - [ ] PBR materials (Body, Upper, Sole, Inner, Metal, Enamel, Logo)
   - [ ] Triangle count 25k–40k
   - [ ] GLB opens correctly in Blender
   - [ ] GLB loads in React Three Fiber
3. Copy approved GLB to `frontend/public/models/shoes/ivory-gold-bit-mule/`
4. Re-enable slug in `config-builder.ts` → `importedModelSlugs`
5. Bump `PRODUCTION_SHOE_GLB_VERSION` in viewer

---

## Reference photos

`assets/blender/references/`
- `ivory-gold-bit-mule-primary.png` — perspective
- `black-suede-mule-top.png` — top
- `camel-suede-mule-side.png` — side

---

## Approval status

| Revision | Status | Comparison sheet |
|---|---|---|
| revision-01 | Superseded | `revisions/revision-01/comparison_sheet_revision-01.png` |
| revision-02 | Superseded | `revisions/revision-02/comparison_sheet_revision-02.png` |
| revision-03 | Superseded | `revisions/revision-03/comparison_sheet_revision-03.png` |
| revision-04 | Superseded | `revisions/revision-04/comparison_sheet_revision-04.png` |
| revision-05 | Superseded | `revisions/revision-05/comparison_sheet_revision-05.png` |
| revision-06 | Superseded | `revisions/revision-06/comparison_sheet_revision-06.png` |
| revision-07 | Superseded | `revisions/revision-07/comparison_sheet_revision-07.png` |
| revision-08 | Superseded | `revisions/revision-08/comparison_sheet_revision-08.png` |
| revision-09 | Superseded | `revisions/revision-09/comparison_sheet_revision-09.png` |
| revision-10 | Superseded | `revisions/revision-10/comparison_sheet_revision-10.png` |
| revision-11 | Superseded | `revisions/revision-11/comparison_sheet_revision-11.png` |
| revision-12 | Superseded | `revisions/revision-12/comparison_sheet_revision-12.png` |
| revision-13 | Superseded | `revisions/revision-13/comparison_sheet_revision-13.png` |
| revision-14 | Superseded | `revisions/revision-14/comparison_sheet_revision-14.png` |
| revision-15 | Superseded | `revisions/revision-15/comparison_sheet_revision-15.png` |
| revision-16 | Superseded | `revisions/revision-16/comparison_sheet_revision-16.png` |
| revision-17 | Superseded | `revisions/revision-17/comparison_sheet_revision-17.png` |
| revision-18 | Superseded | `revisions/revision-18/comparison_sheet_revision-18.png` |
| revision-19 | Superseded | `revisions/revision-19/comparison_sheet_revision-19.png` |
| revision-20 | Superseded | `revisions/revision-20/comparison_sheet_revision-20.png` |
| revision-21 | Superseded | `revisions/revision-21/comparison_sheet_revision-21.png` |
| revision-22 | Superseded | `revisions/revision-22/comparison_sheet_revision-22.png` |
| revision-23 | Superseded | `revisions/revision-23/comparison_sheet_revision-23.png` |
| revision-24 | Superseded | `revisions/revision-24/comparison_sheet_revision-24.png` |
| revision-25 | Superseded | `revisions/revision-25/comparison_sheet_revision-25.png` |
| revision-26 | Superseded | `revisions/revision-26/comparison_sheet_revision-26.png` |
| revision-27 | Superseded | `revisions/revision-27/comparison_sheet_revision-27.png` |
| **external GLB** | Superseded (Body kept) | previous single-mesh mule |
| **covered-heel-v2** | **Live local (Body + Cover)** | `frontend/public/models/shoes/ivory-gold-bit-mule/shoe.glb` — Style toggle: backless hides `Cover`, covered shows it. Previews: `revisions/revision-28-covered/` |

Update this table when you approve or request fixes.
