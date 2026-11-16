#!/usr/bin/env bash
# poner_portada.sh <video.mp4> <portada.jpg> <salida.mp4>
# Sustituye SOLO el primer fotograma (1/30 s) por la portada: el vídeo se ve igual, la duración y el
# sonido no cambian, e Instagram y TikTok toman ese fotograma como portada.
set -euo pipefail
in="$1"; cover="$2"; out="$3"; tmp="${out%.mp4}.tmp.mp4"
ffmpeg -y -loglevel error -i "$in" -loop 1 -i "$cover" -filter_complex \
  "[1:v]scale=1080:1920,format=yuv420p[c];[0:v][c]overlay=0:0:enable='eq(n,0)':shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart "$tmp"
mv "$tmp" "$out"
echo "portada puesta -> $out"
