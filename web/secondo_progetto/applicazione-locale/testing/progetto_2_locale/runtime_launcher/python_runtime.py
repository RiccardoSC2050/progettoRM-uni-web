import os
import shutil
import subprocess
import sys
from pathlib import Path

from .paths import DJANGO
from .process import run


def _venv_python(virtualenv: Path) -> Path:
    return virtualenv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def _works(python: Path) -> bool:
    if not python.exists():
        return False
    process = subprocess.run(
        [str(python), "-c", "import sys; print(sys.version_info[:2])"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return process.returncode == 0


def prepare_python() -> Path:
    executable = Path(sys.executable)
    virtualenv = DJANGO / ".venv"
    python = _venv_python(virtualenv)

    if python.exists() and not _works(python):
        print("Ambiente Python non più valido: ricreazione automatica...")
        shutil.rmtree(virtualenv, ignore_errors=True)

    if not python.exists():
        print("Creazione dell'ambiente Python locale...")
        run([executable, "-m", "venv", virtualenv])

    requirements = DJANGO / "requirements.txt"
    marker = virtualenv / ".dependencies"
    if not marker.exists() or marker.stat().st_mtime < requirements.stat().st_mtime:
        print("Installazione locale dei pacchetti Python...")
        run([python, "-m", "pip", "install", "--disable-pip-version-check", "--upgrade", "pip"])
        run([python, "-m", "pip", "install", "--disable-pip-version-check", "-r", requirements])
        marker.write_text("ok", encoding="utf-8")
    return python


def check_project(python: Path) -> None:
    print("Controllo del progetto Django...")
    run([python, "manage.py", "check"], cwd=DJANGO)
    print("Applicazione delle migrazioni Django...")
    run([python, "manage.py", "migrate", "--noinput"], cwd=DJANGO)
