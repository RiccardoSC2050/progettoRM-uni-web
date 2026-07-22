#!/usr/bin/env sh
set -u
cd "$(dirname "$0")"
PYTHON="$(command -v python3 || command -v python || true)"
if [ -z "$PYTHON" ]; then
  echo "ERRORE: Python non trovato."
  exit 1
fi
"$PYTHON" -m runtime_launcher.start
CODE=$?
if [ "$CODE" -eq 0 ]; then
  echo "Applicazione disponibile su http://127.0.0.1:8080/migration-servlet/"
else
  echo "Avvio non riuscito. Consultare .runtime/logs/launcher.log"
fi
exit "$CODE"
