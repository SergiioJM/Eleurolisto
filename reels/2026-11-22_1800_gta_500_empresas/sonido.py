"""Música synth ochentera de noche (upbeat, 100 bpm) + efectos para el especial GTA parte 3 (R8b neón tropical de noche).
La voz de ElevenLabs (Juanjo) se añade después (mezcla local con ffmpeg, voz desplazada 0,2 s): aquí no se normaliza."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if f in w["w"].lower()]
    return ws[n] if len(ws) > n else (ws[0] if ws else S[i]["words"][0]["start"])
T = dict(parte=pal(0, "3"), empresa0=pal(0, "empresa"), q0=pal(0, "500"),
         mismos=st(1), sesenta=pal(1, "60"), anio=pal(1, "2013"), indice=pal(1, "índice"), q1=pal(1, "500"), unidos=pal(1, "unidos"),
         hoy=st(2), tres=pal(2, "300"), cinco=pal(2, "5"), menos=st(3), vale=pal(3, "vale"),
         pero=st(4), quiebra=pal(4, "quiebra"), cero=pal(4, "0."), y=st(5), peor=pal(5, "peor"), anio25=pal(5, "2025"),
         cta=st(6), una=pal(6, "una"), q6=pal(6, "500"), fin=st(6) + S[6]["dur"])
ev = [(0.0, "lib:transition/air-woosh-quick", 0.8), (0.05, "lib:impact/hit-fast-exciting", 0.6),
      (T["parte"] - 0.1, "lib:ui/ui-popup-dry", 0.6), (T["empresa0"] - 0.05, "lib:ui/ui-message-pop", 0.6),
      (T["q0"] - 0.05, "lib:impact/impact-zoom-quick", 0.8)]
# 2013 → índice: moneda, flecha y rejilla que se enciende
ev += [(T["mismos"] - 0.12, "lib:transition/whoosh-fast", 0.6), (T["sesenta"] - 0.1, "lib:ui/ui-option-select", 0.6),
       (T["anio"], "lib:transition/swoosh-quick", 0.5), (T["indice"] - 0.05, "lib:light/stardust-swish", 0.6),
       (T["q1"] - 0.1, "lib:ui/ui-confirm-tone", 0.6)]
# contador 60 → 300 €
ev += [(T["hoy"] - 0.12, "lib:transition/swoosh-quick", 0.6)]
dur = T["tres"] - T["hoy"] - 0.1
ev += [(T["hoy"] + 0.1 + dur * i / 6, "lib:counter/clock-tick-single", 0.45) for i in range(6)]
ev += [(T["tres"] - 0.04, "lib:impact/impact-zoom-quick", 0.9), (T["tres"] + 0.02, "lib:ui/ui-success-soft", 0.6),
       (T["cinco"] - 0.08, "lib:impact/bass-hit-short", 0.8)]
# barras y "vale"
ev += [(T["menos"] - 0.12, "lib:transition/whoosh-fast", 0.6), (T["menos"] + 0.2, "lib:ui/ui-select-modern", 0.5),
       (T["vale"] - 0.05, "lib:ui/ui-popup-dry", 0.6)]
# quiebra: una luz cae; "no te quedas a cero"
ev += [(T["pero"] - 0.12, "lib:transition/swoosh-quick", 0.6), (T["quiebra"] - 0.05, "lib:impact/hit-blow", 0.7),
       (T["quiebra"] + 0.4, "lib:data/glitch-virtual-quick", 0.4), (T["cero"] - 0.08, "lib:ui/ui-confirm-tone", 0.7)]
# peor semana
ev += [(T["y"] - 0.12, "lib:transition/whoosh-fast", 0.6), (T["peor"] - 0.1, "lib:impact/bass-hit-short", 0.8),
       (T["anio25"] + 0.2, "lib:light/sparkle-touch", 0.6)]
# CTA y SEGUIR
ev += [(T["cta"] - 0.1, "lib:ui/ui-message-pop", 0.8), (T["una"] - 0.15, "lib:ui/ui-option-select", 0.7),
       (T["q6"] - 0.15, "lib:ui/ui-option-select", 0.7), (T["q6"] + 0.5, "lib:ui/ui-message-pop", 0.6),
       (T["fin"] - 0.1, "lib:ui/chime-crystal", 0.5)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=100, style="upbeat", seed=11, sfx_gain=0.3)
print("ok", len(ev), "efectos")
