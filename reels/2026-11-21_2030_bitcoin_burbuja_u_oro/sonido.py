"""Música baja (chill, 88 bpm, tensión) + efectos de terminal sincronizados + voz de ElevenLabs (Juanjo, ya descargada y
recortada en voice.wav) para el reel "¿Bitcoin: burbuja u oro digital?" (look terminal de bolsa). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(mitad=pal(0, "mitad"), s1=st(1), oro1=pal(1, "oro"), s2=st(2), benef=pal(2, "beneficios"), hundio=pal(2, "hundió"), ochenta=pal(2, "ochenta"),
         setenta=pal(2, "setenta"), veintidos=pal(2, "veintidós"), s3=st(3), existiran=pal(3, "existirán"), millones=pal(3, "millones"),
         veinticuatro=pal(3, "veinticuatro"), s4=st(4), matiz=pal(4, "matiz"), oro4=pal(4, "oro"), mitad4=pal(4, "mitad"), s5=st(5), puede=pal(5, "puede"),
         caer=pal(5, "caer"), s6=st(6), comenta=pal(6, "comenta"), uno=pal(6, "uno"), dos=pal(6, "dos"))
ev = [(0.0, "lib:data/data-load-os", 0.45), (0.05, "lib:data/sweep-digital", 0.4)]
ev += [(0.1 + k * 0.13, "lib:counter/clock-tick-single", 0.28) for k in range(11)]                      # el precio baja
ev += [(0.3, "lib:impact/hit-weak", 0.5),                                                                # Listo aterriza
       (T["mitad"] - 0.06, "lib:impact/bass-hit-futuristic", 0.9),                                       # golpe −50 %
       (T["s1"] - 0.15, "lib:transition/transition-tech-slide", 0.55), (T["oro1"] - 0.15, "lib:transition/transition-tech-slide", 0.55),
       (T["s2"] - 0.05, "lib:ui/ui-option-select", 0.6), (T["benef"] - 0.3, "lib:text/typewriter-hit-soft", 0.6),
       (T["hundio"] - 0.35, "lib:data/sweep-digital", 0.5), (T["ochenta"] - 0.05, "lib:impact/impact-zoom-quick", 0.85),
       (T["setenta"] - 0.55, "lib:data/sweep-digital", 0.5), (T["setenta"] - 0.05, "lib:impact/impact-zoom-quick", 0.85),
       (T["veintidos"], "lib:transition/air-woosh-deep", 0.4),
       (T["s3"] - 0.35, "lib:data/sweep-digital", 0.45), (T["s3"] - 0.05, "lib:ui/ui-option-select", 0.6),
       (T["existiran"] - 0.2, "lib:data/data-compute", 0.55), (T["millones"] + 0.05, "lib:ui/ui-confirm-bleep", 0.6),
       (T["veinticuatro"] - 0.2, "lib:ui/ui-notify-tech", 0.6),
       (T["s4"] - 0.25, "lib:transition/warp-slide", 0.55), (T["matiz"] - 0.3, "lib:text/typewriter-hit-soft", 0.6),
       (T["oro4"] - 0.3, "lib:ui/ui-popup-dry", 0.5), (T["mitad4"] - 0.1, "lib:impact/hit-blow", 0.7),
       (T["s5"] - 0.2, "lib:transition/transition-tech", 0.5)]
ev += [(T["s5"] + k * 0.35, "lib:ui/pop-electric", 0.45) for k in range(3)]                               # barras de caídas
ev += [(T["puede"] - 0.2, "lib:impact/bass-hit-short", 0.8), (T["caer"] - 0.15, "lib:impact/gravel-fall-hit", 0.55),   # aviso + gorro roto
       (T["s6"] - 0.05, "lib:transition/swoosh-slow", 0.5), (T["s6"] + 0.05, "lib:ui/ui-message-pop", 0.7),
       (T["comenta"] - 0.05, "lib:ui/ui-success-soft", 0.5),
       (T["uno"] - 0.05, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.05, "lib:ui/ui-select-modern", 0.7),
       (T["dos"] + 0.9, "lib:ui/chime-crystal", 0.5)]

mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=88, style="chill", seed=8, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
