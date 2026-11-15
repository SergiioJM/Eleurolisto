"""Reel elaborado: "Estos dos cobran lo mismo" (Ana vs Leo, págate primero).
Voz: Javier de Madrid (Creative Claw, gemini-3.8-flash-tts). El vídeo se renderiza con música y efectos
ya ajustados a la voz (timings.json) y la voz se añade después en Creative Claw con add_audio_to_video (mix).

  python3 render.py frames | video
"""
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
from reelkit import *  # noqa: E402,F403
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

TIM = json.load(open(os.path.join(HERE, "timings.json")))
LX, RX, AY = 270, 810, 800  # posiciones de Leo, Ana y altura de los avatares


def split_bg():
    bg = np.array(background().convert("RGB")).astype(float)
    x = np.linspace(0, 1, W)[None, :, None]
    left = np.clip((0.5 - x) * 2, 0, 1) ** 1.5
    right = np.clip((x - 0.5) * 2, 0, 1) ** 1.5
    bg += left * np.array([28, -4, 0]) + right * np.array([-4, 18, 6])
    return Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).convert("RGBA")


def avatar(c, cx, cy, color, s=1.0, mood="neutral", alpha=1.0):
    if s <= 0.02 or alpha <= 0.01:
        return
    ss = 2
    w, h = 300, 360
    im = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = ss
    d.rounded_rectangle([40 * k, 190 * k, 260 * k, 360 * k], radius=70 * k, fill=color)
    d.ellipse([72 * k, 20 * k, 228 * k, 176 * k], fill=color)
    eye = (15, 23, 42)
    for ex in (118, 182):
        d.ellipse([(ex - 9) * k, 82 * k, (ex + 9) * k, 100 * k], fill=eye)
    if mood == "happy":
        d.arc([115 * k, 100 * k, 185 * k, 145 * k], 20, 160, fill=eye, width=7 * k)
    elif mood == "sad":
        d.arc([115 * k, 125 * k, 185 * k, 170 * k], 200, 340, fill=eye, width=7 * k)
    else:
        d.line([125 * k, 132 * k, 175 * k, 132 * k], fill=eye, width=7 * k)
    im = im.resize((max(1, int(w * s)), max(1, int(h * s))), Image.LANCZOS)
    if alpha < 1:
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    c.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def divider(c, alpha=1.0):
    rect(c, CX - 2, 620, 4, 640, DIM, radius=2, alpha=alpha)


def dim_half(c, side, a=0.62):
    x0 = 0 if side == "left" else CX
    ov = Image.new("RGBA", (CX, H), (8, 12, 22, int(255 * a)))
    c.alpha_composite(ov, (x0, 0))


def pop_scale(t, start, dur=0.4):
    p = prog(t, start, dur)
    return max(0.0, ease_back(p)) if p > 0 else 0.0


def pareja(c, t, leo_mood="neutral", ana_mood="neutral", entrance=False):
    sL = pop_scale(t, 0.3) if entrance else 1
    sA = pop_scale(t, 0.45) if entrance else 1
    avatar(c, LX, AY, RED, sL, leo_mood)
    avatar(c, RX, AY, GREEN, sA, ana_mood)
    text(c, "LEO", POP, 62, RED, LX, 1035, t if entrance else 9, 0.5, 0.3, "slide")
    text(c, "ANA", POP, 62, GREEN, RX, 1035, t if entrance else 9, 0.65, 0.3, "slide")


# ---------------- escenas ----------------
def s_gancho(c, t):
    divider(c, ease_out(prog(t, 0.2, 0.4)))
    text(c, "ESTOS DOS", POP, 104, WHITE, CX, 330, t, 0.0, 0.35, "pop")
    text(c, "COBRAN LO MISMO", POP, 80, GREEN, CX, 440, t, 0.25, 0.35, "pop")
    pareja(c, t, entrance=True)
    st = TIM["segments"][0]["dur"] * 0.62
    text(c, "1.500 €", POP, 74, WHITE, LX, 1140, t, st, 0.35, "pop")
    text(c, "1.500 €", POP, 74, WHITE, RX, 1140, t, st + 0.1, 0.35, "pop")


