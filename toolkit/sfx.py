"""Efectos de sonido sintetizados (originales, sin licencias): whoosh, pop, ding (caja registradora), tick, thud.
Se mezclan con Reel.render(..., sfx=[(segundo, "pop"), ...]) y auto_sfx añade un whoosh en cada corte."""
import numpy as np

SR = 44100
_rng = np.random.default_rng(7)


def _lp(x, cutoff):
    from scipy.signal import lfilter
    a = np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def whoosh(dur=0.38):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    noise = _rng.standard_normal(n)
    # barrido: mezcla de un paso bajo cada vez más abierto
    low = _lp(noise, 600)
    high = noise - _lp(noise, 2500)
    body = low * (1 - t) + _lp(high, 7000) * t
    env = np.sin(np.pi * t) ** 1.6
    return body * env * 0.9


def pop(dur=0.09, f0=900, f1=350):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 60)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 45) * 0.8


def ding(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * 1318.5 * t) + 0.6 * np.sin(2 * np.pi * 1975.5 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t))
    s *= np.exp(-t * 6)
    d = int(0.075 * SR)
    out = s.copy()
    out[d:] += s[:-d] * 0.7
    return out * 0.35


def tick(dur=0.025):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 220) * 0.5


def thud(dur=0.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) * 0.9


SOUNDS = {"whoosh": whoosh, "pop": pop, "ding": ding, "tick": tick, "thud": thud}

# ---- Biblioteca de efectos reales (plugin video-shotcraft, Mixkit SFX Free License: uso comercial sin atribución) ----
# Se usan desde la carpeta del plugin, nunca se copian a este repo (es público y la licencia no permite redistribuirlos).
# Evento "lib:<categoría>/<archivo>", p. ej. (2.3, "lib:impact/bass-hit-short", 0.8). Si el plugin no está, cae al sintético.
_LIB_FALLBACK = {"transition": "whoosh", "impact": "thud", "ui": "pop", "counter": "tick", "light": "ding", "paper": "whoosh",
                 "data": "tick", "camera": "tick", "text": "tick", "riser": "whoosh"}
# Sin origen comprobado en ATTRIBUTION.md del plugin: no usar.
_LIB_VETADOS = {"keyboard", "pop", "riser-cine", "sparkle", "whoosh-big"}
_lib_cache = {}


def lib_dir():
    import glob
    import os
    for pat in (os.path.expanduser("~/.claude/plugins/**/assets/audio/sfx"), "/root/.claude/plugins/**/assets/audio/sfx"):
        hits = [h for h in glob.glob(pat, recursive=True) if os.path.isdir(os.path.join(h, "impact"))]
        if hits:
            return hits[0]
    return None


def lib_sound(name):
    """name = 'categoría/archivo' (sin .mp3). Devuelve np.array mono a 44,1 kHz o None."""
    import os
    import subprocess
    if name in _lib_cache:
        return _lib_cache[name]
    base = lib_dir()
    arch = name.split("/")[-1]
    path = os.path.join(base, name + ".mp3") if base else None
    if not path or not os.path.exists(path) or arch in _LIB_VETADOS:
        _lib_cache[name] = None
        return None
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
    x = x / max(1e-6, np.max(np.abs(x))) * 0.8  # mismo nivel de pico que los sintéticos
    _lib_cache[name] = x
    return x


def lib_list():
    """Lista {categoría: [archivos]} disponible ahora mismo (para elegir efectos)."""
    import os
    base = lib_dir()
    if not base:
        return {}
    return {c: sorted(f[:-4] for f in os.listdir(os.path.join(base, c)) if f.endswith(".mp3") and f[:-4] not in _LIB_VETADOS)
            for c in sorted(os.listdir(base)) if os.path.isdir(os.path.join(base, c))}


def track(events, total_len):
    """events: lista de (segundo, nombre[, ganancia]). Devuelve pista mono a 44,1 kHz."""
    out = np.zeros(total_len)
    for ev in events:
        t0, name = ev[0], ev[1]
        g = ev[2] if len(ev) > 2 else 1.0
        if name.startswith("lib:"):
            x = lib_sound(name[4:])
            s = (x if x is not None else SOUNDS[_LIB_FALLBACK.get(name[4:].split("/")[0], "pop")]()) * g
        else:
            s = SOUNDS[name]() * g
        i = int(max(t0, 0) * SR)
        if i >= total_len:
            continue
        j = min(total_len, i + len(s))
        out[i:j] += s[: j - i]
    return out
