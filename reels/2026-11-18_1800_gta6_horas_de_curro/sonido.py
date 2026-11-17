"""Música synth ochentera baja (upbeat, 104 bpm) + efectos para el especial GTA 6 (R8 neón tropical).
La voz de Javier se añade después con add_audio_to_video (mix, start_offset 0.2 s): aquí no se normaliza."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
T = dict(precio=st(1), precioW=pal(1, "79"), sueldo=st(2), sueldoW=pal(2, "9,36"), horasW=pal(3, "8"), dia=pal(3, "día"),
         ulti=st(4), ultiW=pal(4, "11"), truco=st(5), vida=pal(5, "vida"), vale=st(6), culpa=pal(6, "sin"), cta=st(7))
ev = [(0.0, "lib:transition/air-woosh-quick", 0.8), (0.05, "lib:impact/hit-fast-exciting", 0.6), (0.3, "lib:ui/ui-message-pop", 0.6),
      (1.6, "lib:ui/ui-message-pop", 0.6)]
ev += [(T["precio"] - 0.1, "lib:transition/whoosh-fast", 0.6), (T["precioW"] - 0.03, "lib:impact/bass-hit-short", 0.9)]
ev += [(T["sueldo"] - 0.1, "lib:transition/whoosh-fast", 0.6), (T["sueldoW"] - 0.03, "lib:ui/ui-confirm-tone", 0.6)]
dur = T["horasW"] + 0.35 - T["sueldoW"]
ev += [(T["sueldoW"] + dur * (i / 8.546), "lib:counter/clock-tick-single", 0.5) for i in range(1, 9)]
ev += [(T["horasW"] - 0.05, "lib:impact/impact-zoom-quick", 0.9), (T["dia"] - 0.08, "lib:impact/bass-hit-short", 0.8)]
ev += [(T["ulti"] - 0.1, "lib:transition/swoosh-quick", 0.6), (T["ulti"] + 0.1, "lib:ui/ui-option-select", 0.6), (T["ultiW"] - 0.2, "lib:ui/ui-option-select", 0.6)]
ev += [(T["truco"] - 0.1, "lib:light/sparkle-touch", 0.6), (T["vida"] - 0.3, "lib:ui/ui-success-soft", 0.6)]
ev += [(T["vale"] - 0.1, "lib:transition/swoosh-quick", 0.6), (T["culpa"] - 0.1, "lib:ui/ui-confirm-tone", 0.7)]
ev += [(T["cta"], "lib:ui/ui-message-pop", 0.8), (T["cta"] + 0.25, "lib:ui/ui-message-pop", 0.8), (T["cta"] + 0.7, "lib:ui/chime-crystal", 0.5)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=104, style="upbeat", seed=5, sfx_gain=0.3)
print("ok", len(ev), "efectos")
