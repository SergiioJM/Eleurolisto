"""Voz de ElevenLabs (Juanjo TikTok, eleven_v4) -> voice.wav + timings.json con los tiempos EXACTOS de Scribe.
Acorta las pausas largas (> 0,3 s -> 0,22 s) y acelera un 6 % (atempo, sin cambiar el tono) para dejarla en ~34 s."""
import json, subprocess, numpy as np, soundfile as sf

SRC = "/tmp/claude-0/voz2030_original.mp3"
WORDS = json.load(open("/tmp/claude-0/words2030.json"))     # palabras de Scribe (inicio/fin en s)
LEAD, TEMPO, KEEP, MIN = 0.20, 1.06, 0.22, 0.30
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", SRC, "-ac", "1", "-ar", "44100", "/tmp/claude-0/v_raw.wav"], check=True)
x, sr = sf.read("/tmp/claude-0/v_raw.wav")
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", "/tmp/claude-0/v_raw.wav", "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(l.split("silence_start: ")[1].split()[0]) for l in out.splitlines() if "silence_start" in l]
se = [float(l.split("silence_end: ")[1].split()[0]) for l in out.splitlines() if "silence_end" in l]
cortes = [(a + KEEP / 2, b - KEEP / 2) for a, b in zip(ss, se) if b - a > MIN]   # tramos que se quitan
piezas, pos = [], 0.0
for a, b in cortes:
    piezas.append(x[int(pos * sr):int(a * sr)]); pos = b
piezas.append(x[int(pos * sr):])
f = int(0.01 * sr)  # microfundido para que no haya clics
for p in piezas:
    if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
y = np.concatenate([np.zeros(int(LEAD * TEMPO * sr))] + piezas + [np.zeros(int(0.9 * sr))])
sf.write("/tmp/claude-0/v_cut.wav", y, sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/claude-0/v_cut.wav", "-af", f"atempo={TEMPO}", "voice.wav"], check=True)
def mapa(t):  # tiempo original -> tiempo final
    q = t
    for a, b in cortes:
        if t >= b: q -= (b - a)
        elif t > a: q -= (t - a)
    return round((q + LEAD * TEMPO) / TEMPO, 3)
frases = [["Bitcoin", "máximo."], ["¿Burbuja", "digital?"], ["Los", "veintidós."], ["Los", "Street."], ["El", "ochenta."], ["Y", "mitad."], ["¿Tú", "digital."]]
ws = [w for w in WORDS if w["type"] == "word"]
segs, i = [], 0
for k, (ini, fin) in enumerate(frases):
    j = i
    while ws[j]["text"] != fin: j += 1
    grupo = ws[i:j + 1]; i = j + 1
    st, en = mapa(grupo[0]["start"]), mapa(grupo[-1]["end"])
    segs.append({"i": k, "start": st, "dur": round(en - st, 3), "text": " ".join(w["text"] for w in grupo),
                 "words": [{"w": w["text"], "start": mapa(w["start"]), "end": mapa(w["end"])} for w in grupo]})
total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "voice.wav"], capture_output=True, text=True).stdout)
json.dump({"total": round(total, 3), "voz": "ElevenLabs · Juanjo TikTok (30jLfQdV8RTduXvosh02, eleven_v4)", "segments": segs}, open("timings.json", "w"), ensure_ascii=False, indent=1)
for s in segs: print(f'{s["start"]:6.2f} +{s["dur"]:5.2f}  {s["text"][:70]}')
print("total", round(total, 2), "cortes", len(cortes))
