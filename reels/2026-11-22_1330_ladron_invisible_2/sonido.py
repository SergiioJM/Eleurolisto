"""Música baja (upbeat, 104 bpm) + efectos sincronizados + voz de ElevenLabs (Mateo, ya descargada y recortada en voice.wav)
para "El ladrón invisible 2" (look R7 3D de bloques, luz fija). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(roba=pal(0, "roba"), mas=pal(0, "más"), s1=st(1), cuatro=pal(1, "cuatro"), hoy=pal(2, "hoy"), diez=pal(2, "diez"), dentro=pal(2, "dentro"),
         costara=pal(2, "costará"), noventa=pal(2, "noventa"), cinco=pal(3, "cinco"), doce=pal(3, "doce"), setecientos=pal(3, "setecientos"),
         s4=st(4), uno=pal(5, "uno"), dos=pal(5, "dos"), s6=st(6), vuelve=pal(6, "vuelve"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/whoosh-fast", 0.55), (0.35, "lib:impact/hit-weak", 0.5),                 # el aceite sale volando + Listo aterriza
      (0.6, "lib:light/sparkle-poof-hit", 0.35),
      (T["roba"] - 0.25, "lib:transition/swoosh-quick", 0.5), (T["mas"] - 0.1, "lib:transition/swoosh-quick", 0.5),
      (T["mas"] + 0.05, "lib:impact/hit-fast-exciting", 0.45),
      (T["cuatro"] - 0.06, "lib:impact/bass-hit-short", 0.9),                                          # golpe 4,9 %
      (T["hoy"] - 0.05, "lib:transition/air-woosh-quick", 0.45)]
ev += [(T["hoy"] + k * 0.06, "lib:ui/ui-message-pop", 0.22) for k in range(0, 16, 2)]                 # la compra vuelve a la mesa
ev += [(T["dentro"] + k * 0.2, "lib:counter/clock-tick-single", 0.3) for k in range(int((T["noventa"] - T["dentro"]) / 0.2))]
ev += [(T["costara"] - 0.2, "lib:transition/wind-woosh-throw", 0.45), (T["noventa"] + 0.1, "lib:ui/ui-confirm-tone", 0.45),
       (T["cinco"] - 0.15, "lib:counter/clock-knob-spin", 0.5),
       (T["cinco"] - 0.2, "lib:transition/swoosh-quick", 0.4), (T["doce"] - 0.3, "lib:transition/swoosh-quick", 0.4), (T["setecientos"] - 0.2, "lib:transition/swoosh-quick", 0.4),
       (T["setecientos"] - 0.06, "lib:impact/impact-zoom-quick", 0.85), (T["setecientos"] + 0.1, "lib:impact/gravel-fall-hit", 0.4),   # golpe 12.700 + gorro roto
       (T["s4"] - 0.1, "lib:transition/swoosh-slow", 0.45), (T["s4"] + 0.1, "lib:light/sparkle-touch", 0.4),
       (T["uno"] - 0.08, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.08, "lib:ui/ui-select-modern", 0.7), (T["dos"] + 0.1, "lib:ui/ui-success-soft", 0.4),
       (T["s6"], "lib:transition/whoosh-swirl", 0.4), (FIN - 0.1, "lib:ui/switch-click-quick", 0.6), (FIN + 0.05, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=104, style="upbeat", seed=6, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
