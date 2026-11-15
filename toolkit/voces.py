"""Voces en off en español de España (Piper es_ES, ejecutadas con onnxruntime).

Voces (comparativa enviada a Sergio el 16-nov; "Hombre 1..4", "Mujer 1..2"):
  v1      -> Hombre 1 (Piper davefx)
  v2      -> Hombre 2 (Piper sharvard M)
  k_alex  -> Hombre 3 (Kokoro em_alex, fonemas castellanos)
  k_santa -> Hombre 4 (Kokoro em_santa)
  v3      -> Mujer 1  (Piper sharvard F)
  k_dora  -> Mujer 2  (Kokoro ef_dora)

make(frases, carpeta, voz="v1") escribe voice.wav y timings.json (inicio y duración de cada frase).
Consejo: escribe los números con letras en el guion ("mil quinientos euros"), suena más natural.
"""
import json
import os
import re

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
KOKORO = {"k_alex": "em_alex", "k_santa": "em_santa", "k_dora": "ef_dora"}
_kok = None
_tok, _sess = None, {}


def phonemize(text):
    global _tok
    if _tok is None:
        _tok = Tokenizer()
    return _tok.phonemize(text, "es")  # 'es' = castellano (distinción z/c)


def synth(text, voz="v1", length_scale=0.92, noise_scale=0.667, noise_w=0.8):
    if voz in KOKORO:
        global _kok
        if _kok is None:
            from kokoro_onnx import Kokoro
            _kok = Kokoro(f"{MODELS}/kokoro-v1.0.int8.onnx", f"{MODELS}/voices-v1.0.bin")
        x, sr = _kok.create(text, voice=KOKORO[voz], speed=round(0.92 / length_scale, 2), lang="es")
        return np.asarray(x, dtype=np.float32), sr
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
        palabras = text.split()
        pesos = []
        for w in palabras:
            y, ysr = synth(re.sub(r"[¿¡…\.,\?\!:]", "", w) or w, "v2")
            a = np.abs(y); nzw = np.where(a > 0.02 * a.max())[0]
            pesos.append(max((nzw[-1] - nzw[0]) / ysr if len(nzw) else 0.1, 0.08))
        pesos = np.array(pesos) / sum(pesos) * dur
        words, tw = [], t
        for w, pw in zip(palabras, pesos):
            words.append({"w": w, "start": round(tw, 3), "end": round(tw + pw, 3)})
            tw += pw
        timings.append({"i": i, "start": round(t, 3), "dur": round(dur, 3), "text": text, "words": words})
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
