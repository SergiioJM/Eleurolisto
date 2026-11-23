"""Mete pausas antes de ciertas frases (para que los sellos y el tique respiren) y acelera un poco (atempo, sin cambiar el tono).
Lee voice_raw.wav + timings_raw.json (de voz.py) y escribe voice.wav + timings.json."""
import json, subprocess, numpy as np, soundfile as sf
PAUSA = {2: 0.30, 5: 0.40}   # segundos extra ANTES de la frase i
TEMPO = 1.06
x, sr = sf.read("voice_raw.wav"); T = json.load(open("timings_raw.json"))
segs = T["segments"]; cortes = []
for i, d in PAUSA.items(): cortes.append((segs[i]["start"] - 0.08, d))
cortes.sort(); piezas, pos, add = [], 0, 0
for t0, d in cortes:
    piezas += [x[int(pos * sr):int(t0 * sr)], np.zeros(int(d * sr))]; pos = t0
piezas.append(x[int(pos * sr):]); sf.write("voice_tmp.wav", np.concatenate(piezas), sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "voice_tmp.wav", "-af", f"atempo={TEMPO}", "voice.wav"], check=True)
def m(t):
    sh = sum(d for t0, d in cortes if t >= t0)
    return round((t + sh) / TEMPO, 3)
for s in segs:
    st0 = s["start"]; s["start"] = m(st0); s["dur"] = round(m(st0 + s["dur"]) - s["start"], 3)
    for w in s["words"]: w["start"], w["end"] = m(w["start"]), m(w["end"])
T["total"] = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "voice.wav"], capture_output=True, text=True).stdout)
json.dump(T, open("timings.json", "w"), ensure_ascii=False, indent=1)
for s in segs: print(f'{s["start"]:6.2f} +{s["dur"]:5.2f}  {s["text"][:60]}')
print("total", round(T["total"], 2))
