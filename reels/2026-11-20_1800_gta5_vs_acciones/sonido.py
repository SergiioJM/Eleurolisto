"""Música synth ochentera de noche (upbeat, 100 bpm) + efectos para el especial GTA parte 2 (R8b neón tropical de noche).
La voz de ElevenLabs (Juanjo) se añade después con add_audio_to_video (mix, start_offset 0.2 s): aquí no se normaliza."""
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
T = dict(gta=pal(0, "gta"), anio=pal(0, "2013"), sesenta=pal(0, "60"), acciones=pal(0, "acciones"), take=pal(0, "take"),
         hoy=st(1), ocho=pal(1, "800"), catorce=pal(1, "14"), pero=st(2), quebro=pal(2, "quebr"), saints=pal(2, "saints"),
         toro=st(3), genios=pal(3, "genios"), poreso=st(4), sola=pal(4, "sola"), empresa=pal(4, "empresa"),
         cta=st(5), juego=pal(5, "juego"), accs=pal(5, "acciones"))
ev = [(0.0, "lib:transition/air-woosh-quick", 0.8), (0.05, "lib:impact/hit-fast-exciting", 0.6), (0.3, "lib:ui/ui-message-pop", 0.6),
      (T["gta"] - 0.15, "lib:ui/ui-message-pop", 0.6), (T["anio"] - 0.1, "lib:ui/ui-popup-dry", 0.6)]
ev += [(T["sesenta"] - 0.15, "lib:transition/whoosh-fast", 0.6), (T["sesenta"], "lib:ui/ui-option-select", 0.6),
       (T["acciones"] - 0.05, "lib:ui/ui-select-modern", 0.6), (T["take"] - 0.03, "lib:ui/ui-confirm-tone", 0.6)]
# contador 60 → 800 €: ticks y golpe
ev += [(T["hoy"] - 0.12, "lib:transition/swoosh-quick", 0.6)]
dur = T["ocho"] - T["hoy"] - 0.1
ev += [(T["hoy"] + 0.1 + dur * i / 7, "lib:counter/clock-tick-single", 0.45) for i in range(7)]
ev += [(T["ocho"] - 0.04, "lib:impact/impact-zoom-quick", 0.9), (T["ocho"] + 0.02, "lib:ui/ui-success-soft", 0.6),
       (T["catorce"] - 0.08, "lib:impact/bass-hit-short", 0.8)]
# quiebra
ev += [(T["pero"] - 0.12, "lib:transition/whoosh-fast", 0.6), (T["pero"] + 0.4, "lib:data/glitch-virtual-quick", 0.5),
       (T["quebro"] - 0.06, "lib:impact/hit-blow", 0.8), (T["saints"] - 0.1, "lib:ui/ui-popup-dry", 0.5)]
# a toro pasado (retrovisor) → genios
ev += [(T["toro"] - 0.15, "lib:film/reel-rewind", 0.5), (T["genios"] - 0.2, "lib:light/sparkle-touch", 0.6)]
# diversifica
ev += [(T["poreso"] - 0.12, "lib:transition/swoosh-quick", 0.6), (T["sola"] - 0.08, "lib:impact/hit-weak", 0.6),
       (T["empresa"] - 0.25, "lib:light/stardust-swish", 0.5), (T["empresa"] - 0.05, "lib:ui/ui-confirm-tone", 0.7)]
# CTA
ev += [(T["cta"] - 0.1, "lib:ui/ui-message-pop", 0.8), (T["juego"] - 0.15, "lib:ui/ui-option-select", 0.7),
       (T["accs"] - 0.15, "lib:ui/ui-option-select", 0.7), (T["accs"] + 0.4, "lib:ui/ui-message-pop", 0.6),
       (T["accs"] + 0.9, "lib:ui/chime-crystal", 0.5)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=100, style="upbeat", seed=7, sfx_gain=0.3)
print("ok", len(ev), "efectos")
