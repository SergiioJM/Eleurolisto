"""Música (upbeat, 118 bpm, baja) + efectos para escena_kinetic.html (look: tipografía cinética).
Cada palabra que golpea lleva un 'thud' corto; transiciones con whoosh; cifras con pop/ding; meses con tick."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
sm = lambda k: k * k * (3 - 2 * k)
clamp = lambda x: min(1, max(0, x))

T = dict(sub=pal(0, "subida"), sueldo=pal(0, "sueldo"), dos=pal(1, "dos"), n150=pal(1, "150"), mes1=pal(1, "mes"),
         ella=pal(2, "ella"), gasta=pal(2, "gasta"), dl=pal(2, "delivery"), mov=pal(2, "móvil"), otra=pal(2, "otra"),
         sus=pal(2, "suscrip"), el=st(3), aparta=pal(3, "aparta"), mitad=pal(3, "mitad"), n75=pal(3, "75"),
         mismo=pal(3, "mismo"), dia=pal(3, "día"), cobra=pal(3, "cobra"), otraM=pal(4, "otra"), disf=pal(4, "disfruta"),
         sin=pal(4, "sin"), culpa=pal(4, "culpa"), pasan=st(5), n5=pal(5, "5"), anos=pal(5, "años"), sigue=pal(6, "sigue"),
         justa=pal(6, "justa"), fin=pal(6, "fin"), el2=st(7), tiene=pal(7, "tiene"), n4500=pal(7, "4.500"),
         cuando=st(8), suban=pal(8, "suban"), ahorra=pal(8, "ahorra"), menos=pal(8, "menos"), mitad2=pal(8, "mitad"),
         comp=st(9), quien=pal(9, "quien"), cobrar=pal(9, "cobrar"), mas=pal(9, "más"))
K = dict(s1=T["dos"] - 0.42, s2=T["ella"] - 0.12, s3=T["el"] - 0.2, s4=T["otraM"] - 0.2, s5=T["pasan"] - 0.15,
         s6=st(6) - 0.1, s7=T["el2"] - 0.12, s8=T["cuando"] - 0.12, s9=T["comp"] - 0.15, loop=TIM["total"] - 0.3)
months = lambda t: 60 * sm(clamp((t - (T["pasan"] - 0.05)) / (T["n4500"] - T["pasan"] + 0.05)))


def t_mes(m):
    a, b = T["pasan"] - 0.05, T["n4500"]
    for _ in range(40):
        c = (a + b) / 2
        a, b = (c, b) if months(c) < m else (a, c)
    return (a + b) / 2


ev = []
golpes = ["sub", "sueldo", "dos", "ella", "gasta", "aparta", "mitad", "otraM", "disf", "sin", "anos", "sigue", "justa",
          "tiene", "cuando", "suban", "ahorra", "menos", "mitad2", "comp", "cobrar"]
ev += [(T[g], "thud", 0.5) for g in golpes]
ev += [(0.08, "pop", 0.9), (0.1, "ding", 0.4)]                              # sello +150 € del fotograma 0
ev += [(K[k] - 0.2, "whoosh", 0.7) for k in ("s1", "s3", "s4", "s9")]          # barridos de color
ev += [(K["s2"] - 0.18, "whoosh", 0.8), (K["s7"] - 0.18, "whoosh", 0.8), (K["s8"] - 0.16, "whoosh", 0.7)]  # crash zooms
ev += [(T["n150"] + i * 0.11 + 0.4, "tick", 0.6) for i in range(3)] + [(T["n150"] + 0.75, "ding", 0.5)]
ev += [(T[k] - 0.05, "pop", 0.9) for k in ("dl", "mov", "otra")] + [(T["sus"] + 0.3, "thud", 0.9)]
ev += [(T["mitad"] + 0.12, "whoosh", 0.5), (T["n75"] + 0.2, "pop", 0.8), (T["n75"] + 0.55, "ding", 0.5)]
ev += [(T["dia"] + 0.1, "whoosh", 0.4), (T["cobra"] + 0.05, "pop", 0.8), (T["culpa"], "pop", 0.8), (T["culpa"] + 0.05, "ding", 0.6)]
ev += [(K["s5"], "whoosh", 0.9)] + [(t_mes(m), "tick", 0.5) for m in range(2, 60, 3)]
ev += [(T["n4500"] + 0.11 * i + 0.4, "tick", 0.7) for i in range(4)] + [(T["n4500"] + 0.75, "ding", 1.0)]
ev += [(T["mitad2"] + 0.1, "ding", 0.7), (T["mas"], "pop", 0.8), (K["loop"], "whoosh", 0.6), (K["loop"] + 0.08, "pop", 0.8)]
ev.sort()
mezclar("video_kinetic_render.mp4", "video_kinetic_sin_voz.mp4", TIM, ev, bpm=118, style="upbeat", seed=11, music_gain=0.26, duck_gain=0.08, sfx_gain=0.3)
print("ok", len(ev), "efectos")
