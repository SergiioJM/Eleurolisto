"""Música baja (upbeat 108 bpm) + efectos sincronizados + voz de ElevenLabs (Lucía, ya recortada en voice.wav) para
«La paga extra no es un regalo» (look R11 plano técnico). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”«»]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(regalo=pal(0, "regalo"), empresa=pal(0, "empresa"),
         doce=pal(1, "doce"), setecientos=pal(1, "setecientos"),
         catorce=pal(2, "catorce"), quitan=pal(2, "quitan"), devuelven=pal(2, "devuelven"), junio=pal(2, "junio"), diciembre=pal(2, "diciembre"),
         plazos=pal(3, "plazos"), limpia=pal(3, "limpia"), mes=pal(3, "mes"), pagaste=pal(3, "pagaste"), irpf=pal(3, "irpf"),
         ciento=pal(4, "ciento"), trescientos=pal(4, "trescientos"), doscientos=pal(4, "doscientos"), nomina=pal(4, "nómina"),
         catorce5=pal(5, "catorce"), comenta=pal(5, "comenta"), uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/air-woosh-quick", 0.45), (0.08, "lib:paper/paper-staple", 0.4),
      (T["regalo"] - 0.1, "lib:transition/whoosh-swirl", 0.45), (T["regalo"] + 0.15, "lib:ui/ui-popup-dry", 0.5),
      (T["empresa"] - 0.02, "lib:impact/hit-weak", 0.7), (T["empresa"] + 0.02, "lib:paper/paper-staple", 0.6)]
ev += [(st(1) - 0.2, "lib:transition/swoosh-slow", 0.5)]
ev += [(T["doce"] - 0.25 + m * 0.045, "lib:ui/ui-select-click", 0.18) for m in range(0, 12, 2)]          # las barras se dibujan
ev += [(T["setecientos"] - 0.15, "lib:ui/ui-success-soft", 0.5)]
ev += [(T["catorce"] - 0.12, "lib:impact/impact-zoom-quick", 0.55), (T["catorce"] + 0.05, "lib:transition/wind-woosh-throw", 0.35),
       (T["quitan"] - 0.05, "lib:impact/bass-hit-short", 0.6)]
ev += [((T["junio"] if k < 6 else T["diciembre"]) - 0.4 + (k % 6) * 0.08 + 0.5, "lib:mech/metal-drop-scifi-small", 0.22) for k in range(12)]  # los trozos aterrizan
ev += [(T["junio"] + 0.15, "lib:light/sparkle-touch", 0.45), (T["diciembre"] + 0.15, "lib:light/sparkle-touch", 0.45)]
ev += [(T["plazos"] - 0.1, "lib:impact/hit-blow", 0.6), (T["plazos"] - 0.05, "lib:paper/paper-staple", 0.6),
       (T["limpia"] - 0.05, "lib:light/shimmer-sparkle-sweep", 0.4)]
ev += [(T["mes"] - 0.35 + m * 0.09, "lib:ui/ui-tone-quick", 0.16) for m in range(0, 12, 3)]
ev += [(T["pagaste"] + 0.25, "lib:ui/ui-confirm-tone", 0.45), (T["irpf"] - 0.15, "lib:ui/ui-select-modern", 0.45)]
ev += [(st(4) - 0.25, "lib:transition/swoosh-quick", 0.45), (T["ciento"] - 0.2, "lib:ui/ui-popup-dry", 0.45),
       (T["trescientos"] - 0.15, "lib:counter/clock-knob-spin", 0.4), (T["trescientos"] + 0.55, "lib:ui/ui-success-soft", 0.55),
       (T["doscientos"] - 0.15, "lib:counter/clock-knob-spin", 0.35), (T["nomina"] - 0.05, "lib:light/sparkle-wand", 0.5)]
ev += [(st(5) - 0.2, "lib:transition/swoosh-slow", 0.45), (st(5), "lib:ui/ui-message-pop", 0.5), (T["catorce5"] - 0.15, "lib:ui/ui-popup-dry", 0.5),
       (T["uno"] - 0.05, "lib:ui/ui-select-click", 0.6), (T["dos"] - 0.05, "lib:ui/ui-select-click", 0.6),
       (FIN - 1.2, "lib:ui/ui-message-pop", 0.5), (FIN - 0.5, "lib:ui/switch-click-quick", 0.7), (FIN - 0.35, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=108, style="upbeat", seed=11, sfx_gain=0.26)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
