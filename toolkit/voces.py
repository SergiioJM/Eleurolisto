"""Voces en off en español de España (Piper es_ES, ejecutadas con onnxruntime).

Voces:
  v1 -> hombre A (davefx)      · la elegida por Sergio como principal
  v2 -> hombre B (sharvard M)
  v3 -> mujer   (sharvard F)

make(frases, carpeta, voz="v1") escribe voice.wav y timings.json (inicio y duración de cada frase).
Consejo: escribe los números con letras en el guion ("mil quinientos euros"), suena más natural.
"""
import json
import os

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx.tokenizer import Tokenizer

MODELS = os.environ.get("EUROLISTO_MODELS", "/home/claude/tts_models")
VOCES = {
    "v1": ("es_ES-davefx-medium", 0),
    "v2": ("es_ES-sharvard-medium", 0),
    "v3": ("es_ES-sharvard-medium", 1),
}
_tok, _sess = None, {}


def phonemize(text):
    global _tok
    if _tok is None:
        _tok = Tokenizer()
    return _tok.phonemize(text, "es")  # 'es' = castellano (distinción z/c)


def synth(text, voz="v1", length_scale=0.92, noise_scale=0.667, noise_w=0.8):
    model, sid = VOCES[voz]
    d = f"{MODELS}/vits-piper-{model}"
    cfg = json.load(open(f"{d}/{model}.onnx.json"))
    if model not in _sess:
        _sess[model] = ort.InferenceSession(f"{d}/{model}.onnx", providers=["CPUExecutionProvider"])
    s = _sess[model]
    idmap = cfg["phoneme_id_map"]
    ids = list(idmap["^"])
    for ph in phonemize(text):
        if ph in idmap:
            ids += idmap[ph] + idmap["_"]
    ids += idmap["$"]
    feeds = {
        "input": np.array([ids], dtype=np.int64),
        "input_lengths": np.array([len(ids)], dtype=np.int64),
        "scales": np.array([noise_scale, length_scale, noise_w], dtype=np.float32),
    }
    if any(i.name == "sid" for i in s.get_inputs()):
        feeds["sid"] = np.array([sid], dtype=np.int64)
    return s.run(None, feeds)[0].squeeze().astype(np.float32), cfg["audio"]["sample_rate"]


def make(frases, carpeta, voz="v1", lead=0.35, gap=0.30, tail=0.9, length_scale=0.92):
    track, timings, t, sr = [], [], lead, None
    for i, text in enumerate(frases):
        x, sr = synth(text, voz, length_scale=length_scale)
        nz = np.where(np.abs(x) > 0.01 * np.max(np.abs(x)))[0]
        x = x[max(nz[0] - 300, 0): nz[-1] + 600]
        if not track:
            track.append(np.zeros(int(lead * sr), dtype=np.float32))
        dur = len(x) / sr
        timings.append({"i": i, "start": round(t, 3), "dur": round(dur, 3), "text": text})
        track.append(x)
        t += dur
        g = tail if i == len(frases) - 1 else gap
        track.append(np.zeros(int(g * sr), dtype=np.float32))
        t += g
    voice = np.concatenate(track)
    voice = voice / np.max(np.abs(voice)) * 0.89
    sf.write(f"{carpeta}/voice.wav", voice, sr)
    total = len(voice) / sr
    json.dump({"total": round(total, 3), "voz": voz, "segments": timings},
              open(f"{carpeta}/timings.json", "w"), ensure_ascii=False, indent=1)
    for s in timings:
        print(f'{s["start"]:6.2f} +{s["dur"]:5.2f}  {s["text"][:60]}')
    print("total", round(total, 2))
    return total
