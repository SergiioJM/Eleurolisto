#!/usr/bin/env bash
# Prepara el entorno para crear reels de El Euro Listo (idempotente).
set -euo pipefail
MODELS="${EUROLISTO_MODELS:-/home/claude/tts_models}"
mkdir -p "$MODELS"

pip install --break-system-packages -q kokoro-onnx soundfile scipy pillow numpy 2>&1 | grep -v -i warning || true

for m in vits-piper-es_ES-davefx-medium vits-piper-es_ES-sharvard-medium; do
  if [ ! -d "$MODELS/$m" ]; then
    curl -sSL -o "$MODELS/$m.tar.bz2" "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/$m.tar.bz2"
    tar xjf "$MODELS/$m.tar.bz2" -C "$MODELS" && rm "$MODELS/$m.tar.bz2"
  fi
done

for f in kokoro-v1.0.int8.onnx voices-v1.0.bin; do
  [ -f "$MODELS/$f" ] || curl -sSL -o "$MODELS/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done

command -v ffmpeg >/dev/null || { echo "Falta ffmpeg"; exit 1; }
# Motor 3D (Three.js + Chrome headless)
(cd "$(dirname "$0")/escena3d" && npm install --silent) || echo "Aviso: npm install del motor 3D falló"
[ -x /usr/bin/google-chrome ] || echo "Aviso: no hay /usr/bin/google-chrome (exporta CHROME=ruta)"
fc-list | grep -q Poppins || echo "Aviso: no está la fuente Poppins"
python3 -c "import sys; sys.path.insert(0, '$(dirname "$0")'); import voces, reelkit; print('toolkit OK')"