def s_futuro(c, t, dur):
    divider(c)
    text(c, "Dentro de un año…", INTS, 62, MUTED, CX, 400, t, 0.0, 0.3, "slide")
    ana_t, leo_t = dur * 0.5, dur * 0.88
    pareja(c, t, "sad" if t > leo_t else "neutral", "happy" if t > ana_t else "neutral")
    if t < ana_t:
        text(c, "?", POP, 110, FAINT, RX, 1140, t, 0.2, 0.3, "pop")
    text(c, "3.600 €", POP, 80, GREEN, RX, 1140, t, ana_t, 0.4, "pop")
    if t < leo_t:
        text(c, "?", POP, 110, FAINT, LX, 1140, t, 0.2, 0.3, "pop")
    text(c, "0 €", POP, 96, RED, LX, 1140, t, leo_t, 0.4, "pop")


CHIPS = ["alquiler", "cenas", "ropa", "apps", "caprichos"]


def s_leo(c, t, parts, t0):
    divider(c)
    pareja(c, t, "sad", "neutral")
    dim_half(c, "right")
    p0 = parts[0]["dur"]
    drain = ease_out(prog(t, 0.3, p0))
    paste(c, text_layer(eur(1500 * (1 - drain)), POP, 96, mix(WHITE, RED, drain)), LX, 400)
    text(c, "Leo", INTS, 50, MUTED, LX, 300, 9)
    targets = [(140, 560), (400, 590), (130, 1180), (410, 1170), (270, 1290)]
    for i, ch in enumerate(CHIPS):
        st = 0.35 + i * 0.28
        p = prog(t, st, 1.1)
        if 0 < p < 1:
            tx, ty = targets[i]
            e = ease_out(p)
            x = LX + (tx - LX) * e
            y = AY - 150 + (ty - AY + 150) * e
            paste(c, text_layer("−" + ch, INTS, 44, AMBER), x, y, alpha=1 - p ** 3)
    sp = parts[1]["start"] - t0
    banner(c, "SPOILER: NUNCA SOBRA", CX, 1300, t, sp, color=RED, txt=WHITE, size=52, h=104)


def s_ana(c, t, parts, t0):
    divider(c)
    pareja(c, t, "sad", "happy")
    dim_half(c, "left")
    text(c, "Ana lo hace", INTS, 50, MUTED, RX, 280, 9)
    text(c, "AL REVÉS", POP, 74, GREEN, RX, 360, t, 0.15, 0.4, "pop")
    jump = parts[1]["start"] - t0 + parts[1]["dur"] * 0.45
    p = ease_in_out(prog(t, jump, 0.6))
    amount = 1500 if t < jump else 1200
    paste(c, text_layer(eur(amount), POP, 88, WHITE), RX, 480)
    if t >= jump:
        text(c, "para vivir", INTM, 44, MUTED, RX, 560, t, jump + 0.3, 0.3)
    # hucha / cuenta de ahorro
    box_a = ease_out(prog(t, jump - 0.4, 0.4))
    if box_a > 0:
        rect(c, RX - 170, 1170, 340, 170, (15, 46, 28), radius=34, alpha=box_a)
        text(c, "AHORRO", INTS, 40, GREEN, RX, 1215, t, jump - 0.4, 0.3)
        if t > jump + 0.6:
            text(c, "300 €", POP, 70, GREEN, RX, 1285, t, jump + 0.6, 0.35, "pop")
    if 0 < p < 1:
        x = RX + 150 * math.sin(p * math.pi)
        y = 480 + (1255 - 480) * p
        paste(c, text_layer("300 €", POP, 62, GREEN), x, y, scale=1 - 0.2 * p)


def s_grafica(c, t, parts, t0):
    text(c, "En 12 meses", INTS, 60, MUTED, CX, 320, t, 0.0, 0.3, "slide")
    done = bars(c, [300 * (i + 1) for i in range(12)], 130, 1180, 820, 500, GREEN, t, 0.25, 0.09,
                labels=list("EFMAMJJASOND"), dur=0.3)
    paste(c, text_layer("Ana", INTS, 48, GREEN), 300, 470, alpha=ease_out(prog(t, 0.2, 0.3)))
    paste(c, text_layer(eur(300 * done), POP, 120, GREEN), 600, 470, alpha=ease_out(prog(t, 0.2, 0.3)))
    lt = parts[1]["start"] - t0
    pl = ease_out(prog(t, lt, 0.6))
    if pl > 0:
        rect(c, 130, 1172, 820 * pl, 12, RED, radius=6)
        text(c, "Leo: 0 €", POP, 60, RED, CX, 1300, t, lt + 0.2, 0.35, "pop")


