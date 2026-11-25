"""Voz de ElevenLabs (Lucía, eleven_v4) en una toma: acorta las pausas largas entre palabras con los tiempos EXACTOS de
Scribe (hueco > 0,22 s -> 0,16 s) y acelera un poco (atempo, sin cambiar el tono) -> voice.wav + timings.json."""
import json, re, subprocess, sys, numpy as np, soundfile as sf
TEMPO = float(sys.argv[1]) if len(sys.argv) > 1 else 1.16
LEAD, MAXGAP, KEEP = 0.12, 0.22, 0.16
VOZ = "ElevenLabs · Lucía (s4NXWwstm4IwAI2dMQ6M, eleven_v4)"
L = lambda w: re.sub(r"[^a-z0-9áéíóúüñ]", "", w.lower())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "voz_original.mp3", "-ac", "1", "-ar", "44100", "/tmp/claude-0/_v.wav"], check=True)
x, sr = sf.read("/tmp/claude-0/_v.wav"); ws = [w for w in json.load(open("words.json"))["words"] if w["type"] == "word"]
a0 = max(0, ws[0]["start"] - 0.05); x = x[int(a0 * sr):int(min(len(x) / sr, ws[-1]["end"] + 0.25) * sr)]
ws = [dict(w, start=w["start"] - a0, end=w["end"] - a0) for w in ws]
cortes = [(p["end"] + KEEP / 2, n["start"] - KEEP / 2) for p, n in zip(ws, ws[1:]) if n["start"] - p["end"] > MAXGAP]
piezas, pos = [], 0.0
for a, b in cortes: piezas.append(x[int(pos * sr):int(a * sr)]); pos = b
piezas.append(x[int(pos * sr):]); f = int(0.008 * sr)
for p in piezas:
    if len(p) > 2 * f: p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
y = np.concatenate([np.zeros(int(LEAD * TEMPO * sr))] + piezas + [np.zeros(int(0.9 * TEMPO * sr))])
sf.write("/tmp/claude-0/v1900pe_cut.wav", y, sr)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "/tmp/claude-0/v1900pe_cut.wav", "-af", f"atempo={TEMPO}", "voice.wav"], check=True)
def mapa(t):
    q = t
    for a, b in cortes:
        if t >= b: q -= (b - a)
        elif t > a: q -= (t - a)
    return round((q + LEAD * TEMPO) / TEMPO, 3)
frases = [["la", "empresa"], ["si", "mes"], ["en", "diciembre"], ["es", "siempre"], ["con", "nómina"], ["tú", "dos"]]
segs, i = [], 0
for k, (ini, fin) in enumerate(frases):
    while L(ws[i]["text"]) != ini: i += 1
    j = i
    while L(ws[j]["text"]) != fin: j += 1
    g = ws[i:j + 1]; i = j + 1; st, en = mapa(g[0]["start"]), mapa(g[-1]["end"])
    segs.append({"i": k, "start": st, "dur": round(en - st, 3), "text": " ".join(w["text"] for w in g), "words": [{"w": w["text"], "start": mapa(w["start"]), "end": mapa(w["end"])} for w in g]})
total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "voice.wav"], capture_output=True, text=True).stdout)
json.dump({"total": round(total, 3), "voz": VOZ, "fuente_tiempos": "ElevenLabs Scribe (tiempos exactos por palabra)", "segments": segs}, open("timings.json", "w"), ensure_ascii=False, indent=1)
for s in segs: print(f'{s["start"]:6.2f} +{s["dur"]:5.2f}  {s["text"][:70]}')
print("total", round(total, 2), "cortes", len(cortes))
