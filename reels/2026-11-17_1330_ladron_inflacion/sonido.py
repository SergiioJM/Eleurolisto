"""Música baja + efectos sincronizados con la escena (mismos tiempos que escena.html)."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
en = lambda i: S[i]["start"] + S[i]["dur"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
T1, T2, T3, T5 = st(1), st(2), st(3), st(5)
TLfin = en(4) + 0.15


def anyos(t):
    k = min(1, max(0, (t - (T3 + 0.15)) / (TLfin - (T3 + 0.15))))
    return 10 * (0.45 * k + 0.55 * k * k * (3 - 2 * k))


def t_de_anyo(y):
    a, b = T3, TLfin
    for _ in range(40):
        m = (a + b) / 2
        a, b = (m, b) if anyos(m) < y else (a, m)
    return (a + b) / 2


tSello, tTuyo, tCompras = pal(5, "inflaci") - 0.06, pal(6, "tuyo") - 0.1, pal(2, "compras") - 0.1
ev = [(0.33, "whoosh", 0.7), (T1 - 0.35, "whoosh", 1.0), (T1 + 0.45, "whoosh", 0.45), (T1 + 0.95, "ding", 0.6)]
ev += [(tCompras + i * 0.15, "pop", 0.5) for i in range(8)]
ev += [(t_de_anyo(n), "tick", 0.9) for n in range(1, 11)]
ev += [(t_de_anyo(y) + 0.05, "whoosh", 0.75) for y in (2.5, 5.0, 7.5, 9.55)]
ev += [(T3 - 0.25, "whoosh", 0.6), (tSello, "thud", 1.3), (tSello + 0.02, "whoosh", 0.4), (tTuyo, "pop", 0.8), (tTuyo + 0.18, "pop", 0.8)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=92, style="chill", seed=2)
print("ok")