def s_mensaje(c, t, parts, t0):
    text(c, "No es cuánto ganas.", POP, 74, WHITE, CX, 560, t, 0.1, 0.35, "slide")
    text(c, "Es el orden.", POP, 96, GREEN, CX, 690, t, parts[0]["dur"] * 0.6, 0.35, "pop")
    st = parts[1]["start"] - t0 - 0.05
    p = prog(t, st, 0.28)
    if p > 0:
        s = 1.9 - 0.9 * ease_out(p)
        tl = text_layer("PÁGATE PRIMERO", POP, 88, GREEN)
        bw, bh = tl.width + 110, 220
        lay = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        d.rounded_rectangle([6, 6, bw - 6, bh - 6], radius=36, outline=GREEN + (255,), width=12)
        lay.alpha_composite(tl, ((bw - tl.width) // 2, (bh - tl.height) // 2 + 4))
        lay = lay.rotate(6, resample=Image.BICUBIC, expand=True)
        paste(c, lay, CX, 1000, scale=s, alpha=clamp(p * 3))


def s_cta(c, t, dur):
    text(c, "Mándaselo a quien", POP, 70, WHITE, CX, 480, t, 0.05, 0.3, "slide")
    text(c, "siempre llega justo", POP, 70, WHITE, CX, 570, t, 0.25, 0.3, "slide")
    text(c, "a fin de mes", POP, 84, GREEN, CX, 670, t, 0.45, 0.3, "pop")
    p = prog(t, 0.5, 0.5)
    if p > 0:
        fy = 860 + math.sin(t * 4) * 10
        sc = max(0.01, ease_back(p))
        ss = 2
        ic = Image.new("RGBA", (220 * ss, 180 * ss), (0, 0, 0, 0))
        d = ImageDraw.Draw(ic)
        d.polygon([(0, 80 * ss), (220 * ss, 0), (150 * ss, 180 * ss), (95 * ss, 110 * ss)], fill=GREEN)
        d.polygon([(95 * ss, 110 * ss), (220 * ss, 0), (110 * ss, 170 * ss)], fill=(22, 163, 74))
        ic = ic.resize((int(220 * sc), int(180 * sc)), Image.LANCZOS)
        c.alpha_composite(ic, (int(CX - ic.width / 2), int(fy - ic.height / 2)))
    lp = ease_out(prog(t, dur - 0.9, 0.5))
    if lp > 0:
        avatar(c, LX, 1130, RED, 0.55 * lp)
        avatar(c, RX, 1130, GREEN, 0.55 * lp)
    text(c, "Ejemplo ilustrativo. Contenido educativo.", INTM, 30, FAINT, CX, 1400, t, 0.8, 0.4)


def escenas(r):
    S = TIM["segments"]
    b = r.bounds
    return [
        s_gancho,
        lambda c, t: s_futuro(c, t, r.scene_dur(1)),
        lambda c, t: s_leo(c, t, S[2]["parts"], b[2]),
        lambda c, t: s_ana(c, t, S[3]["parts"], b[3]),
        lambda c, t: s_grafica(c, t, S[4]["parts"], b[4]),
        lambda c, t: s_mensaje(c, t, S[5]["parts"], b[5]),
        lambda c, t: s_cta(c, t, r.scene_dur(6)),
    ]


def efectos(r):
    S, b = TIM["segments"], r.bounds
    d1 = r.scene_dur(1)
    p3 = S[3]["parts"][1]
    jump = p3["start"] + p3["dur"] * 0.45
    return [(0.3, "pop", 0.7), (0.45, "pop", 0.7), (S[0]["dur"] * 0.62, "pop", 0.6),
            (b[1] + d1 * 0.5, "ding"), (b[1] + d1 * 0.88, "thud", 0.8),
            (S[2]["parts"][1]["start"], "thud", 0.7),
            (jump + 0.6, "ding", 0.8),
            (S[4]["parts"][1]["start"], "thud", 0.6),
            (S[5]["parts"][1]["start"] - 0.05 + 0.2, "thud"),
            (b[6] + 0.5, "pop", 0.7)]


if __name__ == "__main__":
    r = Reel(HERE, bg=split_bg(), voz_externa=TIM)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "frames"
    if cmd == "frames":
        b = r.bounds
        times = [2.9, b[1] + r.scene_dur(1) * 0.95, b[2] + 1.0, b[2] + r.scene_dur(2) - 0.2,
                 b[3] + r.scene_dur(3) - 0.2, b[4] + r.scene_dur(4) - 0.1, b[5] + r.scene_dur(5) - 0.1,
                 b[6] + r.scene_dur(6) - 0.2]
        print(r.frames(times, escenas(r)))
    else:
        print(r.render(escenas(r), "video_sin_voz.mp4", music_seed=2, sfx=efectos(r), bpm=104))
