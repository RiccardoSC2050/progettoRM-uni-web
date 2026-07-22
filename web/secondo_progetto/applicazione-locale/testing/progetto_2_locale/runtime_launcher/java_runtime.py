import os
import re
import shutil
import urllib.request
import zipfile
from pathlib import Path

from .errors import StartupError
from .paths import DOWNLOADS, TOOLS

JAVA_DOWNLOAD_URL = (
    "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/"
    "jdk/hotspot/normal/eclipse?project=jdk"
)


def _java_major(java: Path) -> tuple[int, str]:
    import subprocess

    process = subprocess.run(
        [str(java), "-version"],
        capture_output=True,
        text=True,
        check=False,
    )
    text = (process.stdout + process.stderr).strip()
    first_line = text.splitlines()[0] if text else "versione non disponibile"
    match = re.search(r'version "(?:1\.)?(\d+)', first_line)
    if not match:
        match = re.search(r"openjdk (\d+)", first_line.lower())
    return (int(match.group(1)) if match else -1, first_line)


def _candidate_java() -> list[Path]:
    candidates: list[Path] = []
    java_home = os.getenv("JAVA_HOME")
    if java_home:
        candidates.append(Path(java_home) / "bin" / ("java.exe" if os.name == "nt" else "java"))

    system = shutil.which("java")
    if system:
        candidates.append(Path(system))

    local_root = TOOLS / "java-21"
    if local_root.exists():
        name = "java.exe" if os.name == "nt" else "java"
        candidates.extend(local_root.rglob(name))

    unique: list[Path] = []
    seen: set[str] = set()
    for candidate in candidates:
        try:
            key = str(candidate.resolve())
        except OSError:
            key = str(candidate)
        if key not in seen:
            seen.add(key)
            unique.append(candidate)
    return unique


def _activate(java: Path) -> tuple[Path, str]:
    major, version_text = _java_major(java)
    if major not in {8, 21}:
        raise StartupError(
            f"Versione Java non supportata ({major}). Serve Java 8 oppure Java 21."
        )
    home = java.parent.parent
    os.environ["JAVA_HOME"] = str(home)
    os.environ["PATH"] = str(java.parent) + os.pathsep + os.environ.get("PATH", "")
    return java, version_text


def find_java() -> tuple[Path, str] | None:
    for candidate in _candidate_java():
        if not candidate.is_file():
            continue
        try:
            major, _ = _java_major(candidate)
        except OSError:
            continue
        if major in {8, 21}:
            return _activate(candidate)
    return None


def _download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Progetto2-Launcher/1.0"})
    with urllib.request.urlopen(request, timeout=180) as response, destination.open("wb") as output:
        shutil.copyfileobj(response, output)


def _install_private_java() -> tuple[Path, str]:
    if os.name != "nt":
        raise StartupError("Java non trovato. Installare Java 8 oppure Java 21.")

    target = TOOLS / "java-21"
    archive = DOWNLOADS / "temurin-jdk-21-windows-x64.zip"
    TOOLS.mkdir(parents=True, exist_ok=True)
    DOWNLOADS.mkdir(parents=True, exist_ok=True)

    print("Java non trovato: download automatico di Java 21 nella cartella del progetto...")
    try:
        if not archive.exists():
            _download(JAVA_DOWNLOAD_URL, archive)
        if target.exists():
            shutil.rmtree(target)
        target.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive) as package:
            package.extractall(target)
    except Exception as exc:
        raise StartupError(
            "Impossibile preparare Java automaticamente. Controllare la connessione Internet."
        ) from exc

    found = find_java()
    if not found:
        raise StartupError("Java è stato scaricato ma java.exe non è stato trovato.")
    return found


def ensure_java(install_missing: bool = True) -> tuple[Path, str]:
    found = find_java()
    if found:
        return found
    if not install_missing:
        raise StartupError("Java 8 o Java 21 non trovato.")
    return _install_private_java()


def build_war() -> Path:
    """Compatibilità con launcher precedenti che importavano build_war da questo modulo."""
    from .maven_runtime import build_war as compile_war

    return compile_war()
