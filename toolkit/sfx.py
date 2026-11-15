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


def track(events, total_len):
    """events: lista de (segundo, nombre[, ganancia]). Devuelve pista mono a 44,1 kHz."""
    out = np.zeros(total_len)
    for ev in events:
        t0, name = ev[0], ev[1]
        g = ev[2] if len(ev) > 2 else 1.0
        s = SOUNDS[name]() * g
        i = int(max(t0, 0) * SR)
        if i >= total_len:
            continue
        j = min(total_len, i + len(s))
        out[i:j] += s[: j - i]
    return out
