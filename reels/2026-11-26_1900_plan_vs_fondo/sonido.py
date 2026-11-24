"""Música baja (chill 96 bpm) + efectos sincronizados + voz de ElevenLabs (Mateo, ya recortada en voice.wav) para
«Plan de pensiones o fondo indexado» (parte 2, look R5 plastilina). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”«»]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(quinientos=pal(0, "quinientos"), plan0=pal(0, "plan"), fondo0=pal(0, "fondo"), indexado=pal(0, "indexado"),
         devuelve=pal(1, "devuelve"), cuatro=pal(1, "cuatrocientos"), euros=pal(1, "euros"),
         todo=pal(2, "todo"), metiste=pal(2, "metiste"), gano=pal(2, "ganó"), sueldo=pal(2, "sueldo"), bloqueado=pal(2, "bloqueado"), diez=pal(2, "diez"),
         nada=pal(3, "nada"), sacas=pal(3, "sacas"), ganancia=pal(3, "ganancia"), diecinueve=pal(3, "diecinueve"),
         ventaja=pal(4, "ventaja"), libertad=pal(4, "libertad"), comenta=pal(5, "comenta"), uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/air-woosh-quick", 0.45), (0.05, "lib:ui/ui-message-pop", 0.4), (T["quinientos"] - 0.1, "lib:impact/impact-zoom-quick", 0.6),
      (T["plan0"] - 0.05, "lib:ui/ui-select-modern", 0.5), (T["fondo0"] - 0.05, "lib:ui/ui-select-modern", 0.5), (T["indexado"] + 0.1, "lib:impact/hit-weak", 0.6)]
ev += [(st(1) - 0.25, "lib:transition/swoosh-slow", 0.5)]
ev += [(T["devuelve"] + j * 0.18 + 0.6, "lib:mech/metal-drop-scifi-small", 0.35) for j in range(3)]           # monedas que vuelven
ev += [(T["cuatro"] - 0.1, "lib:ui/ui-success-soft", 0.6), (T["cuatro"] + 0.1, "lib:light/sparkle-touch", 0.5)]
ev += [(st(2) - 0.2, "lib:transition/swoosh-quick", 0.45), (T["todo"] - 0.1, "lib:impact/bass-hit-short", 0.7), (T["todo"] + 0.05, "lib:paper/paper-staple", 0.6)]
ev += [(T["metiste"] - 0.15 + k * 0.17, "lib:mech/metal-drop-scifi-small", 0.22) for k in range(4)]       # la pila crece
ev += [(T["gano"] - 0.15 + k * 0.17, "lib:mech/metal-drop-scifi-small", 0.25) for k in range(3)]
ev += [(T["sueldo"] - 0.05, "lib:ui/ui-popup-dry", 0.55), (T["bloqueado"] - 0.18, "lib:transition/wind-woosh-throw", 0.5),
       (T["bloqueado"] + 0.2, "lib:impact/hit-blow", 0.7), (T["diez"] - 0.1, "lib:counter/clock-knob-spin", 0.45)]
ev += [(st(3) - 0.25, "lib:transition/swoosh-slow", 0.5), (T["nada"] - 0.1, "lib:ui/ui-tone-quick", 0.5),
       (T["sacas"] - 0.05, "lib:ui/ui-confirm-tone", 0.55), (T["sacas"] + 0.55, "lib:mech/metal-drop-scifi-small", 0.3), (T["sacas"] + 0.7, "lib:mech/metal-drop-scifi-small", 0.3),
       (T["ganancia"] - 0.1, "lib:paper/paper-staple", 0.6), (T["diecinueve"] - 0.05, "lib:ui/ui-popup-dry", 0.5)]
ev += [(st(4) - 0.25, "lib:transition/swoosh-quick", 0.45), (T["ventaja"] - 0.1, "lib:transition/wind-woosh-throw", 0.5), (T["ventaja"] + 0.38, "lib:impact/bass-hit-short", 0.7),
       (T["ventaja"] + 0.42, "lib:light/shimmer-sparkle-sweep", 0.5), (T["libertad"] - 0.05, "lib:transition/whoosh-swirl", 0.5), (T["libertad"] + 0.5, "lib:light/sparkle-touch", 0.5)]
ev += [(st(5) - 0.1, "lib:ui/ui-popup-dry", 0.6), (st(5), "lib:ui/ui-popup-dry", 0.55), (T["comenta"] - 0.1, "lib:light/sparkle-wand", 0.5),
       (T["uno"] - 0.05, "lib:ui/ui-select-click", 0.6), (T["dos"] - 0.05, "lib:ui/ui-select-click", 0.6),
       (FIN - 1.2, "lib:ui/ui-message-pop", 0.5), (FIN - 0.5, "lib:ui/switch-click-quick", 0.7), (FIN - 0.35, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=96, style="chill", seed=7, sfx_gain=0.26)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
