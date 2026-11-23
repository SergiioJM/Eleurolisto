"""Música baja (chill 92 bpm) + efectos de terminal y montaña rusa sincronizados + voz de ElevenLabs (Carmen, ya descargada y
recortada en voice.wav) para «¿Burbuja de la IA?» (look terminal de bolsa + montaña rusa). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”«»]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(cuarenta=pal(0, "cuarenta"), mes=pal(0, "mes"), hoy=pal(0, "lunes"), treinta=pal(0, "treinta"), dia=pal(0, "día"),
         puntocom=pal(1, "puntocom"), siete=pal(2, "siete"), treinta2=pal(2, "treinta"), mil2=pal(2, "mil"), ganan=pal(3, "ganan"), cotizan=pal(3, "cotizan"),
         mitad=pal(3, "mitad"), nasdaq=pal(4, "nasdaq"), setenta=pal(4, "setenta"), quince=pal(4, "quince"), comenta=pal(5, "comenta"), uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:data/data-load-os", 0.35), (0.05, "lib:impact/hit-weak", 0.35), (0.2, "lib:mech/mech-tech-movement", 0.35)]
k = 0.3
while k < T["mes"]:                                             # traqueteo de la vagoneta bajando
    ev.append((k, "lib:counter/clock-tick-single", 0.12 + 0.1 * k / max(T["mes"], 0.1))); k += max(0.07, 0.22 - 0.05 * k)
ev += [(0.4, "lib:transition/wind-pass-vibrate", 0.45), (T["cuarenta"] - 0.1, "lib:impact/bass-hit-futuristic", 0.6), (T["mes"] + 0.05, "lib:impact/hit-blow", 0.6),
       (T["hoy"] - 0.1, "lib:data/whoosh-electric", 0.5), (T["treinta"] - 0.1, "lib:ui/pop-electric", 0.55), (T["dia"], "lib:light/shimmer-sparkle-sweep", 0.35)]
ev += [(st(1) - 0.05, "lib:ui/ui-notify-tech", 0.35), (T["puntocom"] - 0.25, "lib:ui/ui-popup-dry", 0.45)]
ev += [(st(2) - 0.25, "lib:transition/transition-tech-slide", 0.55), (st(2) + 0.1, "lib:ui/ui-option-select", 0.45), (T["siete"] - 0.3, "lib:text/typewriter-hit-soft", 0.4),
       (T["mil2"] - 0.2, "lib:data/data-compute", 0.3), (T["treinta2"] - 0.3, "lib:data/data-compute", 0.35), (T["treinta2"] + 0.3, "lib:impact/impact-zoom-quick", 0.6)]
ev += [(st(3) - 0.25, "lib:transition/transition-tech-slide", 0.55), (st(3) + 0.1, "lib:ui/ui-option-select", 0.45), (T["ganan"] - 0.3, "lib:ui/ui-confirm-bleep", 0.45),
       (T["cotizan"] - 0.2, "lib:data/data-compute", 0.3), (T["mitad"] - 0.1, "lib:impact/hit-blow", 0.65), (T["mitad"], "lib:light/sparkle-touch", 0.35)]
ev += [(st(4) - 0.25, "lib:transition/warp-slide", 0.5), (st(4) + 0.1, "lib:data/sweep-digital", 0.35), (T["setenta"] - 0.15, "lib:impact/impact-zoom-quick", 0.7),
       (T["setenta"], "lib:impact/gravel-fall-hit", 0.4), (T["quince"] - 0.2, "lib:counter/clock-knob-spin", 0.45), (T["quince"] + 0.1, "lib:ui/ui-notify-tech", 0.4)]
ev += [(st(5) - 0.2, "lib:transition/swoosh-slow", 0.45), (st(5) + 0.05, "lib:ui/ui-message-pop", 0.4), (T["uno"] - 0.1, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.1, "lib:ui/ui-select-modern", 0.7),
       (FIN - 1.1, "lib:ui/ui-message-pop", 0.5), (FIN - 0.45, "lib:ui/switch-click-quick", 0.7), (FIN - 0.3, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=92, style="chill", seed=4, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
