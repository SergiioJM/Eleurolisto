"""Música baja (upbeat 124 bpm) + efectos de papel sincronizados + voz local v1 (voice.wav) para «Black Friday: 3 trampas»
(look R10 papel recortado / collage de tiques). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”«»]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(mentira=pal(0, "mentira"), precio1=pal(1, "precio"), suben=pal(1, "suben"), antes=pal(1, "antes"), baj=pal(1, "bajártelo"),
         tachado=pal(2, "tachado"), precio2=pal(2, "precio"), bajo=pal(2, "bajo"), treinta=pal(2, "treinta"), solo=pal(3, "solo"), muchas=pal(3, "muchas"),
         teatro=pal(3, "teatro"), aparecen=pal(4, "aparecen"), pagar=pal(4, "pagar"), viernes=pal(5, "viernes"), comenta=pal(5, "comenta"),
         uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
INI = [st(i) - 0.14 for i in range(1, 6)]
ev = [(0.0, "lib:paper/paper-slide", 0.5), (0.05, "lib:impact/hit-weak", 0.35)]
ev += [(0.12 + i * 0.05, "lib:paper/paper-move-quick", 0.18) for i in range(0, 9, 2)]                 # letras recortadas
ev += [(t, "lib:paper/paper-slide", 0.55) for t in INI]                                                  # deslizar papeles
ev += [(t + 0.1, "lib:transition/air-woosh-quick", 0.25) for t in INI]
ev += [(T["mentira"] - 0.02, "lib:impact/hit-blow", 0.75), (T["mentira"], "lib:paper/paper-staple", 0.5)]   # sello ¿FALSO?
ev += [(INI[0] + 0.1, "lib:paper/paper-scissors-cut", 0.35), (T["precio1"] - 0.25, "lib:paper/paper-move-quick", 0.4),
       (T["suben"] - 0.1, "lib:paper/paper-slide", 0.4), (T["antes"] - 0.25, "lib:paper/paper-move-quick", 0.45), (T["antes"] - 0.05, "lib:text/marker-pen-line", 0.5),
       (T["baj"] - 0.3, "lib:ui/ui-message-pop", 0.5), (T["baj"] + 0.08, "lib:impact/hit-blow", 0.8), (T["baj"] + 0.1, "lib:paper/paper-staple", 0.45)]
ev += [(T["tachado"] - 0.2, "lib:text/pen-write-paper", 0.35), (T["bajo"] - 0.2, "lib:ui/ui-tone-quick", 0.35), (T["bajo"], "lib:text/marker-pen-line", 0.6),
       (T["treinta"] - 0.1, "lib:text/chalk-line", 0.4)]
ev += [(T["precio2"] - 0.3 + d * 0.025, "lib:counter/clock-tick-single", 0.08) for d in range(0, 30, 3)]
k = st(3)
while k < T["teatro"] - 0.2:
    ev.append((k, "lib:counter/clock-tick-single", 0.22)); k += 1.0
ev += [(T["solo"] - 0.12, "lib:ui/ui-message-pop", 0.55), (T["teatro"] - 0.25, "lib:transition/swoosh-slow", 0.45), (T["teatro"], "lib:impact/hit-blow", 0.75)]
ev += [(st(4) + 0.05, "lib:mech/machine-activate-short", 0.3)]
ev += [(T["aparecen"] - 0.2 + d, "lib:text/typewriter-hit-soft", 0.45) for d in (0.0, 0.2, 0.4)]
ev += [(T["aparecen"] + 0.45, "lib:text/marker-pen-line", 0.55), (T["aparecen"] + 0.6, "lib:ui/ui-popup-dry", 0.45), (T["pagar"], "lib:impact/hit-weak", 0.4)]
ev += [(st(5) - 0.05 + i * 0.035 * 2, "lib:paper/paper-move-quick", 0.16) for i in range(0, 14, 2)]
ev += [(T["uno"] - 0.12, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.12, "lib:ui/ui-select-modern", 0.7),
       (FIN - 1.1, "lib:paper/paper-slide", 0.45), (FIN - 0.45, "lib:ui/switch-click-quick", 0.7), (FIN - 0.3, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=124, style="upbeat", seed=11, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
