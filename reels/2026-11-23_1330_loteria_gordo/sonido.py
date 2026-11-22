"""Música baja (upbeat, 116 bpm) + efectos de cómic sincronizados + voz de ElevenLabs (Juanjo Viral, ya descargada y
recortada en voice.wav) para "El Gordo no son 400.000 €" (look R9 cómic). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(euros=pal(0, "euros"), s1=st(1), queda=pal(1, "queda"), setenta=pal(1, "setenta"), s2=st(2), cuarenta=pal(2, "cuarenta"),
         libres=pal(2, "libres"), resto=pal(2, "resto"), veinte=pal(2, "veinte"), s3=st(3), quedan=pal(3, "quedan"), trescientos=pal(3, "trescientos"),
         mil3=pal(3, "mil"), s4=st(4), una=pal(4, "una"), cien=pal(4, "cien"), s5=st(5), uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
INI = [st(i) - 0.12 for i in range(1, 6)]
ev = [(0.0, "lib:impact/hit-fast-exciting", 0.45), (0.05, "lib:transition/whoosh-fast", 0.3)]
ev += [(t, "lib:paper/paper-page-turn", 0.55) for t in INI]                                   # pasar de viñeta
ev += [(T["euros"] - 0.05, "lib:text/marker-pen-line", 0.6), (T["euros"] + 0.12, "lib:text/marker-pen-line", 0.6),
       (T["euros"] + 0.35, "lib:ui/ui-message-pop", 0.45)]
ev += [(T["s1"] + 0.05, "lib:mech/mech-tech-movement", 0.4), (T["queda"] - 0.05, "lib:impact/hit-blow", 0.7),
       (T["queda"], "lib:mech/gear-lock-metallic", 0.45), (T["setenta"], "lib:impact/bass-hit-short", 0.75), (T["setenta"] + 0.15, "lib:transition/swoosh-quick", 0.45)]
ev += [(T["cuarenta"] - 0.1, "lib:ui/ui-tone-quick", 0.35), (T["libres"] - 0.25, "lib:ui/ui-message-pop", 0.45),
       (T["resto"] - 0.1, "lib:ui/ui-message-pop", 0.45), (T["veinte"] - 0.1, "lib:impact/hit-weak", 0.6), (T["veinte"], "lib:ui/ui-popup-dry", 0.4)]
k = T["quedan"]
while k < T["mil3"] + 0.2:
    ev.append((k, "lib:counter/clock-tick-single", 0.22)); k += 0.11
ev += [(T["trescientos"] - 0.2, "lib:light/sparkle-touch", 0.4), (T["mil3"] + 0.2, "lib:impact/impact-zoom-quick", 0.75),
       (T["mil3"] + 0.25, "lib:light/shimmer-sparkle-sweep", 0.35)]
ev += [(T["trescientos"] + i * 0.12, "lib:paper/paper-slide", 0.2) for i in range(4)]
ev += [(T["s4"] + 0.1, "lib:transition/air-zoom-vacuum", 0.45), (T["una"] - 0.05, "lib:impact/hit-blow", 0.65), (T["cien"], "lib:impact/gravel-fall-hit", 0.4)]
ev += [(T["s5"] - 0.05, "lib:transition/whoosh-swirl", 0.4), (T["uno"] - 0.12, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.12, "lib:ui/ui-select-modern", 0.7),
       (FIN - 1.15, "lib:ui/ui-message-pop", 0.5), (FIN - 0.45, "lib:ui/switch-click-quick", 0.7), (FIN - 0.3, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=116, style="upbeat", seed=23, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
