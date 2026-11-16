"""Música baja + efectos sincronizados con escena.html (mismos tiempos, sacados de timings.json)."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
en = lambda i: S[i]["start"] + S[i]["dur"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
smooth = lambda k: k * k * (3 - 2 * k)
clamp = lambda x: min(1, max(0, x))

tCero = pal(0, "cero")
tRw0 = st(1) - 0.15
tJ = pal(1, "50/30")
tJar = [tJ, tJ + 0.6, tJ + 1.05]
tTit = pal(1, "regla") - 0.05
tF = [pal(2, "700") - 0.1, pal(3, "420") - 0.1, pal(4, "280") - 0.1]
NB, DT, VUELO = [35, 21, 14], 0.056, 0.45
icons = [pal(2, "alquiler"), pal(2, "comida"), pal(2, "facturas"), pal(3, "planes"), pal(3, "caprichos")]
tTapa, tCandado = pal(4, "nada") - 0.1, pal(4, "cobrar") - 0.15
tAnyo0, tAnyoFin = st(5) + 0.15, en(5) - 0.35
tMes = lambda i: tAnyo0 + i * ((tAnyoFin - tAnyo0 - 0.1) / 11)
tHaz, tNo, tCTA = pal(6, "60/20"), pal(6, "no"), st(7)

ev = [(0.02, "whoosh", 0.8)]
# días del gancho (1 -> 20)
prev = 1
for f in range(0, int(3.1 * 100)):
    tu = f / 100
    dia = min(20, 1 + int(19 * smooth(clamp(tu / (tCero + 0.05)))))
    if dia != prev:
        ev.append((tu, "tick", 0.55))
        prev = dia
ev += [(0.6, "whoosh", 0.35), (1.4, "whoosh", 0.35), (2.1, "whoosh", 0.35), (tCero, "thud", 1.25)]
ev += [(tRw0, "whoosh", 1.0), (tRw0 + 0.35, "whoosh", 0.7), (tTit, "pop", 0.8)]
ev += [(t, "pop", 0.85) for t in tJar]
for j in range(3):
    for s in range(0, NB[j], 3):
        ev.append((tF[j] + s * DT + VUELO, "pop", 0.32))
    ev.append((tF[j] + (NB[j] - 1) * DT + VUELO + 0.05, "ding", 0.6))
ev += [(t, "pop", 0.55) for t in icons]
ev += [(tTapa, "whoosh", 0.6), (tTapa + 0.32, "thud", 1.1), (tCandado, "ding", 0.7)]
ev += [(st(5) - 0.1, "whoosh", 0.6)] + [(tMes(i) + 0.05, "tick", 0.8) for i in range(12)] + [(tAnyoFin + 0.1, "ding", 0.95)]
ev += [(st(6) - 0.1, "whoosh", 0.6), (tHaz, "pop", 0.7), (tHaz + 0.45, "pop", 0.6)]
ev += [(tHaz + 0.05 + k * 0.13, "whoosh", 0.22) for k in range(7)]
ev += [(tNo, "thud", 1.2), (tCTA, "pop", 0.8), (tCTA + 0.18, "pop", 0.8)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=104, style="upbeat", seed=5)
print("ok", len(ev), "efectos")
