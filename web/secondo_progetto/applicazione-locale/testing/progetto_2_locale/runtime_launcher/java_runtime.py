import os
import re
import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path

from .errors import StartupError
from .paths import DOWNLOADS, TOOLS


JAVA_EXECUTABLE = "java.exe" if os.name == "nt" else "java"
JAVAC_EXECUTABLE = "javac.exe" if os.name == "nt" else "javac"


def _java_download_url() -> str:
    architecture = (
        "aarch64"
        if os.getenv("PROCESSOR_ARCHITECTURE", "").upper() == "ARM64"
        else "x64"
    )
    return (
        "https://api.adoptium.net/v3/binary/latest/21/ga/windows/"
        f"{architecture}/jdk/hotspot/normal/eclipse?project=jdk"
    )


def _parse_java_major(text: str) -> int:
    match = re.search(r'version "(?:1\.)?(\d+)', text)
    if not match:
        match = re.search(r"openjdk(?: version)?\s+\"?(?:1\.)?(\d+)", text.lower())
    return int(match.group(1)) if match else -1


def _normalise_jdk_home(home: Path) -> Path | None:
    """Restituisce una vera root JDK, non una cartella shim o una sola JRE."""
    candidates = [home]

    # Con Java 8 java.home può indicare <jdk>\jre, mentre javac è in <jdk>\bin.
    if home.name.lower() == "jre":
        candidates.append(home.parent)

    for candidate in candidates:
        java = candidate / "bin" / JAVA_EXECUTABLE
        javac = candidate / "bin" / JAVAC_EXECUTABLE
        if java.is_file() and javac.is_file():
            return candidate
    return None


def _java_details(java: Path) -> tuple[int, str, Path | None]:
    """Legge versione e java.home direttamente dalla JVM.

    È necessario perché su Windows `java.exe` nel PATH può essere solo uno shim
    (ad esempio Oracle javapath). Calcolare JAVA_HOME con `java.parent.parent`
    in quel caso produce un percorso falso e Maven/Tomcat rifiutano l'avvio.
    """
    process = subprocess.run(
        [str(java), "-XshowSettings:properties", "-version"],
        capture_output=True,
        text=True,
        check=False,
    )
    text = ((process.stdout or "") + "\n" + (process.stderr or "")).strip()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    version_line = next(
        (line for line in lines if "version" in line.lower() or "openjdk" in line.lower()),
        lines[0] if lines else "versione non disponibile",
    )
    major = _parse_java_major(text)

    java_home: Path | None = None
    home_match = re.search(r"(?m)^\s*java\.home\s*=\s*(.+?)\s*$", text)
    if home_match:
        java_home = _normalise_jdk_home(Path(home_match.group(1).strip()))

    # Fallback valido per una java.exe realmente contenuta in una JDK.
    if java_home is None:
        try:
            resolved = java.resolve()
        except OSError:
            resolved = java
        java_home = _normalise_jdk_home(resolved.parent.parent)

    return major, version_line, java_home


def _candidate_java() -> list[Path]:
    candidates: list[Path] = []

    # Prima la copia privata: è controllata dal progetto e non dipende da PATH/JAVA_HOME.
    local_root = TOOLS / "java-21"
    if local_root.exists():
        candidates.extend(local_root.rglob(JAVA_EXECUTABLE))

    java_home = os.getenv("JAVA_HOME")
    if java_home:
        candidates.append(Path(java_home) / "bin" / JAVA_EXECUTABLE)

    system = shutil.which(JAVA_EXECUTABLE)
    if system:
        candidates.append(Path(system))

    # Ultimo tentativo sulle installazioni Windows più comuni, anche se non sono nel PATH.
    if os.name == "nt":
        program_files_values = {
            value
            for value in (os.getenv("ProgramFiles"), os.getenv("ProgramW6432"))
            if value
        }
        patterns = (
            "Eclipse Adoptium/*/bin/java.exe",
            "Java/*/bin/java.exe",
            "Microsoft/jdk-*/bin/java.exe",
            "Zulu/*/bin/java.exe",
        )
        for base_value in program_files_values:
            base = Path(base_value)
            for pattern in patterns:
                candidates.extend(base.glob(pattern))

    unique: list[Path] = []
    seen: set[str] = set()
    for candidate in candidates:
        try:
            key = str(candidate.resolve()).lower()
        except OSError:
            key = str(candidate).lower()
        if key not in seen:
            seen.add(key)
            unique.append(candidate)
    return unique


