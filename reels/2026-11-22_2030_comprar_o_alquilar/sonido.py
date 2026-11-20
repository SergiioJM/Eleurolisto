"""Música baja (chill, 82 bpm) + efectos sincronizados + voz de ElevenLabs (Lucía, ya descargada y recortada en voice.wav)
para "¿Comprar o alquilar e invertir?" (look R1 selector de estados con monigotes). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(treinta0=pal(0, "treinta"), s1=st(1), s2=st(2), tres2=pal(2, "tres"), s3=st(3), s4=st(4), treinta4=pal(4, "treinta"), veinte=pal(4, "veinte"),
         diez=pal(4, "diez"), gastos=pal(4, "gastos"), cuota=pal(5, "cuota"), forzoso=pal(5, "forzoso"), s6=st(6), inviertes=pal(6, "inviertes"),
         diferencia6=pal(6, "diferencia"), s7=st(7), mejor=pal(7, "mejor"), caidas=pal(7, "caídas"), sin=pal(7, "sin"), s8=st(8), gastas=pal(8, "gastas"),
         casa=pal(9, "casa"), cartera=pal(9, "cartera"), s10=st(10), uno=pal(11, "uno"), dos=pal(11, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/whoosh-fast", 0.45), (0.33, "lib:impact/hit-weak", 0.5),                    # Listo aterriza
      (T["treinta0"] - 0.15, "lib:transition/sweep-fast-small", 0.45), (T["treinta0"] + 0.5, "lib:impact/hit-blow", 0.55),
      (T["s1"] - 0.05, "lib:transition/sweep-fast-small", 0.45),
      (T["s2"] + 0.2, "lib:transition/swoosh-quick", 0.4), (T["s2"] + 0.9, "lib:ui/ui-message-pop", 0.6)]
ev += [(T["tres2"] + 0.05 + i * 0.22, "lib:ui/ui-option-select", 0.5) for i in range(3)]                  # las 3 pestañas
ev += [(T["s3"] - 0.05, "lib:ui/ui-select-modern", 0.7), (T["treinta4"] - 0.05, "lib:impact/hit-fast-exciting", 0.5)]
ev += [(T["veinte"] + i * 0.22, "lib:ui/pop-electric", 0.25) for i in range(8)]                          # monedas a la casa
ev += [(T["gastos"] + 0.1, "lib:ui/ui-confirm-tone", 0.45), (T["cuota"] - 0.1, "lib:mech/mech-tech-movement", 0.35),
       (T["forzoso"] - 0.05, "lib:impact/bass-hit-short", 0.8), (T["forzoso"] + 0.4, "lib:light/sparkle-poof-hit", 0.35),
       (T["s6"] - 0.45, "lib:camera/zoom-swipe-fast", 0.5), (T["s6"] - 0.05, "lib:ui/ui-select-modern", 0.7)]  # rebobinado + pestaña 2
ev += [(T["inviertes"] + i * 0.12, "lib:ui/pop-electric", 0.22) for i in range(6)]
ev += [(T["diferencia6"] + 0.2 + i * 0.28, "lib:ui/ui-tone-quick", 0.2) for i in range(6)]
ev += [(T["s7"], "lib:text/marker-pen-line", 0.45), (T["mejor"] - 0.1, "lib:light/stardust-swish", 0.4), (T["caidas"] - 0.15, "lib:impact/hit-weak", 0.6),
       (T["sin"] - 0.06, "lib:impact/impact-zoom-quick", 0.8),
       (T["s8"] - 0.45, "lib:camera/zoom-swipe-fast", 0.5), (T["s8"] - 0.05, "lib:ui/ui-select-modern", 0.7)]  # rebobinado + pestaña 3
ev += [(T["gastas"] + i * 0.1, "lib:ui/pop-electric", 0.2) for i in range(8)]
ev += [(T["gastas"] + i * 0.2, "lib:ui/ui-popup-dry", 0.35) for i in range(4)]
ev += [(T["casa"] - 0.05, "lib:impact/hit-blow", 0.6), (T["cartera"] - 0.05, "lib:impact/hit-blow", 0.6), (T["casa"], "lib:impact/gravel-fall-hit", 0.4),
       (T["s10"] - 0.05, "lib:transition/whoosh-swirl", 0.45), (T["uno"] - 0.08, "lib:ui/ui-select-modern", 0.7), (T["dos"] - 0.08, "lib:ui/ui-select-modern", 0.7),
       (FIN - 1.1, "lib:ui/ui-message-pop", 0.5), (FIN - 0.45, "lib:ui/switch-click-quick", 0.7), (FIN - 0.3, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=82, style="chill", seed=12, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
