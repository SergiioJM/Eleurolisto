"""Voz de ElevenLabs (Mateo, eleven_v4) -> voice.wav + timings.json con los tiempos EXACTOS de Scribe.
Acorta las pausas largas (> 0,3 s -> 0,22 s) y acelera (atempo, sin cambiar el tono) para dejarla en ~20 s (se quita la frase de la lección, que va en pantalla y en el texto)."""
import json, subprocess, sys, numpy as np, soundfile as sf

SRC, WJ = "/tmp/claude-0/voz1330_original.mp3", "/tmp/claude-0/words1330.json"
WORDS = json.load(open(WJ))
LEAD, TEMPO, KEEP, MIN = 0.20, float(sys.argv[1]) if len(sys.argv) > 1 else 1.15, 0.20, 0.27
VOZ = "ElevenLabs · Mateo (gpMzl7dbkfC9dIxAqQZT, eleven_v4)"
frases = [["El", "más."], ["La", "ciento."], ["Si", "noventa."], ["Y", "setecientos."], ["¿Y", "tuyo?"], ["Comenta:", "trabajando."], ["Porque", "vuelve."]]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", SRC, "-ac", "1", "-ar", "44100", "/tmp/claude-0/v_full.wav"], check=True)
QA, QB = 17.50, 22.28   # frase que se quita (lección: va en pantalla y en el texto)
xf, sr = sf.read("/tmp/claude-0/v_full.wav")
sf.write("/tmp/claude-0/v_raw.wav", np.concatenate([xf[:int(QA * sr)], xf[int(QB * sr):]]), sr)
WORDS = [dict(w, start=w["start"] - (QB - QA) * (w["start"] >= QB), end=w["end"] - (QB - QA) * (w["start"] >= QB)) for w in WORDS if not (QA <= w["start"] < QB)]
x, sr = sf.read("/tmp/claude-0/v_raw.wav")
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", "/tmp/claude-0/v_raw.wav", "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(l.split("silence_start: ")[1].split()[0]) for l in out.splitlines() if "silence_start" in l]
se = [float(l.split("silence_end: ")[1].split()[0]) for l in out.splitlines() if "silence_end" in l]
cortes = [(a + KEEP / 2, b - KEEP / 2) for a, b in zip(ss, se) if b - a > MIN]
piezas, pos = [], 0.0
for a, b in cortes:
    piezas.append(x[int(pos * sr):int(a * sr)]); pos = b
piezas.append(x[int(pos * sr):])
f = int(0.01 * sr)
for p in piezas:
    if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
y = np.concatenate([np.zeros(int(LEAD * TEMPO * sr))] + piezas + [np.zeros(int(0.9 * sr))])
sf.write("/tmp/claude-0/v_cut1330.wav", y, sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/claude-0/v_cut1330.wav", "-af", f"atempo={TEMPO}", "voice.wav"], check=True)
def mapa(t):
    q = t
    for a, b in cortes:
        if t >= b: q -= (b - a)
        elif t > a: q -= (t - a)
    return round((q + LEAD * TEMPO) / TEMPO, 3)
ws = [w for w in WORDS if w["type"] == "word"]
segs, i = [], 0
for k, (ini, fin) in enumerate(frases):
    j = i
    while ws[j]["text"] != fin: j += 1
    grupo = ws[i:j + 1]; i = j + 1
    assert grupo[0]["text"] == ini, (grupo[0]["text"], ini)
    st, en = mapa(grupo[0]["start"]), mapa(grupo[-1]["end"])
    segs.append({"i": k, "start": st, "dur": round(en - st, 3), "text": " ".join(w["text"] for w in grupo),
                 "words": [{"w": w["text"], "start": mapa(w["start"]), "end": mapa(w["end"])} for w in grupo]})
total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "voice.wav"], capture_output=True, text=True).stdout)
json.dump({"total": round(total, 3), "voz": VOZ, "segments": segs}, open("timings.json", "w"), ensure_ascii=False, indent=1)
for s in segs: print(f'{s["start"]:6.2f} +{s["dur"]:5.2f}  {s["text"][:70]}')
print("total", round(total, 2), "cortes", len(cortes))
