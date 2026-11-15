"""Música de fondo original sintetizada (instrumental, sin derechos de terceros).

Uso: python3 music.py SALIDA.wav DURACION_S [bpm] [estilo]
estilo: 'upbeat' (por defecto) o 'chill'
"""
import sys
import numpy as np
import soundfile as sf

SR = 44100


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    # filtro de un polo vectorizado por bloques (lfilter sin scipy)
    from itertools import accumulate  # noqa: F401  (mantener simple)
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def lp(x, cutoff):
    try:
        from scipy.signal import lfilter
        a = np.exp(-2 * np.pi * cutoff / SR)
        return lfilter([1 - a], [1, -a], x)
    except ImportError:
        return onepole_lp(x, cutoff)


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def tri(f, t):
    return 2 * np.abs(2 * ((f * t) % 1.0) - 1) - 1


def env_adsr(n, a, d, s, r):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na, nd = min(na, n), min(nd, max(n - na, 0))
    e[:na] = np.linspace(0, 1, na, endpoint=False)
    e[na:na + nd] = np.linspace(1, s, nd, endpoint=False)
    if nr and n > nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def render(duration, bpm=100, style="upbeat", seed=1):
    rng = np.random.default_rng(seed)
    beat = 60 / bpm
    bar = 4 * beat
    n = int(duration * SR)
    out = np.zeros(n)
    pad = np.zeros(n)
    bass = np.zeros(n)
    arp = np.zeros(n)
    drums = np.zeros(n)
    duck = np.ones(n)

    # Progresiones (voicings cerrados en Do); seed elige progresión y tonalidad para variar entre reels
    progs = [
        ([[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67]], [45, 41, 48, 43]),  # vi IV I V
        ([[48, 55, 60, 64], [55, 59, 62, 67], [57, 60, 64, 67], [53, 57, 60, 64]], [48, 43, 45, 41]),  # I V vi IV
        ([[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64], [57, 60, 64, 67]], [41, 43, 40, 45]),  # IV V iii vi
    ]
    base_prog, base_roots = progs[seed % len(progs)]
    tr = [0, 2, -3, 5, -1][seed % 5]
    prog = [[n + tr for n in ch] for ch in base_prog]
    roots = [r + tr for r in base_roots]
    nbars = int(np.ceil(duration / bar)) + 1

    for b in range(nbars):
        t0 = b * bar
        i0 = int(t0 * SR)
        if i0 >= n:
            break
        chord, root = prog[b % 4], roots[b % 4]
        L = min(int(bar * SR), n - i0)
        t = np.arange(L) / SR
        # pad: sierras desafinadas
        p = np.zeros(L)
        for note in chord:
            f = midi(note)
            p += saw(f * 1.003, t) + saw(f * 0.997, t + 0.01)
        p *= env_adsr(L, 0.25, 0.4, 0.75, 0.3) / 8
        pad[i0:i0 + L] += p
        # bajo en corcheas
        for k in range(8):
            s = i0 + int(k * beat / 2 * SR)
            ln = int(beat / 2 * SR * 0.9)
            if s + ln > n:
                break
            tt = np.arange(ln) / SR
            f = midi(root - 12 + (12 if k in (3, 7) else 0))
            bass[s:s + ln] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sign(np.sin(2 * np.pi * f * tt))) * env_adsr(ln, 0.005, 0.08, 0.6, 0.05) * 0.35
        # arpegio en semicorcheas (solo estilo upbeat, desde el compás 1)
        if style == "upbeat" and b >= 1:
            pattern = [0, 1, 2, 3, 2, 1, 2, 3, 0, 2, 1, 3, 2, 1, 0, 2]
            for k, idx in enumerate(pattern):
                s = i0 + int(k * beat / 4 * SR)
                ln = int(beat / 4 * SR)
                if s + ln > n:
                    break
                tt = np.arange(ln) / SR
                f = midi(chord[idx] + 12)
                arp[s:s + ln] += tri(f, tt) * np.exp(-tt * 18) * 0.22
        # batería
        for k in range(4):
            s = i0 + int(k * beat * SR)
            if s >= n:
                break
            # bombo en 1 y 3 (+ "y" del 4 en chill no)
            if k in (0, 2) and b >= 1:
                ln = min(int(0.35 * SR), n - s)
                tt = np.arange(ln) / SR
                f = 45 + 80 * np.exp(-tt * 28)
                ph = 2 * np.pi * np.cumsum(f) / SR
                drums[s:s + ln] += np.sin(ph) * np.exp(-tt * 9) * 0.9
                dl = min(int(0.3 * SR), n - s)
                duck[s:s + dl] = np.minimum(duck[s:s + dl], 1 - 0.55 * np.exp(-np.arange(dl) / SR * 12))
            # palmada en 2 y 4
            if k in (1, 3) and b >= 2:
                ln = min(int(0.2 * SR), n - s)
                tt = np.arange(ln) / SR
                noise = rng.standard_normal(ln)
                drums[s:s + ln] += (noise - lp(noise, 1200)) * np.exp(-tt * 22) * 0.28
            # hi-hat en contratiempos
            if b >= 1:
                hs = s + int(beat / 2 * SR)
                ln = min(int(0.05 * SR), max(n - hs, 0))
                if ln > 0:
                    noise = rng.standard_normal(ln)
                    hp = noise - lp(noise, 6000)
                    drums[hs:hs + ln] += hp * np.exp(-np.arange(ln) / SR * 70) * 0.18

    pad = lp(pad, 1400 if style == "upbeat" else 900)
    out = pad * duck * 0.9 + bass * duck + arp * 0.8 + drums
    # fundido de entrada y salida
    fi, fo = int(0.4 * SR), int(1.5 * SR)
    out[:fi] *= np.linspace(0, 1, fi)
    out[-fo:] *= np.linspace(1, 0, fo)
    out = np.tanh(out * 0.9)
    out /= np.max(np.abs(out)) + 1e-9
    # estéreo con un poco de anchura en el arpegio
    d = int(0.012 * SR)
    left = out
    right = np.concatenate([np.zeros(d), out[:-d]]) * 0.5 + out * 0.5
    return np.stack([left, right], axis=1) * 0.8


if __name__ == "__main__":
    path, dur = sys.argv[1], float(sys.argv[2])
    bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 100
    style = sys.argv[4] if len(sys.argv) > 4 else "upbeat"
    sf.write(path, render(dur, bpm, style), SR)
    print("ok", path, dur)
