"""Música baja (upbeat, 92 bpm, seed 23) + efectos sincronizados + voz de ElevenLabs (Mateo, ya recortada en voice.wav)
para "Plan de pensiones: ¿chollo o trampa?" (look R3 plano de corte con caja fuerte). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(devuelve=pal(0, "devuelve"), cuatro0=pal(0, "cuatrocientos"), luego=pal(0, "luego"), cobra=pal(0, "cobra"),
         s1=st(1), chollo1=pal(1, "chollo"), trampa1=pal(1, "trampa"), s2=st(2), metes=pal(2, "metes"), quinientos=pal(2, "quinientos"),
         treinta=pal(2, "treinta"), ahorras=pal(2, "ahorras"), cuatro2=pal(2, "cuatrocientos"), cincuenta2=pal(2, "cincuenta"),
         s3=st(3), sacarlo=pal(3, "sacarlo"), todo3=pal(3, "todo"), metiste=pal(3, "metiste"), gano=pal(3, "ganó"), sueldo=pal(3, "sueldo"),
         s4=st(4), tocarlo=pal(4, "tocarlo"), cada=pal(4, "cada"), diez=pal(4, "diez"), salvo=pal(4, "salvo"),
         s5=st(5), menos=pal(5, "menos"), irpf5=pal(5, "irpf"), s6=st(6), golpe=pal(6, "golpe"), saltar=pal(6, "saltar"), perder=pal(6, "perder"),
         s7=st(7), trampa7=pal(7, "trampa"), uno=pal(7, "uno"), dos=pal(7, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/air-woosh-quick", 0.4), (0.25, "lib:ui/ui-message-pop", 0.45)]                     # Listo se asoma + gancho
ev += [(T["devuelve"] + 0.05 + i * 0.17 + 0.5, "lib:ui/pop-electric", 0.25) for i in range(8)]                  # monedas que llegan
ev += [(T["luego"] - 0.1, "lib:transition/swoosh-quick", 0.45), (T["luego"] + 0.35, "lib:mech/metal-drop-scifi-small", 0.5),
       (T["cobra"] - 0.03, "lib:impact/hit-blow", 0.6), (T["luego"] + 0.5, "lib:transition/wind-woosh-throw", 0.4)]  # el gancho se las lleva
ev += [(T["s1"] - 0.1, "lib:transition/whoosh-fast", 0.4), (T["chollo1"] - 0.15, "lib:paper/paper-slide", 0.5), (T["chollo1"] + 0.1, "lib:impact/hit-weak", 0.45),
       (T["trampa1"] - 0.15, "lib:paper/paper-slide", 0.5), (T["trampa1"] + 0.1, "lib:impact/hit-weak", 0.45)]  # carteles colgantes
ev += [(T["s2"] - 0.05, "lib:ui/ui-success-soft", 0.5)]
ev += [(T["metes"] + i * 0.16 + 0.35, "lib:glass/glass-plate-slide", 0.18) for i in range(6)]                    # monedas por el tubo
ev += [(T["quinientos"] - 0.1, "lib:ui/ui-popup-dry", 0.45), (T["treinta"] - 0.15, "lib:paper/paper-move-quick", 0.5),
       (T["ahorras"] - 0.05, "lib:counter/countdown-bleeps", 0.3), (T["cincuenta2"] - 0.03, "lib:impact/bass-hit-short", 0.75),
       (T["cincuenta2"] + 0.1, "lib:light/sparkle-poof-hit", 0.35), (T["cincuenta2"] - 0.2, "lib:ui/chime-crystal", 0.35)]
ev += [(T["cuatro2"] + i * 0.12 + 0.4, "lib:ui/pop-electric", 0.2) for i in range(6)]                           # Hacienda devuelve 450 €
ev += [(T["s3"] - 0.05, "lib:ui/ui-notify-tech", 0.45), (T["sacarlo"] - 0.3, "lib:mech/door-open-futuristic", 0.5),
       (T["todo3"] - 0.1, "lib:ui/ui-popup-dry", 0.45), (T["metiste"] - 0.2, "lib:ui/ui-select-modern", 0.45), (T["gano"] - 0.2, "lib:ui/ui-select-modern", 0.45),
       (T["sueldo"] - 0.1, "lib:impact/impact-zoom-quick", 0.75), (T["sueldo"] - 0.3, "lib:transition/air-zoom-vacuum", 0.35)]  # Hacienda aspira su parte
ev += [(T["s4"] - 0.05, "lib:mech/gear-lock-metallic", 0.55), (T["tocarlo"] - 0.1, "lib:mech/lock-quick", 0.7), (T["cada"] - 0.1, "lib:counter/clock-knob-spin", 0.45),
       (T["diez"] - 0.1, "lib:impact/metal-spring-hit", 0.55), (T["salvo"], "lib:ui/ui-tone-quick", 0.3)]
ev += [(T["s5"] - 0.05, "lib:transition/transition-soft", 0.45), (T["menos"] - 0.1, "lib:mech/mech-tech-movement", 0.4),
       (T["irpf5"] + 0.1, "lib:ui/ui-confirm-tone", 0.55)]
ev += [(T["s6"] - 0.05, "lib:transition/swoosh-quick", 0.45), (T["golpe"] - 0.1, "lib:ui/ui-message-pop", 0.45)]
ev += [(T["saltar"] - 0.05 + i * 0.27, "lib:impact/hit-weak", 0.45) for i in range(3)]                          # el bloque sube de tramo
ev += [(T["perder"] - 0.08, "lib:impact/hit-blow", 0.65), (T["perder"] + 0.1, "lib:impact/gravel-fall-hit", 0.35),
       (T["s7"] - 0.1, "lib:transition/whoosh-swirl", 0.45), (T["s7"] + 0.05, "lib:ui/ui-select-modern", 0.6), (T["trampa7"] - 0.05, "lib:ui/ui-select-modern", 0.6),
       (T["uno"] - 0.05, "lib:ui/switch-tap", 0.5), (T["dos"] - 0.05, "lib:ui/switch-tap", 0.5),
       (FIN - 1.2, "lib:ui/ui-message-pop", 0.5), (FIN - 0.5, "lib:ui/switch-click-quick", 0.7), (FIN - 0.35, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=92, style="upbeat", seed=23, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
