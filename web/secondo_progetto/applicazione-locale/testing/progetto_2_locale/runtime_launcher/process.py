import os
import shutil
import subprocess
from pathlib import Path
from typing import Iterable, Mapping, Optional

from .errors import StartupError


def find_command(*names: str) -> str:
    for name in names:
        command = shutil.which(name)
        if command:
            return command
    raise StartupError(f"Comando non trovato: {' / '.join(names)}")


def run(
    command: Iterable[object],
    cwd: Optional[Path] = None,
    env: Optional[Mapping[str, str]] = None,
    capture: bool = False,
) -> subprocess.CompletedProcess:
    values = [str(value) for value in command]
    return subprocess.run(
        values,
        cwd=str(cwd) if cwd else None,
        env=dict(env) if env else None,
        check=True,
        text=True,
        capture_output=capture,
    )


def executable_name(name: str) -> str:
    return name + ".exe" if os.name == "nt" else name
