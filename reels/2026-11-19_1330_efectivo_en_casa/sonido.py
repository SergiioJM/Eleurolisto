"""Música chiptune baja + efectos + voz local (k_santa) para el reel del efectivo en casa (R6 pixel art).
Mismos tiempos que escena.html (todo atado a timings.json)."""
import json
import subprocess
import sys

sys.path.insert(0, "../../toolkit/escena3d")
from audio import mezclar

TIM = json.load(open("timings.json"))
S = TIM["segments"]
st = lambda i: S[i]["start"]
pal = lambda i, f: next((w["start"] for w in S[i]["words"] if f in w["w"].lower()), S[i]["words"][0]["start"])

tPeek, tFlut, tSafe = pal(0, "efectivo") - 0.05, pal(0, "guardar") - 0.1, pal(0, "casa") - 0.05
tRain, tLim, tLegal = st(1) - 0.05, pal(1, "límite"), pal(1, "legal")
tPan1, tPiensa, tNom, tFac, tCheck = st(2) - 0.3, pal(2, "tienes"), pal(2, "demostrar"), pal(2, "dónde"), pal(2, "sale")
tPan2, tEmp, tAut, t999, tMil, tBack = st(3) - 0.32, pal(3, "empresa"), pal(3, "autónomo"), pal(3, "siempre"), pal(3, "mil"), pal(3, "efectivo")
tPan3, tIng, tSac, tTres, tBan, tCom, tHac = st(4) - 0.32, pal(4, "ingresas"), pal(4, "sacas"), pal(4, "tres"), pal(4, "banco"), pal(4, "comunica"), pal(4, "hacienda")
tCTA, tGuar, tListo = st(5) - 0.15, pal(5, "guárdalo"), pal(5, "listo")

ev = []
# tecleo suave de la caja de diálogo: un golpecito por palabra (muy bajo)
for s in S:
    for w in s["words"]:
        ev.append((w["start"], "lib:text/typewriter-hit-soft", 0.10))
# casa
ev += [(0.02, "lib:ui/ui-message-pop", 0.6), (tPeek, "lib:paper/paper-slide", 0.7), (tFlut, "lib:paper/paper-move-quick", 0.5),
       (tSafe, "lib:mech/gear-lock-metallic", 0.7), (tSafe + 0.2, "lib:mech/door-open-futuristic", 0.35)]
ev += [(tRain + k * 0.36, "lib:paper/paper-slide", 0.28) for k in range(5)]
ev += [(tLim, "lib:data/power-up-electronic", 0.55), (tLegal + 0.12, "lib:impact/hit-weak", 0.8)]
# papeles
ev += [(tPan1, "lib:transition/swoosh-quick", 0.5), (tPiensa, "lib:ui/ui-popup-dry", 0.6),
       (tNom + 0.1, "lib:paper/paper-staple", 0.7), (tFac + 0.1, "lib:paper/paper-staple", 0.7), (tCheck, "lib:ui/ui-success-soft", 0.8)]
# tienda
ev += [(tPan2, "lib:transition/swoosh-quick", 0.5), (tEmp, "lib:ui/ui-message-pop", 0.7), (tAut, "lib:transition/whoosh-fast", 0.45),
       (t999 + 0.3, "lib:paper/paper-slide", 0.6), (t999 + 0.45, "lib:ui/ui-confirm-tone", 0.6),
       (tMil + 0.3, "lib:impact/bass-hit-short", 0.95), (tBack + 0.05, "lib:paper/paper-move-quick", 0.6)]
# banco y hacienda
ev += [(tPan3, "lib:transition/swoosh-quick", 0.5), (tIng + 0.15, "lib:mech/machine-activate-short", 0.5), (tSac + 0.05, "lib:paper/paper-slide", 0.6),
       (tTres, "lib:impact/bass-hit-short", 1.0), (tBan, "lib:ui/ui-notify-tech", 0.6), (tCom, "lib:paper/paper-wind-blow", 0.6),
       (tHac - 0.05, "lib:mech/mech-tech-movement", 0.5)]
# menú final
ev += [(tCTA, "lib:ui/ui-popup-dry", 0.7), (tGuar, "lib:ui/ui-select-click", 0.6), (tListo + 0.15, "lib:ui/ui-option-select", 0.6),
       (tListo + 0.4, "lib:ui/chime-crystal", 0.6)]

mezclar("video_render.mp4", "video_sin_voz.mp4", TIM, ev, bpm=128, style="chip", seed=4, sfx_gain=0.2)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video_sin_voz.mp4", "-i", "voice.wav", "-filter_complex",
                "[1:a]aresample=44100,volume=1.0[v];[0:a][v]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "video.mp4"], check=True)
print("ok", len(ev), "efectos")
