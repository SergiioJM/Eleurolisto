"""Reel corto: "Un café de 2 € al día" (gastos hormiga). Voz: Javier de Madrid (Creative Claw).
Vídeo con música y efectos ajustados a la voz (timings.json); la voz se añade en Creative Claw (add_audio_to_video, mix).

  python3 render.py frames | video
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
from reelkit import *  # noqa: E402,F403
from PIL import Image, ImageDraw  # noqa: E402

TIM = json.load(open(os.path.join(HERE, "timings.json")))
CUP_Y = 840


def cup(c, cx, cy, s=1.0, t=0.0, steam=True):
    if s <= 0.02:
        return
    ss = 2
    w, h = 520, 520
    im = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = ss
    d.ellipse([60 * k, 420 * k, 460 * k, 490 * k], fill=(203, 213, 225))           # plato
    d.ellipse([360 * k, 230 * k, 470 * k, 360 * k], outline=(248, 250, 252), width=26 * k)  # asa
    d.rounded_rectangle([110 * k, 200 * k, 400 * k, 450 * k], radius=70 * k, fill=(248, 250, 252))  # taza
    d.rectangle([110 * k, 200 * k, 400 * k, 260 * k], fill=(248, 250, 252))
    d.ellipse([110 * k, 170 * k, 400 * k, 235 * k], fill=(248, 250, 252))
    d.ellipse([128 * k, 180 * k, 382 * k, 226 * k], fill=(92, 52, 30))           # café
    d.rectangle([110 * k, 330 * k, 400 * k, 362 * k], fill=GREEN)                 # franja de marca
    if steam:
        for j, x0 in enumerate((190, 255, 320)):
            pts = []
            for i in range(24):
                y = 160 - i * 6
                x = x0 + math.sin(i * 0.45 + t * 5 + j * 1.7) * 14
                pts.append((x * k, y * k))
            a = int(150 + 80 * math.sin(t * 3 + j))
            d.line(pts, fill=(226, 232, 240, a), width=9 * k, joint="curve")
    im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
    c.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def price_tag(c, cx, cy, s):
    if s <= 0.02:
        return
    w, h = 230, 120
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(lay).rounded_rectangle([0, 0, w - 1, h - 1], radius=28, fill=AMBER)
    tl = text_layer("2 €", POP, 76, DARK)
    lay.alpha_composite(tl, ((w - tl.width) // 2, (h - tl.height) // 2 + 4))
    lay = lay.rotate(-10, resample=Image.BICUBIC, expand=True)
    paste(c, lay, cx, cy, scale=s)


def ant(d, x, y, k=1.0):
    col = (180, 83, 9)
    for i, dx in enumerate((-22, 0, 24)):
        r = (10, 12, 15)[i] * k
        d.ellipse([x + dx * k - r, y - r, x + dx * k + r, y + r], fill=col)
    for dx in (-8, 4, 16):
        d.line([x + dx * k, y, x + dx * k - 8 * k, y + 22 * k], fill=col, width=int(4 * k))
        d.line([x + dx * k, y, x + dx * k + 8 * k, y + 22 * k], fill=col, width=int(4 * k))


def parts_of(i):
    return TIM["segments"][i]["parts"]


# ---------------- escenas ----------------
def s_gancho(c, t, r):
    p0 = parts_of(0)[0]["dur"]
    text(c, "UN CAFÉ AL DÍA", POP, 96, WHITE, CX, 360, t, 0.0, 0.35, "pop")
    cup(c, CX, CUP_Y, max(0.01, ease_back(prog(t, 0.1, 0.45))), t)
    price_tag(c, 760, 640, max(0.0, ease_back(prog(t, p0 * 0.45, 0.4))) if t > p0 * 0.45 else 0)
    p1s = parts_of(0)[1]["start"] - r.bounds[0]
    text(c, "Parece poca cosa…", INTS, 60, MUTED, CX, 1180, t, p1s, 0.35, "slide")


def s_anyo(c, t, dur):
    text(c, "AL AÑO", INTS, 60, MUTED, CX, 320, t, 0.0, 0.3, "slide")
    cols, rows = 19, 20
    x0, y0, dx, dy, rr = 160, 640, 42, 34, 12
    fill = ease_in_out(prog(t, 0.15, max(0.5, dur - 0.45)))
    n = int(365 * fill)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i in range(365):
        cx_, cy_ = x0 + (i % cols) * dx, y0 + (i // cols) * dy
        d.ellipse([cx_ - rr, cy_ - rr, cx_ + rr, cy_ + rr], fill=AMBER if i < n else DIM)
    c.alpha_composite(im)
    paste(c, text_layer(eur(2 * n), POP, 170, AMBER if n >= 365 else WHITE), CX, 470)
    text(c, "365 cafés", INTM, 40, FAINT, CX, 1360, t, 0.3, 0.3)


def s_diez(c, t, r, b):
    p = parts_of(2)
    text(c, "EN 10 AÑOS", INTS, 60, MUTED, CX, 330, t, 0.0, 0.3, "slide")
    st, en = 0.2, p[0]["dur"] * 0.85
    k = ease_in_out(prog(t, st, en - st))
    val = 730 + (7300 - 730) * k
    sl = prog(t, en, 0.25)
    sc = 1.0 + 0.25 * (1 - ease_out(sl)) if t >= en else 1.0
    paste(c, text_layer(eur(val), POP, 190, mix(WHITE, AMBER, k)), CX, 560, scale=sc)
    banner(c, "x10", CX, 760, t, 0.1, color=AMBER, txt=DARK, size=60, h=100, pad_x=44)
    p1s = p[1]["start"] - b
    cup(c, CX, 1110, 0.55 * ease_out(prog(t, p1s - 0.1, 0.35)), t)
    text(c, "solo en café", INTS, 56, MUTED, CX, 1350, t, p1s, 0.35, "slide")


def s_hormiga(c, t, dur):
    text(c, "GASTOS", POP, 110, AMBER, CX, 430, t, 0.0, 0.35, "pop")
    text(c, "HORMIGA", POP, 110, AMBER, CX, 545, t, 0.15, 0.35, "pop")
    text(c, "No se notan…", POP, 70, WHITE, CX, 760, t, dur * 0.4, 0.35, "slide")
    text(c, "pero suman.", POP, 84, GREEN, CX, 860, t, dur * 0.68, 0.35, "pop")
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i in range(6):
        x = (-120 + i * 200 + t * 170) % 1320 - 120
        y = 1120 + math.sin(t * 9 + i) * 3
        ant(d, x, y, 1.7)
        lab = text_layer("−2 €", INTS, 44, AMBER)
        im.alpha_composite(lab, (int(x - lab.width / 2), int(y - 100)))
    c.alpha_composite(im)


def s_cta(c, t, r, b, dur):
    p = parts_of(4)
    text(c, "¿Cuál es tu café?", POP, 92, WHITE, CX, 520, t, 0.0, 0.35, "pop")
    s = ease_back(prog(t, 0.25, 0.4)) if t > 0.25 else 0
    if s > 0.02:
        ss = 2
        bw, bh = 300, 210
        bub = Image.new("RGBA", (bw * ss, bh * ss), (0, 0, 0, 0))
        d = ImageDraw.Draw(bub)
        d.rounded_rectangle([0, 0, bw * ss, 160 * ss], radius=50 * ss, fill=GREEN)
        d.polygon([(70 * ss, 150 * ss), (140 * ss, 150 * ss), (60 * ss, 210 * ss)], fill=GREEN)
        for j in range(3):
            a = 0.4 + 0.6 * (0.5 + 0.5 * math.sin(t * 7 - j * 0.9))
            col = (11, 18, 32, int(255 * a))
            cx_ = (90 + j * 60) * ss
            d.ellipse([cx_ - 18 * ss, 62 * ss, cx_ + 18 * ss, 98 * ss], fill=col)
        bub = bub.resize((int(bw * s), int(bh * s)), Image.LANCZOS)
        c.alpha_composite(bub, (int(CX - bub.width / 2), int(790 - bub.height / 2)))
    text(c, "Te leo en comentarios", INTS, 54, MUTED, CX, 1010, t, p[1]["start"] - b, 0.35, "slide")
    lp = ease_out(prog(t, dur - 0.8, 0.5))
    if lp > 0:
        cup(c, CX, 1230, 0.45 * lp, t)


def escenas(r):
    b = r.bounds
    return [
        lambda c, t: s_gancho(c, t, r),
        lambda c, t: s_anyo(c, t, r.scene_dur(1)),
        lambda c, t: s_diez(c, t, r, b[2]),
        lambda c, t: s_hormiga(c, t, r.scene_dur(3)),
        lambda c, t: s_cta(c, t, r, b[4], r.scene_dur(4)),
    ]


def efectos(r):
    b = r.bounds
    p0 = parts_of(0)[0]["dur"]
    p2 = parts_of(2)
    return [(0.0, "pop", 0.6), (p0 * 0.45 + 0.05, "pop"),
            (b[2] - 0.35, "ding", 0.8),
            (b[2] + p2[0]["dur"] * 0.85, "thud"),
            (b[3] + 0.0, "pop", 0.7), (b[3] + 0.15, "pop", 0.7),
            (b[4] + 0.3, "pop", 0.8)]


if __name__ == "__main__":
    r = Reel(HERE, voz_externa=TIM)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "frames"
    if cmd == "frames":
        b = r.bounds
        times = [b[1] - 0.2, b[2] - 0.2, b[3] - 0.2, b[4] - 0.2, r.total - 0.3]
        print(r.frames(times, escenas(r)))
    else:
        print(r.render(escenas(r), "video_sin_voz.mp4", music_seed=3, sfx=efectos(r), bpm=106))