def java_environment(java: Path) -> dict[str, str]:
    """Crea l'ambiente esplicito richiesto da Maven e Tomcat."""
    major, _, home = _java_details(java)
    if major not in {8, 21} or home is None:
        raise StartupError(
            "Java è eseguibile, ma non è stata individuata una JDK completa "
            "con bin\\java.exe e bin\\javac.exe."
        )

    environment = os.environ.copy()
    environment["JAVA_HOME"] = str(home)

    java_8_jre = home / "jre"
    if (java_8_jre / "bin" / JAVA_EXECUTABLE).is_file():
        environment["JRE_HOME"] = str(java_8_jre)
    else:
        environment["JRE_HOME"] = str(home)

    environment["PATH"] = str(home / "bin") + os.pathsep + environment.get("PATH", "")
    return environment


def _activate(java: Path) -> tuple[Path, str]:
    major, version_text, home = _java_details(java)
    if major not in {8, 21}:
        raise StartupError(
            f"Versione Java non supportata ({major}). Serve Java 8 oppure Java 21."
        )
    if home is None:
        raise StartupError(
            "È stata trovata Java, ma non una JDK completa. "
            "Maven richiede anche javac.exe."
        )

    environment = java_environment(java)
    os.environ.update(environment)
    return home / "bin" / JAVA_EXECUTABLE, version_text


def find_java() -> tuple[Path, str] | None:
    for candidate in _candidate_java():
        if not candidate.is_file():
            continue
        try:
            major, _, home = _java_details(candidate)
        except OSError:
            continue
        if major in {8, 21} and home is not None:
            return _activate(candidate)
    return None


def _download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Progetto2-Launcher/1.0"})
    partial = destination.with_suffix(destination.suffix + ".part")
    partial.unlink(missing_ok=True)
    try:
        with urllib.request.urlopen(request, timeout=300) as response, partial.open("wb") as output:
            shutil.copyfileobj(response, output)
        partial.replace(destination)
    finally:
        partial.unlink(missing_ok=True)


def _install_private_java() -> tuple[Path, str]:
    if os.name != "nt":
        raise StartupError("Java non trovato. Installare Java 8 oppure Java 21.")

    target = TOOLS / "java-21"
    architecture = (
        "arm64"
        if os.getenv("PROCESSOR_ARCHITECTURE", "").upper() == "ARM64"
        else "x64"
    )
    archive = DOWNLOADS / f"temurin-jdk-21-windows-{architecture}.zip"
    TOOLS.mkdir(parents=True, exist_ok=True)
    DOWNLOADS.mkdir(parents=True, exist_ok=True)

    print("Java/JDK non trovata: download automatico di Java 21 nella cartella del progetto...")
    try:
        if not archive.exists():
            _download(_java_download_url(), archive)
        if not zipfile.is_zipfile(archive):
            archive.unlink(missing_ok=True)
            _download(_java_download_url(), archive)
        if not zipfile.is_zipfile(archive):
            raise StartupError("L'archivio Java scaricato non è valido.")
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
        raise StartupError(
            "Java è stata scaricata, ma non è stata trovata una JDK completa con java.exe e javac.exe."
        )
    return found


def ensure_java(install_missing: bool = True) -> tuple[Path, str]:
    found = find_java()
    if found:
        return found
    if not install_missing:
        raise StartupError("Java 8 o Java 21 con JDK completa non trovata.")
    return _install_private_java()


def build_war() -> Path:
    """Compatibilità con launcher precedenti che importavano build_war da questo modulo."""
    from .maven_runtime import build_war as compile_war

    return compile_war()
