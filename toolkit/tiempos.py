"""Estimación de tiempos (frase y palabra) para una voz externa (p. ej. Javier de Madrid de Creative Claw).

No tenemos acceso a las marcas de tiempo de la voz premium, así que:
  1. sintetizamos cada frase y cada palabra con la voz local (Piper) para medir pesos relativos,
  2. montamos una línea temporal con pausas típicas,
  3. la escalamos a la duración real de la voz premium (la da `transcribe`).

estimar(frases, total_real, lead=0.1, tail=0.25) -> {"total", "segments":[{"start","dur","text","words":[{"w","start","end"}]}]}
"""
import re

import numpy as np

from voces import synth


def _dur(text, voz="v2"):
    x, sr = synth(text, voz, length_scale=0.92)
    a = np.abs(x)
    nz = np.where(a > 0.02 * a.max())[0]
    return (nz[-1] - nz[0]) / sr if len(nz) else 0.1


def estimar(frases, total_real, lead=0.1, tail=0.25, gap=0.28, pausa_interna=0.35, voz="v2"):
    plan, t = [], lead
    for i, fr in enumerate(frases):
        partes = [p.strip() for p in re.split(r"(?<=[…\.\?\!:])\s+", fr) if p.strip()]
        seg = {"text": fr, "start": t, "words": []}
        for j, p in enumerate(partes):
            d = _dur(p, voz)
            palabras = p.split()
            pesos = np.array([max(_dur(re.sub(r"[¿¡…\.,\?\!:]", "", w) or w, voz), 0.08) for w in palabras])
            pesos = pesos / pesos.sum() * d
            tw = t
            for w, pw in zip(palabras, pesos):
                seg["words"].append({"w": w, "start": tw, "end": tw + pw})
                tw += pw
            t += d
            if j < len(partes) - 1:
                t += pausa_interna
        seg["dur"] = t - seg["start"]
        plan.append(seg)
        if i < len(frases) - 1:
            t += gap
    t += tail
    k = total_real / t
    r = lambda v: round(v * k, 3)
    for s in plan:
        s["start"], s["dur"] = r(s["start"]), r(s["dur"])
        for w in s["words"]:
            w["start"], w["end"] = r(w["start"]), r(w["end"])
    return {"total": round(total_real, 3), "escala": round(k, 3), "segments": plan}
