#!/usr/bin/env python3
"""Build LPC character spritesheets for the Nuu world.

Downloads Universal-LPC-Spritesheet layers, composites each preset, and slices
the walk band (rows 8-11 = up/left/down/right, 9 frames each) into a clean
576x256 sheet at public/art/characters/<name>.png.

Also compiles per-layer attribution into public/art/CREDITS.md (LPC art is
CC-BY-SA 3.0 / GPL 3.0 / OGA-BY — attribution is required).

Usage: python3 scripts/build_lpc.py
Reproducible: assets are generated from these layer lists, not hand-edited.
"""
import csv
import io
import os
import sys
import urllib.request
from PIL import Image

REPO = "sanderfrenken/Universal-LPC-Spritesheet-Character-Generator"
RAW = f"https://raw.githubusercontent.com/{REPO}/master"
SHEETS = f"{RAW}/spritesheets"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "art", "characters")
FRAME = 64
WALK_ROW_START = 8  # rows 8-11: up, left, down, right
WALK_COLS = 9

# Presets: ordered layer paths (relative to spritesheets/, no .png).
# Bottom-to-top compositing order.
# Layers are composited bottom-to-top. LPC zPos order matters: body(10) <
# eyes/nose(105) < eyebrows < hair(120). Hair must NOT cover the forehead or
# it erases the (small) face — so defaults use short/back hairstyles + visible
# eyebrows so faces read at game scale.
PRESETS = {
    "wanderer": [
        "body/bodies/male/light",
        "eyes/human/adult/brown",
        "eyes/eyebrows/thick/adult/black",
        "head/nose/button/adult/light",
        "legs/pants/male/charcoal",
        "feet/shoes/male/brown",
        "torso/clothes/longsleeve/longsleeve/male/forest",
        "hair/high_and_tight/male/black",
    ],
    "nomad": [
        "body/bodies/female/light",
        "eyes/human/adult/blue",
        "eyes/eyebrows/thick/adult/black",
        "head/nose/button/adult/light",
        "legs/pants/female/brown",
        "feet/shoes/female/black",
        "torso/clothes/longsleeve/longsleeve/female/bluegray",
        "hair/ponytail/female/raven",
    ],
    "steppe": [
        "body/bodies/male/bronze",
        "eyes/human/adult/brown",
        "eyes/eyebrows/thick/adult/black",
        "head/nose/button/adult/bronze",
        "legs/pants/male/blue",
        "feet/shoes/male/black",
        "torso/clothes/longsleeve/longsleeve/male/maroon",
        "hair/flat_top_fade/male/black",
    ],
}


def fetch(path: str) -> Image.Image:
    url = f"{SHEETS}/{path}.png"
    with urllib.request.urlopen(url) as r:
        if r.status != 200:
            raise RuntimeError(f"{url} -> {r.status}")
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def composite_walk(layers: list[str]) -> Image.Image:
    imgs = [fetch(p) for p in layers]
    w = 832
    h = max(im.height for im in imgs)
    base = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    for im in imgs:
        base.alpha_composite(im, (0, 0))
    return base.crop((0, WALK_ROW_START * FRAME, WALK_COLS * FRAME, (WALK_ROW_START + 4) * FRAME))


def load_credits() -> list[dict]:
    url = f"{RAW}/CREDITS.csv"
    with urllib.request.urlopen(url) as r:
        return list(csv.DictReader(io.StringIO(r.read().decode("utf-8"))))


def credit_for(path: str, rows: list[dict]) -> dict | None:
    # CREDITS filenames are path stems; match the longest filename that the
    # layer path starts with.
    best = None
    for row in rows:
        fn = (row.get("filename") or "").strip()
        if fn and path.startswith(fn):
            if best is None or len(fn) > len(best.get("filename", "")):
                best = row
    return best


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    credits = load_credits()
    used: dict[str, dict] = {}
    for name, layers in PRESETS.items():
        sheet = composite_walk(layers)
        out = os.path.join(OUT, f"{name}.png")
        sheet.save(out)
        print(f"built {name}.png {sheet.size}")
        for p in layers:
            c = credit_for(p, credits)
            if c:
                used[p] = c

    lines = [
        "# Art credits",
        "",
        "Character art is built from the **Universal LPC Spritesheet**",
        f"(<https://github.com/{REPO}>), composited by `scripts/build_lpc.py`.",
        "",
        "LPC assets are licensed **CC-BY-SA 3.0 / GPL 3.0 / OGA-BY 3.0**.",
        "Per-layer authors and licenses:",
        "",
        "| Layer | Authors | Licenses |",
        "| --- | --- | --- |",
    ]
    for p in sorted(used):
        c = used[p]
        authors = (c.get("authors") or "").replace("\n", " ").strip() or "—"
        lic = (c.get("licenses") or "").replace("\n", " ").strip() or "—"
        lines.append(f"| `{p}` | {authors} | {lic} |")
    lines.append("")
    cred_path = os.path.join(OUT, "..", "CREDITS.md")
    with open(cred_path, "w") as f:
        f.write("\n".join(lines))
    print(f"wrote {os.path.normpath(cred_path)} ({len(used)} layers)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
