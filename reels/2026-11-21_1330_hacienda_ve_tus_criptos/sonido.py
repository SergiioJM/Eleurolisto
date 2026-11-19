"""Música baja (upbeat, 104 bpm) + efectos sincronizados + voz local k_santa (Hombre 4) para el reel
"¿Hacienda ve tus criptos?" (R2 "Tienes criptos" + llamadas entrantes). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(hac0=pal(0, "hacienda"), entera=pal(0, "entera"), s1=st(1), plat=pal(1, "plataformas"), hac1=pal(1, "hacienda"),
         s2=st(2), bitcoin=pal(2, "bitcoin"), ganancia=pal(2, "ganancia"), s3=st(3), pagas=pal(3, "pagas"), diec=pal(3, "diecinueve"),
         treinta=pal(3, "treinta"), s4=st(4), amigo=pal(4, "amigo"))
ev = [(0.0, "lib:transition/air-woosh-quick", 0.55), (0.25, "lib:light/stardust-swish", 0.4),           # título dorado que aparece
      (0.36, "lib:impact/hit-weak", 0.7),                                                              # Listo aterriza
      (T["hac0"] + 0.1, "lib:transition/swoosh-quick", 0.5), (T["entera"] - 0.05, "lib:ui/switch-click-quick", 0.6)]  # se pone las gafas
ev += [(T["plat"] - 0.25 + k * 0.45, "lib:ui/ui-tone-quick", 0.42) for k in range(4)]                     # llamada 1 (tono)
ev += [(T["plat"] - 0.05, "lib:transition/whoosh-fast", 0.45), (T["plat"] + 0.05, "lib:transition/wind-woosh-throw", 0.4)]  # gafas fuera
ev += [(T["hac1"] - 0.3 + k * 0.4, "lib:ui/ui-notify-tech", 0.45) for k in range(3)]                      # llamada de Hacienda
ev += [(T["hac1"] - 0.25, "lib:impact/bass-hit-short", 0.8),
       (T["s2"] - 0.1, "lib:transition/sweep-fast-small", 0.5), (T["bitcoin"] - 0.3, "lib:ui/ui-message-pop", 0.7),
       (T["ganancia"] - 0.15, "lib:impact/hit-blow", 0.8), (T["ganancia"] - 0.12, "lib:paper/paper-staple", 0.7),   # sello
       (T["ganancia"] + 0.1, "lib:light/sparkle-touch", 0.5),                                          # Listo: idea
       (T["s3"] - 0.15, "lib:transition/swoosh-slow", 0.5),                                              # el título gira
       (T["pagas"], "lib:ui/ui-popup-dry", 0.5), (T["diec"] - 0.12, "lib:impact/impact-zoom-quick", 0.9),  # golpe 19–30 %
       (T["treinta"] - 0.05, "lib:impact/hit-weak", 0.6),
       (T["s4"] - 0.15, "lib:transition/swoosh-slow", 0.5)]
ev += [(T["s4"] + k * 0.45, "lib:ui/ui-tone-quick", 0.35) for k in range(2)]                              # llamando al amigo
ev += [(T["amigo"], "lib:ui/ui-success-soft", 0.6), (T["amigo"] + 0.5, "lib:ui/chime-crystal", 0.5)]

mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=104, style="upbeat", seed=5, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
