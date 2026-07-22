import sys
from dataclasses import dataclass
from pathlib import Path

from .errors import StartupError
from .java_runtime import ensure_java


@dataclass(frozen=True)
class RuntimeInfo:
    python: str
    java: str
    java_command: Path


def verify_prerequisites(install_missing: bool = True) -> RuntimeInfo:
    if sys.version_info < (3, 12):
        raise StartupError(
            f"Serve Python 3.12 o successivo. Versione rilevata: {sys.version.split()[0]}."
        )

    java, java_text = ensure_java(install_missing=install_missing)
    return RuntimeInfo(
        python=f"Python {sys.version.split()[0]}",
        java=java_text,
        java_command=java,
    )
