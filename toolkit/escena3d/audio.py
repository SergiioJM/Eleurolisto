"""Pone música original (baja, con ducking bajo la voz) y efectos a un vídeo renderizado sin sonido.

mezclar(video_in, video_out, tim, eventos, bpm=96, style="chill", seed=2, music_gain=0.30, duck_gain=0.09)
  tim: timings.json (segments con start/dur) -> la música baja mientras habla la voz.
  eventos: [(t, "whoosh"|"pop"|"ding"|"tick"|"thud", ganancia)]
Sin loudnorm: la voz de Creative Claw se añade después (add_audio_to_video, mix) y debe quedar por encima.
"""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import music as _music  # noqa: E402
import sfx as _sfx  # noqa: E402


def mezclar(video_in, video_out, tim, eventos, bpm=96, style="chill", seed=2, music_gain=0.30, duck_gain=0.09, sfx_gain=0.35):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video_in],
                               capture_output=True, text=True).stdout)
    sr = _music.SR
    m = _music.render(dur + 0.1, bpm, style, seed=seed)
    L = len(m)
    gain = np.full(L, music_gain)
    for s in tim["segments"]:
        a, b = int((s["start"] - 0.1) * sr), int((s["start"] + s["dur"] + 0.1) * sr)
        gain[max(a, 0):b] = duck_gain
    k = int(0.15 * sr)
    gain = np.convolve(gain, np.ones(k) / k, mode="same")
    fade = int(0.8 * sr)
    gain[-fade:] *= np.linspace(1, 0, fade)
    fx = _sfx.track(eventos, L) * sfx_gain if eventos else np.zeros(L)
    mix = m * gain[:, None] + fx[:, None]
    mix /= max(1.0, np.max(np.abs(mix)) / 0.97)
    wav = video_out.replace(".mp4", "_mix.wav")
    sf.write(wav, mix, sr)
    tmp = video_out.replace(".mp4", ".tmp.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video_in, "-i", wav, "-map", "0:v", "-map", "1:a",
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, video_out)
    os.remove(wav)
    return video_out
