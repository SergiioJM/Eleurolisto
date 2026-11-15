"""Reel elaborado: regla 50/30/20 (lun 16-nov-2026, 20:30). Plantilla de referencia para reelkit.

  python3 render.py voz        -> genera voice.wav + timings.json (voz v1)
  python3 render.py frames     -> contact.png con fotogramas clave para revisar
  python3 render.py video      -> render final (no sobrescribe video.mp4 aprobado: escribe video_render.mp4)
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "toolkit"))
from reelkit import *  # noqa: E402,F403

VOZ = "v1"
GUION = [
    "Cobras mil quinientos euros... y a final de mes no te queda nada.",
    "Prueba la regla cincuenta, treinta, veinte.",
    "El cincuenta por ciento, setecientos cincuenta euros, para lo necesario: alquiler, comida y facturas.",
    "El treinta por ciento, cuatrocientos cincuenta euros, para tus caprichos.",
    "Y el veinte por ciento, trescientos euros, para ahorrar. Y ese dinero se aparta lo primero, nada más cobrar.",
    "Así, en un año, tienes tres mil seiscientos euros guardados.",
    "Guárdate este vídeo y empieza este mes.",
]


def escena_gancho(c, t):
    text(c, "Cobras", INTS, 60, MUTED, CX, 610, t, 0.0, 0.3, "slide")
    drain = ease_out(prog(t, 1.75, 1.35))
    p = prog(t, 0.05, 0.45)
    paste(c, text_layer(eur(1500 * (1 - drain)), POP, 210, mix(WHITE, RED, drain)), CX, 790,
          scale=max(0.01, ease_back(p)), alpha=clamp(p * 2))
    if t > 0.3:
        rounded_bar(c, 160, 940, 760, 38, 1 - drain, mix(GREEN, RED, drain))
    text(c, "a final de mes...", INTM, 52, MUTED, CX, 1060, t, 1.7, 0.35, "slide")
    text(c, "¿Te suena?", POP, 110, AMBER, CX, 1210, t, 3.05, 0.4, "pop")


def escena_regla(c, t):
    text(c, "Prueba la regla", INTS, 66, WHITE, CX, 640, t, 0.0, 0.3, "slide")
    items = [("50", BLUE, 0.55), ("/", MUTED, 0.7), ("30", AMBER, 0.85), ("/", MUTED, 1.0), ("20", GREEN, 1.15)]
    sz = lambda s: 190 if s != "/" else 140  # noqa: E731
    widths = [text_layer(s, POP, sz(s), col).width for s, col, _ in items]
    x = CX - (sum(widths) + 22 * 4) / 2
    for (s, col, st), w in zip(items, widths):
        text(c, s, POP, sz(s), col, x + w / 2, 880, t, st, 0.4, "pop")
        x += w + 22
    text(c, "para repartir tu sueldo", INTM, 52, MUTED, CX, 1080, t, 1.35, 0.35, "slide")


PARTS = [
    (0.0, 0.5, BLUE, "50 %", 750, "Necesidades", ["alquiler", "comida", "facturas"]),
    (0.5, 0.8, AMBER, "30 %", 450, "Caprichos", ["cenas", "ropa", "planes"]),
    (0.8, 1.0, GREEN, "20 %", 300, "Ahorro", []),
]


def escena_donut(k, r):
    def f(c, t):
        text(c, "Sueldo: 1.500 €", INTS, 50, MUTED, CX, 300, 1.0 if k else t, 0.0, 0.3)
        grow = ease_out(prog(t, 0.25, 1.0))
        segs = [(a, b, col) for j, (a, b, col, *_) in enumerate(PARTS) if j < k]
        a, b, col, pct, amount, label, chips = PARTS[k]
        segs.append((a, a + (b - a) * grow, col))
        donut(c, CX, 800, segs, alpha=1.0 if k else ease_out(prog(t, 0, 0.3)))
        text(c, pct, POP, 120, col, CX, 750, t, 0.2, 0.35, "pop")
        paste(c, text_layer(eur(amount * grow), POP, 84, WHITE), CX, 870, alpha=ease_out(prog(t, 0.25, 0.3)))
        text(c, label, POP, 86, col, CX, 1210, t, 0.45, 0.4, "slide")
        if chips:
            st = r.scene_dur(2 + k) * 0.58
            widths = [text_width(ch, INTM, 50) for ch in chips]
            x = CX - (sum(widths) + 60 * (len(chips) - 1)) / 2
            for i, ch in enumerate(chips):
                text(c, ch, INTM, 50, MUTED, x + widths[i] / 2, 1310, t, st + i * 0.35, 0.3, "slide", 20)
                if i < len(chips) - 1:
                    text(c, "·", INTM, 50, MUTED, x + widths[i] + 30, 1310, t, st + i * 0.35, 0.3)
                x += widths[i] + 60
        if k == 2:
            banner(c, "PÁGATE PRIMERO", CX, 1340, t, 2.95)
    return f


def escena_anyo(c, t):
    text(c, "En 12 meses", INTS, 62, MUTED, CX, 470, t, 0.0, 0.3, "slide")
    done = bars(c, [300 * (i + 1) for i in range(12)], 132, 1250, 816, 470, GREEN, t, 0.35, 0.12,
                labels=list("EFMAMJJASOND"))
    paste(c, text_layer(eur(300 * done), POP, 170, mix(WHITE, GREEN, clamp(done / 12) ** 4)), CX, 640,
          alpha=ease_out(prog(t, 0.1, 0.3)))


def escenas(r):
    return [escena_gancho, escena_regla, escena_donut(0, r), escena_donut(1, r), escena_donut(2, r),
            escena_anyo, lambda c, t: cta(c, t)]


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "frames"
    if cmd == "voz":
        import voces
        voces.make(GUION, HERE, VOZ)
    else:
        r = Reel(HERE)
        if cmd == "frames":
            print(r.frames([3.6, 5.5, 11.0, 20.5, 23.5, 26.5], escenas(r)))
        else:
            print(r.render(escenas(r), "video_render.mp4", music_seed=0))
