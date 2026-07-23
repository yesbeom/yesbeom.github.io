"""링크 공유용 OG 커버 이미지(media/og-cover.png)를 생성한다.

실행: python scripts/make_og_cover.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PHOTO = ROOT / "media" / "seongbeom-yeon.png"
OUT = ROOT / "media" / "og-cover.png"

W, H = 1200, 630

EYEBROW = "SEONGBEOM'S HOMEPAGE"
TITLE = "Design for Semiconducting Nanomaterials and Lithography"

FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"

TEXT_LEFT = 78
TEXT_RIGHT = 700

# 인물 사진에서 실제 몸이 차지하는 영역(알파 기준)
PHOTO_CROP = (320, 600, 2067, 3191)


def background() -> Image.Image:
    """어두운 남색 그라디언트 + 좌상/우상 글로우 + 미세한 도트 그리드."""
    base = Image.new("RGB", (W, H))
    px = base.load()
    for y in range(H):
        t = y / (H - 1)
        top, bottom = (26, 32, 74), (13, 17, 40)
        row = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(W):
            px[x, y] = row

    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-380, -420, 560, 380), fill=(56, 52, 118))  # 좌상단 보라
    gd.ellipse((760, -400, 1560, 320), fill=(28, 62, 130))  # 우상단 파랑
    glow = glow.filter(ImageFilter.GaussianBlur(180))
    base = Image.blend(base, Image.blend(base, glow, 0.5), 0.85)

    dots = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    dd = ImageDraw.Draw(dots)
    for y in range(18, H, 34):
        for x in range(18, W, 34):
            dd.rectangle((x, y, x + 1, y + 1), fill=(150, 165, 255, 26))
    base = Image.alpha_composite(base.convert("RGBA"), dots)

    # 강조용 액센트 도트 몇 개
    ad = ImageDraw.Draw(base)
    for cx, cy, r, a in ((660, 100, 5, 220), (1032, 190, 7, 235), (118, 438, 4, 190)):
        ad.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(124, 132, 246, a))
    return base


def person_layer() -> Image.Image:
    """사진을 오른쪽에 배치하고, 검은 옷이 배경에 묻히지 않도록 뒤에 빛을 깐다."""
    photo = Image.open(PHOTO).convert("RGBA").crop(PHOTO_CROP)

    target_h = 600
    target_w = round(photo.width * target_h / photo.height)
    photo = photo.resize((target_w, target_h), Image.LANCZOS)

    right_margin = 16
    x = W - right_margin - target_w
    y = H - target_h

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # 인물 실루엣을 크게 번지게 한 백라이트
    silhouette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tint = Image.new("RGBA", photo.size, (128, 140, 255, 255))
    tint.putalpha(photo.getchannel("A"))
    silhouette.paste(tint, (x, y), tint)
    silhouette = silhouette.filter(ImageFilter.GaussianBlur(46))
    silhouette.putalpha(silhouette.getchannel("A").point(lambda v: int(v * 0.55)))
    layer = Image.alpha_composite(layer, silhouette)

    layer.paste(photo, (x, y), photo)
    return layer


def fit_lines(draw, text, font_path, box_w, max_lines, sizes):
    """주어진 폭·줄 수에 들어가는 가장 큰 폰트 크기와 줄바꿈 결과를 고른다."""
    for size in sizes:
        font = ImageFont.truetype(font_path, size)
        words, lines, cur = text.split(), [], ""
        for word in words:
            trial = f"{cur} {word}".strip()
            if draw.textlength(trial, font=font) <= box_w or not cur:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        lines.append(cur)
        if len(lines) <= max_lines and max(draw.textlength(l, font=font) for l in lines) <= box_w:
            return font, lines
    return font, lines


def draw_text(img: Image.Image) -> None:
    d = ImageDraw.Draw(img)
    box_w = TEXT_RIGHT - TEXT_LEFT

    eyebrow_font = ImageFont.truetype(FONT_BOLD, 21)
    x = TEXT_LEFT
    for ch in EYEBROW:
        d.text((x, 150), ch, font=eyebrow_font, fill=(150, 162, 240))
        x += d.textlength(ch, font=eyebrow_font) + 5.5

    title_font, lines = fit_lines(
        d, TITLE, FONT_BOLD, box_w, 4, [78, 72, 66, 62, 58, 54, 50]
    )
    line_h = round(title_font.size * 1.16)
    y = 206
    for line in lines:
        d.text((TEXT_LEFT, y), line, font=title_font, fill=(240, 243, 255))
        y += line_h


def main() -> None:
    img = background()
    img = Image.alpha_composite(img, person_layer())
    draw_text(img)
    img.convert("RGB").save(OUT, optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
