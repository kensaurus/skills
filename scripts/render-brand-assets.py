"""Draw the kenji mark. No ML. Matches the README hero palette."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SITE = ROOT / "site"
ASSETS.mkdir(exist_ok=True)
SITE.mkdir(exist_ok=True)

INK = (17, 17, 17)
PAPER = (244, 241, 234)
BONE = (244, 244, 242)
BLUE = (59, 130, 246)
MUTED = (163, 163, 163)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    for cand in (
        Path(r"C:\Windows\Fonts") / name,
        Path("/usr/share/fonts/truetype/dejavu") / name,
    ):
        if cand.exists():
            return ImageFont.truetype(str(cand), size)
    return ImageFont.load_default()


def draw_mark(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], bar: tuple, tick: tuple) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    # Spine: 14% width, 62% height, optically centered
    bw = max(8, int(w * 0.14))
    bh = int(h * 0.62)
    bx = x0 + (w - bw) // 2
    by = y0 + (h - bh) // 2
    draw.rectangle((bx, by, bx + bw, by + bh), fill=bar)
    # First-line tick: short, near the top of the spine
    tw = int(w * 0.34)
    th = max(6, int(h * 0.055))
    tx = bx + bw // 2
    ty = by + int(bh * 0.18)
    draw.rectangle((tx, ty, tx + tw, ty + th), fill=tick)


def logo(path: Path, bg: tuple, bar: tuple, tick: tuple, frame: tuple) -> None:
    size = 1024
    im = Image.new("RGB", (size, size), bg)
    d = ImageDraw.Draw(im)
    inset = 48
    d.rectangle((inset, inset, size - inset - 1, size - inset - 1), outline=frame, width=6)
    draw_mark(d, (180, 180, 844, 844), bar, tick)
    im.save(path, "PNG")


def og(path: Path) -> None:
    w, h = 1200, 630
    im = Image.new("RGB", (w, h), INK)
    d = ImageDraw.Draw(im)
    # Left plate
    draw_mark(d, (72, 90, 300, 540), BONE, BLUE)
    title = font("segoeuib.ttf", 64)
    sub = font("segoeui.ttf", 32)
    micro = font("segoeui.ttf", 22)
    x = 340
    d.text((x, 188), "You say the job.", font=title, fill=BONE)
    d.text((x, 268), "The playbook runs.", font=title, fill=BONE)
    # Tool names, not a count: a count goes stale every release.
    d.text((x, 360), "kenji skills  ·  Claude Code · Cursor · Codex · Gemini", font=sub, fill=MUTED)
    d.text((x, 540), "npx @kensaurus/skills --all", font=micro, fill=BLUE)
    im.save(path, "PNG")


def favicon(path: Path) -> None:
    im = Image.new("RGB", (64, 64), INK)
    d = ImageDraw.Draw(im)
    draw_mark(d, (10, 10, 54, 54), BONE, BLUE)
    im.save(path, "PNG")


logo(ASSETS / "logo.png", INK, BONE, BLUE, BONE)
logo(ASSETS / "logo-light.png", PAPER, INK, BLUE, INK)
og(ASSETS / "og.png")
favicon(ASSETS / "favicon.png")
# landing copies
for name in ("logo.png", "logo-light.png", "og.png", "favicon.png"):
    (SITE / name).write_bytes((ASSETS / name).read_bytes())
print("wrote", ", ".join(p.name for p in sorted(ASSETS.glob("*.png"))))
