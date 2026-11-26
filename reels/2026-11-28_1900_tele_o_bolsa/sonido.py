"""Música baja (chill 96 bpm) + efectos sincronizados + voz de ElevenLabs (Juanjo Viral, ya recortada en voice.wav) para
«¿La tele del Black Friday o la bolsa?» (look R3 ilustración en plano de corte). Todo atado a timings.json."""
import json, re, subprocess, sys
sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json")); S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”«»]", "", w.lower())
st = lambda i: S[i]["start"]
def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]
T = dict(tele=pal(0, "tele"), mil0=pal(0, "mil", 1), ano=pal(1, "año"), pagaste=pal(1, "pagaste"), quin1=pal(1, "quinientos"),
         hoy1=pal(1, "hoy"), casi=pal(1, "casi"), metido=pal(2, "metido"), indice=pal(2, "índice"), quinientas=pal(2, "quinientas"),
         estados=pal(2, "estados"), serian=pal(2, "serían"), quin2=pal(2, "quinientos"), triple=pal(2, "triple"),
         ojo=pal(3, "ojo"), veintidos=pal(3, "veintidós"), veinticinco=pal(3, "veinticinco"),
         truco=pal(4, "truco"), preguntarte=pal(4, "preguntarte"), descuento=pal(4, "descuento"),
         comenta=pal(5, "comenta"), uno=pal(5, "uno"), dos=pal(5, "dos"))
FIN = S[-1]["start"] + S[-1]["dur"]
ev = [(0.0, "lib:transition/air-woosh-quick", 0.45), (0.1, "lib:ui/ui-message-pop", 0.45),
      (T["tele"], "lib:ui/ui-popup-dry", 0.35), (T["mil0"] - 0.05, "lib:impact/bass-hit-short", 0.6)]
ev += [(st(1) - 0.2, "lib:transition/swoosh-slow", 0.45), (T["pagaste"] - 0.1, "lib:ui/ui-popup-dry", 0.45),
       (T["quin1"] - 0.1, "lib:paper/paper-slide", 0.45)]
ev += [(T["ano"] + k * (T["hoy1"] - T["ano"]) / 10, "lib:counter/clock-tick-single", 0.25) for k in range(10)]   # el calendario pasa los años
ev += [(T["casi"] - 0.05, "lib:impact/hit-blow", 0.55), (T["casi"], "lib:glass/glass-hit-cine", 0.25)]
ev += [(st(2) - 0.2, "lib:transition/swoosh-quick", 0.45)]
ev += [(T["metido"] + 0.2 + i * 0.16, "lib:ui/ui-tone-quick", 0.16) for i in range(5)]                            # monedas al tubo
ev += [(T["metido"] + 1.0 + i * 0.16, "lib:mech/metal-drop-scifi-small", 0.2) for i in range(5)]                  # llegan al silo
ev += [(T["indice"] - 0.1, "lib:ui/ui-select-modern", 0.45)]
ev += [(T["quinientas"] - 0.15 + i * 0.12, "lib:ui/ui-select-click", 0.14) for i in range(7)]                     # se llenan las oficinas
ev += [(T["serian"] - 0.15, "lib:counter/clock-knob-spin", 0.45), (T["quin2"] + 0.35, "lib:ui/ui-success-soft", 0.55),
       (T["triple"] - 0.08, "lib:impact/impact-zoom-quick", 0.5), (T["triple"], "lib:light/sparkle-touch", 0.45)]
ev += [(st(3) - 0.2, "lib:transition/swoosh-slow", 0.45), (T["ojo"] - 0.05, "lib:ui/ui-notify-tech", 0.4),
       (T["veinticinco"] - 0.1, "lib:impact/hit-weak", 0.6)]
ev += [(st(4) - 0.2, "lib:transition/swoosh-quick", 0.45), (T["truco"] - 0.1, "lib:ui/ui-popup-dry", 0.45),
       (T["preguntarte"] - 0.05, "lib:ui/ui-message-pop", 0.45), (T["descuento"], "lib:light/sparkle-wand", 0.4)]
ev += [(st(5) - 0.2, "lib:transition/swoosh-slow", 0.45), (T["comenta"] - 0.05, "lib:ui/ui-message-pop", 0.45),
       (T["uno"] - 0.1, "lib:ui/ui-select-click", 0.6), (T["dos"] - 0.1, "lib:ui/ui-select-click", 0.6),
       (FIN - 1.2, "lib:ui/ui-message-pop", 0.5), (FIN - 0.5, "lib:ui/switch-click-quick", 0.7), (FIN - 0.35, "lib:ui/chime-crystal", 0.45)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=96, style="chill", seed=28, sfx_gain=0.26)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
