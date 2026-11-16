"""Música baja + efectos + voz local (v1) para el reel del Bizum (mismos tiempos que escena.html)."""
import json
import subprocess
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])
tChat, tB1, tB2 = st(1) - 0.25, pal(1, "enviado") - 0.2, pal(1, "pide") - 0.15
tSol, tSolW, tAcepta, tPagas = st(2) - 0.1, pal(2, "solicitud"), pal(2, "aceptas") - 0.15, pal(2, "pagas")
tBanco, tCTA = st(3) - 0.15, st(4) - 0.1
ev = [(0.02, "whoosh", 0.7), (0.25, "ding", 0.7), (pal(0, "nada") - 0.1, "pop", 0.7)]
ev += [(tChat, "whoosh", 0.7), (tB1, "pop", 0.6), (tB2, "pop", 0.6)]
ev += [(tSol, "whoosh", 0.6), (tSol + 0.15, "pop", 0.6), (tSolW, "tick", 0.8), (tSolW + 0.15, "tick", 0.8)]
ev += [(tAcepta + 0.05, "tick", 1.0), (tAcepta + 0.3, "thud", 0.9), (tPagas - 0.03, "thud", 1.3)]
ev += [(tBanco, "whoosh", 0.7)] + [(tBanco + 0.35 + i * 0.45, "tick", 0.6) for i in range(5)]
ev += [(tCTA + 0.05, "pop", 0.8), (tCTA + 0.23, "pop", 0.8)]
mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=110, style="upbeat", seed=11)
# voz local encima (empieza en 0, los tiempos de timings.json ya son absolutos) + normalizar a -14 LUFS
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
