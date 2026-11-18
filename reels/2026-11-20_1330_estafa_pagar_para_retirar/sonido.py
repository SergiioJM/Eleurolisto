"""Música baja (upbeat, 118 bpm, tensión) + efectos sincronizados + voz local v1 (Hombre 1) para el reel
"¿Te piden pagar para sacar tu dinero?" (R4 móviles en abanico). Todo atado a timings.json."""
import json
import re
import subprocess
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
limpia = lambda w: re.sub(r"[¿?¡!.,:;…“”]", "", w.lower())
st = lambda i: S[i]["start"]


def pal(i, f, n=0):
    ws = [w["start"] for w in S[i]["words"] if limpia(w["w"]) == f]
    return ws[n] if len(ws) > n else ws[0]


T = dict(pagar=pal(0, "pagar"), estafa=pal(0, "estafa"), guion=st(1), famoso=pal(1, "famoso"), asesor=pal(1, "asesor"),
         prisas=pal(1, "prisas"), app=pal(1, "app"), ganas=pal(1, "ganas"), tres=pal(1, "trescientos"), cien=pal(1, "cien"),
         pides=st(2), retir=pal(2, "retirarlo"), impuestos=pal(2, "impuestos"), adel=pal(2, "adelantado"),
         luego=st(3), cnmv=pal(3, "cnmv"), segunda=pal(3, "segunda"), nunca=pal(3, "nunca"), cta=st(4))
ev = [(0.0, "lib:transition/air-woosh-quick", 0.6), (0.35, "lib:transition/whoosh-fast", 0.5),       # se abre el abanico, cae Listo
      (0.62, "lib:impact/hit-weak", 0.6),
      (T["estafa"] - 0.05, "lib:impact/bass-hit-short", 1.0), (T["estafa"] - 0.02, "lib:paper/paper-staple", 0.7),   # sello ESTAFA
      (T["guion"] - 0.12, "lib:transition/swoosh-quick", 0.6), (T["famoso"] + 0.15, "lib:ui/ui-popup-dry", 0.7),
      (T["asesor"] - 0.25, "lib:transition/swoosh-quick", 0.55), (T["asesor"] + 0.05, "lib:ui/ui-message-pop", 0.7),
      (T["prisas"] - 0.05, "lib:ui/ui-message-pop", 0.7), (T["app"] - 0.35, "lib:ui/ui-message-pop", 0.6),
      (T["app"] - 0.25, "lib:transition/swoosh-quick", 0.55)]
ev += [(T["ganas"] - 0.1 + k * 0.12, "lib:counter/clock-tick-single", 0.35) for k in range(int((T["cien"] + 0.3 - T["ganas"]) / 0.12))]
ev += [(T["tres"] - 0.05, "lib:impact/impact-zoom-quick", 0.9), (T["tres"] + 0.25, "lib:ui/ui-success-soft", 0.5),
       (T["retir"] + 0.05, "lib:ui/switch-tap", 0.8), (T["pides"] + 0.25, "lib:transition/swoosh-quick", 0.55),
       (T["impuestos"] - 0.45, "lib:ui/ui-notify-tech", 0.7), (T["impuestos"] - 0.1, "lib:transition/sweep-fast-small", 0.6),
       (T["adel"] - 0.2, "lib:impact/hit-weak", 0.7),                                                          # le cae el gorro roto
       (T["luego"] + 0.1, "lib:transition/swoosh-quick", 0.5)]
ev += [(T["luego"] + 0.4 + k * 0.9, "lib:ui/ui-tone-quick", 0.45) for k in range(3)]                          # tono de llamada
ev += [(T["segunda"] - 0.05, "lib:impact/bass-hit-short", 1.0), (T["segunda"] - 0.02, "lib:paper/paper-staple", 0.7),
       (T["nunca"] - 0.25, "lib:text/marker-pen-line", 0.7), (T["nunca"] - 0.2, "lib:ui/ui-confirm-tone", 0.6),
       (T["cta"], "lib:transition/swoosh-slow", 0.5), (T["cta"] + 0.1, "lib:ui/ui-message-pop", 0.8),
       (T["cta"] + 0.75, "lib:ui/chime-crystal", 0.55)]

mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=118, style="upbeat", seed=11, sfx_gain=0.24)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
