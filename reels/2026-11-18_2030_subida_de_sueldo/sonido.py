"""Música baja + efectos sincronizados con escena.html (subida de sueldo, pantalla partida)."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
smooth = lambda k: k * k * (3 - 2 * k)
clamp = lambda x: min(1, max(0, x))
t150, tDel, tMov, tSus = pal(1, "150"), pal(2, "delivery"), pal(2, "móvil"), pal(2, "suscrip")
tAparta, tDisf = pal(3, "aparta"), pal(4, "disfruta")
tTL0, tTL1 = st(5) - 0.1, pal(7, "4.500") + 0.6
tRegla, tCTA = st(8) - 0.1, st(9) - 0.05
meses = lambda t: 0 if t < tTL0 else 60 * smooth(clamp((t - tTL0) / (tTL1 - tTL0)))


def t_mes(m):
    a, b = tTL0, tTL1
    for _ in range(40):
        c = (a + b) / 2
        a, b = (c, b) if meses(c) < m else (a, c)
    return (a + b) / 2


ev = [(0.03, "whoosh", 0.8), (0.12, "pop", 0.8), (0.16, "pop", 0.7), (t150, "ding", 0.6)]
ev += [(tDel - 0.05, "pop", 0.7), (tMov - 0.05, "pop", 0.7), (tSus - 0.05, "pop", 0.7)]
ev += [(tAparta + 0.1, "whoosh", 0.6), (tAparta + 1.0, "pop", 0.8), (tAparta + 1.02, "ding", 0.5)]
ev += [(tDisf - 0.05, "pop", 0.6), (tDisf + 0.15, "pop", 0.6)]
ev += [(tTL0, "whoosh", 0.7)] + [(t_mes(m), "tick", 0.55) for m in range(3, 60, 4)]
ev += [(t_mes(6 + 6 * i), "pop", 0.35) for i in range(9)]
ev += [(st(6), "thud", 0.7), (pal(7, "4.500"), "ding", 1.0)]
ev += [(tRegla, "whoosh", 0.6), (tRegla + 0.12, "pop", 0.8), (tCTA, "pop", 0.8), (tCTA + 0.18, "pop", 0.8)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=100, style="chill", seed=7)
print("ok", len(ev), "efectos")
