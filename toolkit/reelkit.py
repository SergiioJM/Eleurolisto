"""reelkit — motor de animación propio de El Euro Listo (PIL + ffmpeg), 1080x1920 a 30 fps.

Uso típico (ver reels/2026-11-16_2030_regla_50_30_20/render.py):
    from reelkit import *
    r = Reel(carpeta)                    # lee timings.json de la voz (o Reel(carpeta, duraciones=[...]) sin voz)
    def escena0(c, t): text(c, "Hola", POP, 120, WHITE, CX, 800, t, 0, .4, "pop")
    r.frames([1.0, 5.2], [escena0, ...])  # PNGs de prueba
    r.render([escena0, ...], "video.mp4")  # escenas -> concat -> música + voz -> mp4 final

Cada escena es f(canvas RGBA, t_local_en_segundos). La escena i dura lo que la frase i de la voz.
Zonas seguras de Reels: contenido clave entre y=250 y y=1450, x entre 80 y 940.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
import music as _music  # noqa: E402
import sfx as _sfx  # noqa: E402

W, H, FPS = 1080, 1920, 30
CX = W // 2

POP = "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf"
POPM = "/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf"
INTS = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
INTM = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
INTB = "/usr/share/fonts/opentype/inter/Inter-Black.otf"

# Paleta de marca
WHITE = (248, 250, 252)
MUTED = (148, 163, 184)
FAINT = (100, 116, 139)
DIM = (30, 41, 59)
BLUE = (59, 130, 246)
AMBER = (245, 158, 11)
GREEN = (34, 197, 94)
RED = (239, 68, 68)
PURPLE = (168, 85, 247)
DARK = (11, 18, 32)

_fonts, _layers = {}, {}


# ---------------- utilidades ----------------
def font(path, size):
    k = (path, size)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(path, size)
    return _fonts[k]


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, start, dur):
    return clamp((t - start) / dur) if dur > 0 else float(t >= start)


def ease_out(x):
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_back(x):
    c1, c3 = 1.70158, 2.70158
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2


def mix(c1, c2, k):
    return tuple(int(a + (b - a) * k) for a, b in zip(c1, c2))


def eur(v, dec=0):
    """Formato español: 1.500 € / 3,50 €"""
    if dec:
        s = f"{v:,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    else:
        s = f"{int(round(v)):,}".replace(",", ".")
    return s + " €"


def num(v):
    return f"{int(round(v)):,}".replace(",", ".")


# ---------------- texto ----------------
def text_layer(s, path, size, color):
    k = (s, path, size, color)
    if k not in _layers:
        f = font(path, size)
        x0, _, x1, _ = f.getbbox(s, anchor="la")
        ascent, descent = f.getmetrics()
        im = Image.new("RGBA", (x1 - x0 + 4, ascent + descent + 4), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((2 - x0, 2), s, font=f, fill=color, anchor="la")
        _layers[k] = im
    return _layers[k]


def paste(canvas, layer, cx, cy, scale=1.0, alpha=1.0):
    if alpha <= 0.003 or scale <= 0.01:
        return
    if abs(scale - 1) > 0.004:
        layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))), Image.LANCZOS)
    if alpha < 0.997:
        layer = layer.copy()
        layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))


def text(canvas, s, path, size, color, cx, cy, t=1.0, start=0.0, dur=0.35, mode="fade", slide=40, out=None):
    """mode: fade | pop | slide. out=(inicio, duración) para desvanecer al salir."""
    p = prog(t, start, dur)
    if p <= 0:
        return
    a = 1.0
    if out:
        a = 1 - ease_out(prog(t, out[0], out[1]))
    lay = text_layer(s, path, size, color)
    if mode == "pop":
        paste(canvas, lay, cx, cy, scale=max(0.01, ease_back(p)), alpha=clamp(p * 2) * a)
    elif mode == "slide":
        paste(canvas, lay, cx, cy + (1 - ease_out(p)) * slide, alpha=ease_out(p) * a)
    else:
        paste(canvas, lay, cx, cy, alpha=ease_out(p) * a)


def text_width(s, path, size):
    return font(path, size).getlength(s)


def wrap(s, path, size, max_w):
    words, lines, cur = s.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if text_width(test, path, size) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ---------------- fondo ----------------
def background(top=(11, 18, 32), bottom=(10, 30, 30), glow=(20, 40, 36), glow_y=0.42):
    y = np.linspace(0, 1, H)[:, None]
    x = np.linspace(0, 1, W)[None, :]
    top, bottom = np.array(top), np.array(bottom)
    g = top[None, None, :] * (1 - y[..., None]) + bottom[None, None, :] * y[..., None]
    g = np.broadcast_to(g, (H, W, 3)).copy()
    r = np.sqrt((x - 0.5) ** 2 + ((y - glow_y) * 1.6) ** 2)
    gl = np.clip(1 - r / 0.55, 0, 1) ** 2
    g += gl[..., None] * np.array(glow)
    return Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).convert("RGBA")


# ---------------- elementos ----------------
def rounded_bar(canvas, x, y, w, h, frac, color, track=DIM):
    ss = 3
    im = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if track:
        d.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=h * ss // 2, fill=track)
    fw = int(w * ss * clamp(frac))
    if fw > h * ss // 2:
        d.rounded_rectangle([0, 0, fw - 1, h * ss - 1], radius=h * ss // 2, fill=color)
    canvas.alpha_composite(im.resize((w, h), Image.LANCZOS), (int(x), int(y)))


def rect(canvas, x, y, w, h, color, radius=24, alpha=1.0):
    if w < 2 or h < 2:
        return
    ss = 2
    im = Image.new("RGBA", (int(w * ss), int(h * ss)), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, int(w * ss) - 1, int(h * ss) - 1],
                                         radius=int(min(radius, w / 2, h / 2) * ss), fill=color)
    im = im.resize((int(w), int(h)), Image.LANCZOS)
    if alpha < 1:
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(im, (int(x), int(y)))


def banner(canvas, s, cx, cy, t, start, color=GREEN, txt=DARK, size=64, pad_x=60, h=120):
    """Cartel redondeado que aparece con efecto pop."""
    p = prog(t, start, 0.4)
    if p <= 0:
        return
    sc = max(0.01, ease_back(p))
    w = text_width(s, POP, size) + pad_x * 2
    rect(canvas, cx - w * sc / 2, cy - h * sc / 2, w * sc, h * sc, color, radius=h / 2 * sc)
    paste(canvas, text_layer(s, POP, size, txt), cx, cy + 3 * sc, scale=sc)


def donut(canvas, cx, cy, segs, alpha=1.0, R=320, th=88, track=DIM):
    """segs: lista de (desde, hasta, color) en fracciones 0..1, empezando arriba en sentido horario."""
    ss = 2
    size = (R + 6) * 2
    im = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    box = [6 * ss, 6 * ss, (size - 6) * ss, (size - 6) * ss]
    if track:
        d.arc(box, 0, 360, fill=track, width=th * ss)
    for a, b, col in segs:
        if b - a > 0.001:
            d.arc(box, -90 + 360 * a, -90 + 360 * b, fill=col, width=th * ss)
    im = im.resize((size, size), Image.LANCZOS)
    if alpha < 1:
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    canvas.alpha_composite(im, (cx - size // 2, cy - size // 2))


def bars(canvas, values, x0, base, w_total, hmax, color, t, start, stagger=0.1, dur=0.35, labels=None,
         label_color=MUTED, vmax=None, colors=None, gap_ratio=0.3):
    """Gráfico de barras que crecen escalonadas. Devuelve la suma del progreso (0..len)."""
    n = len(values)
    vmax = vmax or max(values)
    bw = w_total / (n + (n - 1) * gap_ratio)
    gap = bw * gap_ratio
    done = 0
    for i, v in enumerate(values):
        p = ease_out(prog(t, start + i * stagger, dur))
        h = hmax * v / vmax * p
        x = x0 + i * (bw + gap)
        if h > 2:
            rect(canvas, x, base - h, bw, h, (colors[i] if colors else color), radius=min(12, bw / 3))
        if labels:
            paste(canvas, text_layer(labels[i], INTM, 34, label_color), x + bw / 2, base + 40,
                  alpha=ease_out(prog(t, start, 0.3)))
        done += p
    return done


def line_chart(canvas, series, x0, y0, w, h, t, start, dur, colors, fill_alpha=0.18, width=10, vmax=None):
    """series: lista de listas de valores (mismo largo). Se dibujan de izquierda a derecha según el progreso."""
    p = ease_in_out(prog(t, start, dur))
    if p <= 0:
        return
    vmax = vmax or max(max(s) for s in series)
    ss = 2
    im = Image.new("RGBA", (int(w * ss), int(h * ss)), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for s, col in zip(series, colors):
        n = len(s)
        upto = p * (n - 1)
        pts = []
        for i in range(n):
            if i <= upto:
                pts.append((i, s[i]))
            else:
                k = int(upto)
                frac = upto - k
                if k + 1 < n:
                    pts.append((upto, s[k] + (s[k + 1] - s[k]) * frac))
                break
        xy = [(xi / (n - 1) * w * ss, h * ss - v / vmax * h * ss) for xi, v in pts]
        if len(xy) >= 2:
            poly = xy + [(xy[-1][0], h * ss), (xy[0][0], h * ss)]
            d.polygon(poly, fill=col + (int(255 * fill_alpha),))
            d.line(xy, fill=col + (255,), width=width * ss, joint="curve")
            ex, ey = xy[-1]
            r = width * ss * 1.2
            d.ellipse([ex - r, ey - r, ex + r, ey + r], fill=col + (255,))
    im = im.resize((int(w), int(h)), Image.LANCZOS)
    canvas.alpha_composite(im, (int(x0), int(y0)))


def bookmark(canvas, cx, cy, scale, color=GREEN):
    if scale <= 0.01:
        return
    ss = 3
    w, h = 170, 220
    im = Image.new("RGBA", (w * ss, h * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w * ss, int(h * ss * 0.8)], radius=28 * ss, fill=color)
    d.polygon([(0, int(h * ss * 0.5)), (w * ss, int(h * ss * 0.5)), (w * ss, h * ss),
               (w * ss // 2, int(h * ss * 0.72)), (0, h * ss)], fill=color)
    im = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def cta(canvas, t, line1="Guárdate este vídeo", line2="y empieza este mes",
        line3="Sígueme para más trucos de dinero", start=0.0):
    """Cierre estándar de la cuenta."""
    p = prog(t, start + 0.05, 0.45)
    bookmark(canvas, CX, 720, max(0.01, ease_back(p)) if p > 0 else 0)
    text(canvas, line1, POP, 84, WHITE, CX, 960, t, start + 0.35, 0.35, "slide")
    text(canvas, line2, POP, 84, GREEN, CX, 1065, t, start + 0.8, 0.35, "slide")
    if line3:
        text(canvas, line3, INTM, 44, MUTED, CX, 1200, t, start + 1.3, 0.4, "slide")


# ---------------- render ----------------
class Reel:
    def __init__(self, carpeta, duraciones=None, bg=None, voz_externa=None):
        """voz_externa: {"total": s, "segments": [{"start": s, "dur": s}, ...]} cuando la voz se genera fuera
        (p. ej. Creative Claw / ElevenLabs). El vídeo se renderiza sin voz pero con la música ya bajada en
        esos tramos; la voz se añade después con add_audio_to_video (mix)."""
        self.d = carpeta
        if voz_externa is not None:
            self.seg = voz_externa["segments"]
            self.total = voz_externa["total"]
            self.bounds = [0.0] + [s["start"] - 0.15 for s in self.seg[1:]] + [self.total]
            self.has_voice = False
        elif duraciones is None:
            tim = json.load(open(f"{carpeta}/timings.json"))
            self.seg = tim["segments"]
            self.total = tim["total"]
            self.bounds = [0.0] + [s["start"] - 0.15 for s in self.seg[1:]] + [self.total]
            self.has_voice = True
        else:
            self.seg = []
            self.total = float(sum(duraciones))
            self.bounds = [0.0] + list(np.cumsum(duraciones))
            self.has_voice = False
        self.bg = bg or background()

    def scene_dur(self, i):
        return self.bounds[i + 1] - self.bounds[i]

    def frame_at(self, scenes, gt):
        i = max(j for j in range(len(scenes)) if self.bounds[j] <= gt) if gt < self.total else len(scenes) - 1
        c = self.bg.copy()
        scenes[i](c, gt - self.bounds[i])
        return c.convert("RGB")

    def frames(self, times, scenes, sheet="contact.png", scale=0.3):
        ims = [self.frame_at(scenes, t) for t in times]
        w, h = int(W * scale), int(H * scale)
        cols = min(4, len(ims))
        rows = (len(ims) + cols - 1) // cols
        sh = Image.new("RGB", (cols * (w + 10), rows * (h + 10)), (60, 60, 60))
        for k, im in enumerate(ims):
            sh.paste(im.resize((w, h)), ((k % cols) * (w + 10), (k // cols) * (h + 10)))
        sh.save(f"{self.d}/{sheet}")
        return f"{self.d}/{sheet}"

    def render(self, scenes, out_name="video.mp4", bpm=100, style="upbeat", music_seed=1,
               music_gain=0.30, duck_gain=0.09, sfx=None, auto_sfx=True, punch=True, sfx_gain=0.35):
        """sfx: lista de (segundo_global, "pop"|"ding"|"whoosh"|"tick"|"thud"[, ganancia]).
        auto_sfx: whoosh en cada corte de escena. punch: zoom-in corto al empezar cada escena (salvo la primera)."""
        assert len(scenes) == len(self.bounds) - 1, "una escena por frase"
        os.makedirs(f"{self.d}/scenes", exist_ok=True)
        lst = []
        for i, fn in enumerate(scenes):
            f0, f1 = round(self.bounds[i] * FPS), round(self.bounds[i + 1] * FPS)
            tmp, out = f"{self.d}/scenes/s{i}.tmp.mp4", f"{self.d}/scenes/s{i}.mp4"
            p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                                  "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "18",
                                  "-preset", "veryfast", "-pix_fmt", "yuv420p", "-r", str(FPS), tmp],
                                 stdin=subprocess.PIPE)
            for f in range(f0, f1):
                c = self.bg.copy()
                lt = f / FPS - self.bounds[i]
                fn(c, lt)
                img = c.convert("RGB")
                if punch and i > 0 and lt < 0.22:
                    s = 1 + 0.05 * (1 - ease_out(lt / 0.22))
                    big = img.resize((int(W * s), int(H * s)), Image.BILINEAR)
                    ox, oy = (big.width - W) // 2, (big.height - H) // 2
                    img = big.crop((ox, oy, ox + W, oy + H))
                p.stdin.write(img.tobytes())
            p.stdin.close()
            if p.wait() != 0:
                raise SystemExit(f"ffmpeg falló en la escena {i}")
            os.replace(tmp, out)
            lst.append(f"file '{out}'")
        open(f"{self.d}/scenes/list.txt", "w").write("\n".join(lst) + "\n")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i",
                        f"{self.d}/scenes/list.txt", "-c", "copy", f"{self.d}/video_noaudio.mp4"], check=True)
        # música original sintetizada + voz con ducking
        msr = _music.SR
        m = _music.render(self.total + 0.1, bpm, style, seed=music_seed)
        L = len(m)
        if self.has_voice:
            voice, sr = sf.read(f"{self.d}/voice.wav")
            n = int(len(voice) * msr / sr)
            v = np.interp(np.linspace(0, len(voice) - 1, n), np.arange(len(voice)), voice)
            L = max(L, len(v))
            v = np.pad(v, (0, L - len(v)))
        else:
            v = np.zeros(L)
        m = np.pad(m, ((0, L - len(m)), (0, 0)))
        gain = np.full(L, music_gain if (self.has_voice or self.seg) else 0.9)
        for s in self.seg:
            a, b = int((s["start"] - 0.1) * msr), int((s["start"] + s["dur"] + 0.1) * msr)
            gain[max(a, 0):b] = duck_gain
        k = int(0.15 * msr)
        gain = np.convolve(gain, np.ones(k) / k, mode="same")
        events = list(sfx or [])
        if auto_sfx:
            events += [(b - 0.12, "whoosh", 0.8) for b in self.bounds[1:-1]]
        fx = _sfx.track(events, L) * sfx_gain if events else np.zeros(L)
        mixd = m * gain[:, None] + v[:, None] * 0.95 + fx[:, None]
        mixd /= max(1.0, np.max(np.abs(mixd)) / 0.97)
        sf.write(f"{self.d}/mix.wav", mixd, msr)
        final = f"{self.d}/{out_name}"
        # Con voz externa NO se normaliza: si no, la música sola se subiría a -14 LUFS y taparía la voz al mezclar.
        af = "anull" if (self.seg and not self.has_voice) else "loudnorm=I=-14:TP=-1.5:LRA=11"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f"{self.d}/video_noaudio.mp4", "-i",
                        f"{self.d}/mix.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
                        "-b:a", "192k", "-af", af, "-shortest",
                        "-movflags", "+faststart", final], check=True)
        return final
