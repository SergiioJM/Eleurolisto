"""Música baja (chill, 92 bpm) + efectos sincronizados para el reel de los dividendos (R3 plano de corte).
La voz de ElevenLabs (Mateo) se añade después con add_audio_to_video de Creative Claw (mix, start_offset 0.2 s),
así que aquí NO se normaliza (queda bajo, ≈ −28 LUFS, para que la voz quede por encima)."""
import json
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
T = dict(reveal=st(1) - 0.1, empresa=st(2) - 0.15, accion=pal(2, "accionistas"), sale=st(3) - 0.1, dia=st(4),
         bajar=pal(4, "bajar"), veinte=pal(5, "veinte"), uno=pal(5, "uno"), diecinueve=pal(5, "diecinueve"),
         mismo=st(6), mismo2=pal(6, "mismo"), hacienda=st(7), h19=pal(7, "diecinueve"), garantW=pal(8, "garantizado"),
         total=st(9), cta=st(10))
ev = [(0.02, "lib:transition/air-woosh-quick", 0.6), (0.12, "lib:ui/ui-message-pop", 0.8)]
ev += [(0.45 + i * 0.32, "lib:mech/metal-drop-scifi-small", 0.25) for i in range(6)]          # monedas cayendo en la hucha
ev += [(T["reveal"], "lib:transition/swoosh-slow", 0.8), (T["reveal"] + 0.8, "lib:ui/ui-popup-dry", 0.7)]
ev += [(T["empresa"], "lib:transition/whoosh-fast", 0.6), (T["accion"] - 0.4, "lib:ui/ui-message-pop", 0.7)]
ev += [(T["sale"], "lib:transition/air-woosh-quick", 0.6), (T["sale"] + 0.4, "lib:ui/ui-message-pop", 0.6)]
ev += [(T["dia"], "lib:transition/whoosh-fast", 0.6), (T["bajar"] - 0.05, "lib:impact/bass-hit-short", 0.9),
       (T["bajar"] + 0.05, "lib:counter/clock-tick-single", 0.6)]
ev += [(T["veinte"] - 0.15, "lib:ui/ui-select-modern", 0.7), (T["uno"] - 0.15, "lib:ui/ui-select-modern", 0.7),
       (T["diecinueve"] - 0.1, "lib:counter/clock-knob-spin", 0.6)]
ev += [(T["mismo"] - 0.1, "lib:transition/swoosh-quick", 0.5), (T["mismo2"] - 0.12, "lib:impact/impact-zoom-quick", 0.8),
       (T["mismo2"] + 0.05, "lib:ui/ui-success-soft", 0.6)]
ev += [(T["hacienda"], "lib:transition/air-woosh-quick", 0.6), (T["hacienda"] + 0.3, "lib:ui/ui-message-pop", 0.6),
       (T["h19"] - 0.1, "lib:paper/paper-staple", 0.8)]
ev += [(T["garantW"] - 0.35, "lib:mech/gear-lock-metallic", 0.7), (T["garantW"] - 0.1, "lib:impact/bass-hit-short", 0.9)]
ev += [(T["total"], "lib:transition/swoosh-slow", 0.6)] + [(T["total"] + 0.6 + 0.4 * i, "lib:ui/ui-option-select", 0.6) for i in range(3)]
ev += [(T["cta"], "lib:ui/ui-message-pop", 0.8), (T["cta"] + 0.25, "lib:ui/ui-message-pop", 0.8), (T["cta"] + 0.7, "lib:ui/chime-crystal", 0.5)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=92, style="chill", seed=7, sfx_gain=0.3)
print("ok", len(ev), "efectos")
