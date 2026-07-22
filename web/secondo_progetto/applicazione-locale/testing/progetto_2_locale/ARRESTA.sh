#!/usr/bin/env sh
set -u
cd "$(dirname "$0")"
PYTHON="$(command -v python3 || command -v python || true)"
if [ -z "$PYTHON" ]; then
  echo "ERRORE: Python non trovato."
  exit 1
fi
"$PYTHON" -m runtime_launcher.stop
