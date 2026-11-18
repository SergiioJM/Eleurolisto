"""Música baja (chill, 100 bpm) + efectos sincronizados para el reel "Fondos indexados vs gestión activa" (R5 plastilina).
La voz de ElevenLabs (Carmen) se añade después con add_audio_to_video de Creative Claw (mix, start_offset = offset_voz),
así que aquí NO se normaliza (queda bajo, ≈ −28 LUFS, para que la voz quede por encima)."""
import json
import re
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…]", "", w.lower())
st = lambda i: S[i]["start"]


def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]


T = dict(noventa=pal(0, "noventa"), batieron=pal(0, "batieron"), y1=st(1), cerraron=pal(1, "cerraron"),
         el=st(2), gestor=pal(2, "gestor"), uno=pal(2, "uno"), indexado=pal(2, "indexado"), cero=pal(2, "cero"),
         diez=pal(3, "diez"), treinta=pal(3, "treinta"), cincuenta=pal(3, "cincuenta"), setenta=pal(3, "setenta"), mil2=pal(3, "mil", 2),
         algunos=st(4), saber=pal(4, "saber"), antes=pal(4, "antes"), imposible=pal(4, "imposible"),
         tu=st(5), comenta=pal(5, "comenta"), gestor2=pal(5, "gestor"), indice2=pal(5, "índice"))
ev = [(0.0, "lib:transition/air-woosh-quick", 0.5), (0.05, "lib:ui/ui-message-pop", 0.4), (0.3, "lib:transition/whoosh-fast", 0.5),
      (0.55, "lib:impact/hit-weak", 0.7), (T["noventa"] - 0.25, "lib:impact/impact-zoom-quick", 0.8)]
ev += [(T["batieron"] - 0.1 + k * 0.07, "lib:counter/clock-tick-single", 0.35) for k in range(9)]       # ola de fondos que caen
ev += [(T["batieron"] + 0.1, "lib:impact/gravel-fall-hit", 0.5), (T["batieron"] + 0.35, "lib:light/sparkle-touch", 0.6)]
ev += [(T["cerraron"] - 0.55 + k * 0.25, "lib:mech/metal-drop-scifi-small", 0.3) for k in range(6)]     # se hunden los que cierran
ev += [(T["cerraron"] - 0.4, "lib:ui/ui-popup-dry", 0.7),
       (T["el"] - 0.6, "lib:transition/swoosh-slow", 0.6), (T["el"] - 0.3, "lib:ui/ui-message-pop", 0.7), (T["el"] - 0.15, "lib:ui/ui-message-pop", 0.6),
       (T["gestor"] - 0.2, "lib:ui/ui-select-modern", 0.6), (T["uno"] - 0.12, "lib:paper/paper-staple", 0.8),
       (T["indexado"] - 0.25, "lib:ui/ui-select-modern", 0.6), (T["cero"] - 0.12, "lib:paper/paper-staple", 0.8),
       (T["diez"] - 0.2, "lib:mech/metal-drop-scifi-small", 0.6)]
k, tt = 0, T["treinta"]
while tt < T["cincuenta"]:                                                                              # monedas que se apilan
    ev.append((tt, "lib:mech/metal-drop-scifi-small", 0.22 + 0.04 * (k % 2))); tt += 0.17; k += 1
ev += [(T["cincuenta"], "lib:ui/ui-confirm-tone", 0.6), (T["setenta"] - 0.1, "lib:transition/wind-woosh-throw", 0.6),
       (T["setenta"] + 0.45, "lib:impact/bass-hit-short", 0.9), (T["setenta"] + 0.5, "lib:light/shimmer-sparkle-sweep", 0.6),
       (T["mil2"] + 0.1, "lib:ui/ui-success-soft", 0.7),
       (T["algunos"] - 0.2, "lib:transition/swoosh-quick", 0.55), (T["algunos"] + 0.15, "lib:ui/ui-message-pop", 0.6),
       (T["algunos"] + 0.3, "lib:ui/ui-message-pop", 0.6)]
ev += [(T["saber"] - 0.1 + j * 0.1, "lib:ui/ui-tone-quick", 0.45) for j in range(3)]
dj = (T["imposible"] + 0.5 - (T["antes"] - 0.35)) / 3
ev += [(T["antes"] - 0.35 + j * dj, "lib:transition/whoosh-swirl", 0.45) for j in range(3)]
ev += [(T["tu"], "lib:transition/swoosh-slow", 0.5), (T["tu"] + 0.2, "lib:ui/ui-popup-dry", 0.7), (T["tu"] + 0.3, "lib:ui/ui-popup-dry", 0.6),
       (T["gestor2"] - 0.05, "lib:ui/ui-select-click", 0.6), (T["indice2"] - 0.05, "lib:ui/ui-select-click", 0.6),
       (T["comenta"] - 0.1, "lib:light/sparkle-wand", 0.55), (T["indice2"] + 0.5, "lib:ui/chime-crystal", 0.5)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=100, style="chill", seed=3, sfx_gain=0.3)
print("ok", len(ev), "efectos")
