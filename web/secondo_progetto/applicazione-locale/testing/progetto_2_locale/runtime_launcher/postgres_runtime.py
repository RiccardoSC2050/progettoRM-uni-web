import hashlib
import os
import re
import shutil
import subprocess
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from .errors import StartupError
from .network import port_open
from .paths import DOWNLOADS, LOGS, POSTGRES_DATA, TOOLS
from .process import run

POSTGRES_MAJOR = "17"
POSTGRES_VERSION = "17.10"
POSTGRES_BUILD = "1"
POSTGRES_PACKAGE_FALLBACK = f"{POSTGRES_VERSION}-{POSTGRES_BUILD}"
POSTGRES_HOME = TOOLS / f"postgresql-{POSTGRES_VERSION}"
POSTGRES_METADATA_URL = "https://www.postgresql.org/applications-v2.xml"
POSTGRES_INSTALLER_URL = (
    "https://get.enterprisedb.com/postgresql/"
    f"postgresql-{POSTGRES_PACKAGE_FALLBACK}-windows-x64.exe"
)
POSTGRES_INSTALLER_SHA256 = (
    "c0728faccc95ced5a280efdc32413fe35764b2302670eec72569b0fd41ac3513"
)


def _version_key(path: Path) -> tuple[int, ...]:
    numbers = re.findall(r"\d+", str(path.parent.parent))
    return tuple(int(value) for value in numbers[-3:]) if numbers else (0,)


def _binary_names() -> tuple[str, str]:
    return (
        "initdb.exe" if os.name == "nt" else "initdb",
        "pg_ctl.exe" if os.name == "nt" else "pg_ctl",
    )


def _binary_works(path: Path) -> bool:
    init_name, ctl_name = _binary_names()
    initdb = path / init_name
    pg_ctl = path / ctl_name
    if not initdb.is_file() or not pg_ctl.is_file():
        return False
    try:
        for executable in (initdb, pg_ctl):
            result = subprocess.run(
                [str(executable), "--version"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
                timeout=15,
            )
            if result.returncode != 0:
                return False
    except (OSError, subprocess.TimeoutExpired):
        return False
    return True


def _candidate_bins() -> list[Path]:
    values: list[Path] = []
    for variable in ("POSTGRES_HOME", "PGHOME"):
        home = os.getenv(variable)
        if home:
            values.extend([Path(home), Path(home) / "bin"])

    initdb = shutil.which("initdb")
    if initdb:
        values.append(Path(initdb).parent)

    if POSTGRES_HOME.exists():
        values.append(POSTGRES_HOME / "bin")
        init_name, _ = _binary_names()
        values.extend(path.parent for path in POSTGRES_HOME.rglob(init_name))

    if os.name == "nt":
        for base in (
            Path("C:/Program Files/PostgreSQL"),
            Path("C:/Program Files (x86)/PostgreSQL"),
            Path("C:/PostgreSQL"),
        ):
            if base.exists():
                values.extend(path / "bin" for path in base.iterdir() if path.is_dir())
    else:
        values.extend(Path("/usr/lib/postgresql").glob("*/bin"))
        values.extend(Path("/usr/pgsql-*").glob("bin"))
        values.extend(Path("/opt/homebrew/opt").glob("postgresql*/bin"))
        values.extend(Path("/Applications/Postgres.app/Contents/Versions").glob("*/bin"))

    unique: list[Path] = []
    seen: set[str] = set()
    for value in values:
        try:
            normalized = str(value.resolve())
        except OSError:
            normalized = str(value)
        if normalized not in seen:
            seen.add(normalized)
            unique.append(value)
    return sorted(unique, key=_version_key, reverse=True)


def find_postgres_bin() -> Path:
    for candidate in _candidate_bins():
        if _binary_works(candidate):
            return candidate
    raise StartupError("PostgreSQL non trovato oppure non eseguibile.")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _download(url: str, destination: Path, timeout: int = 300) -> None:
    """Scarica un file senza lasciare archivi parziali riutilizzabili."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(destination.suffix + ".part")
    partial.unlink(missing_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Progetto2-Launcher/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response, partial.open("wb") as output:
            shutil.copyfileobj(response, output)
        partial.replace(destination)
    finally:
        partial.unlink(missing_ok=True)


def _edb_package_version() -> str:
    """Legge la versione Windows x64 pubblicata dal catalogo ufficiale PostgreSQL."""
    try:
        request = urllib.request.Request(
            POSTGRES_METADATA_URL,
            headers={"User-Agent": "Progetto2-Launcher/1.0"},
        )
        with urllib.request.urlopen(request, timeout=45) as response:
            root = ET.fromstring(response.read())

        for application in root.iter():
            if application.tag.rsplit("}", 1)[-1] != "application":
                continue
            values = {
                child.tag.rsplit("}", 1)[-1]: (child.text or "").strip()
                for child in application
            }
            if (
                values.get("id") == f"postgresql_{POSTGRES_MAJOR}"
                and values.get("platform") == "windows-x64"
                and values.get("version")
            ):
                return values["version"]
    except Exception:
        pass
    return POSTGRES_PACKAGE_FALLBACK


def _find_extracted_home(root: Path) -> Path | None:
    init_name, _ = _binary_names()
    for initdb in root.rglob(init_name):
        binary = initdb.parent
        if _binary_works(binary):
            return binary.parent
    return None


def _install_from_binary_archive() -> Path:
    package_version = _edb_package_version()
    archive = DOWNLOADS / f"postgresql-{package_version}-windows-x64-binaries.zip"
    url = (
        "https://get.enterprisedb.com/postgresql/"
        f"postgresql-{package_version}-windows-x64-binaries.zip"
    )
    temporary = TOOLS / ".postgresql-portable-extract"

    print("PostgreSQL non trovato: download della versione portabile nella cartella del progetto...")
    try:
        if not archive.exists() or not zipfile.is_zipfile(archive):
            archive.unlink(missing_ok=True)
            _download(url, archive)
        if not zipfile.is_zipfile(archive):
            raise StartupError("L'archivio PostgreSQL scaricato non è valido.")

        shutil.rmtree(temporary, ignore_errors=True)
        temporary.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive) as package:
            package.extractall(temporary)

        extracted_home = _find_extracted_home(temporary)
        if extracted_home is None:
            raise StartupError("I binari PostgreSQL non sono presenti nell'archivio portabile.")

        shutil.rmtree(POSTGRES_HOME, ignore_errors=True)
        shutil.copytree(extracted_home, POSTGRES_HOME)
        shutil.rmtree(temporary, ignore_errors=True)

        binary = POSTGRES_HOME / "bin"
        if not _binary_works(binary):
            raise StartupError("La versione portabile di PostgreSQL non è eseguibile.")
        return binary
    except Exception:
        shutil.rmtree(temporary, ignore_errors=True)
        raise


def _install_from_private_extraction() -> Path:
    installer = DOWNLOADS / f"postgresql-{POSTGRES_PACKAGE_FALLBACK}-windows-x64.exe"
    extraction_log = LOGS / "postgres-extraction.log"

    print("Tentativo alternativo: estrazione locale del pacchetto PostgreSQL ufficiale...")
    if not installer.exists() or _sha256(installer) != POSTGRES_INSTALLER_SHA256:
        installer.unlink(missing_ok=True)
        _download(POSTGRES_INSTALLER_URL, installer)
    if _sha256(installer) != POSTGRES_INSTALLER_SHA256:
        raise StartupError("Controllo di integrità del download PostgreSQL non riuscito.")

    shutil.rmtree(POSTGRES_HOME, ignore_errors=True)
    POSTGRES_HOME.mkdir(parents=True, exist_ok=True)
    process = subprocess.run(
        [
            str(installer),
            "--mode",
            "unattended",
            "--unattendedmodeui",
            "none",
            "--extract-only",
            "1",
            "--prefix",
            str(POSTGRES_HOME),
            "--create_shortcuts",
            "0",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    extraction_log.write_text(
        (process.stdout or "") + "\n" + (process.stderr or ""),
        encoding="utf-8",
    )
    if process.returncode != 0:
        raise StartupError(
            "Estrazione locale di PostgreSQL non riuscita. "
            "Consultare .runtime/logs/postgres-extraction.log."
        )

    binary = find_postgres_bin()
    if not _binary_works(binary):
        raise StartupError("PostgreSQL è stato estratto ma non risulta eseguibile.")
    return binary


def _prepare_private_postgres() -> Path:
    if os.name != "nt":
        raise StartupError(
            "PostgreSQL non trovato. Su questo sistema installare PostgreSQL oppure configurare POSTGRES_HOME."
        )

    TOOLS.mkdir(parents=True, exist_ok=True)
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    LOGS.mkdir(parents=True, exist_ok=True)

    portable_error: Exception | None = None
    try:
        return _install_from_binary_archive()
    except Exception as exc:
        portable_error = exc
        (LOGS / "postgres-portable.log").write_text(str(exc), encoding="utf-8")

    try:
        return _install_from_private_extraction()
    except Exception as exc:
        raise StartupError(
            "Impossibile preparare PostgreSQL automaticamente nella cartella del progetto. "
            "Controllare Internet e i log postgres-portable.log / postgres-extraction.log. "
            f"Primo tentativo: {portable_error}. Secondo tentativo: {exc}."
        ) from exc


def ensure_postgres(port: int) -> Path:
    try:
        binary = find_postgres_bin()
        print(f"      PostgreSQL disponibile: {binary}")
    except StartupError:
        binary = _prepare_private_postgres()

    os.environ["POSTGRES_HOME"] = str(binary.parent)
    os.environ["PATH"] = str(binary) + os.pathsep + os.environ.get("PATH", "")

    initdb = binary / ("initdb.exe" if os.name == "nt" else "initdb")
    pg_ctl = binary / ("pg_ctl.exe" if os.name == "nt" else "pg_ctl")
    LOGS.mkdir(parents=True, exist_ok=True)

    if not (POSTGRES_DATA / "PG_VERSION").exists():
        if POSTGRES_DATA.exists():
            shutil.rmtree(POSTGRES_DATA, ignore_errors=True)
        POSTGRES_DATA.parent.mkdir(parents=True, exist_ok=True)
        print("Creazione del database PostgreSQL privato nella cartella del progetto...")
        try:
            run(
                [
                    initdb,
                    "-D",
                    POSTGRES_DATA,
                    "-U",
                    "postgres",
                    "-A",
                    "trust",
                    "--encoding=UTF8",
                    "--locale=C",
                ]
            )
        except subprocess.CalledProcessError as exc:
            if POSTGRES_DATA.exists():
                shutil.rmtree(POSTGRES_DATA, ignore_errors=True)
            raise StartupError(
                "Inizializzazione PostgreSQL non riuscita. "
                "Consultare .runtime/logs/launcher.log."
            ) from exc

        configuration = POSTGRES_DATA / "postgresql.conf"
        with configuration.open("a", encoding="utf-8") as stream:
            stream.write("\n# Configurazione Progetto 2\n")
            stream.write("listen_addresses = '127.0.0.1'\n")
            stream.write(f"port = {port}\n")

    if port_open(port):
        if (POSTGRES_DATA / "postmaster.pid").exists():
            return binary
        raise StartupError(
            f"La porta PostgreSQL {port} è già occupata da un altro programma. "
            "Chiuderlo oppure cambiare postgres.port in config.ini."
        )

    print(f"Avvio PostgreSQL locale sulla porta {port}...")
    try:
        run(
            [
                pg_ctl,
                "-D",
                POSTGRES_DATA,
                "-l",
                LOGS / "postgres.log",
                "-o",
                f"-p {port}",
                "-w",
                "start",
            ]
        )
    except subprocess.CalledProcessError as exc:
        raise StartupError(
            "PostgreSQL locale non si è avviato. Consultare .runtime/logs/postgres.log."
        ) from exc

    deadline = time.time() + 30
    while time.time() < deadline:
        if port_open(port):
            return binary
        time.sleep(0.5)
    raise StartupError("PostgreSQL locale non risponde.")


def stop_postgres() -> None:
    if not (POSTGRES_DATA / "PG_VERSION").exists():
        return
    try:
        binary = find_postgres_bin()
    except StartupError:
        return
    pg_ctl = binary / ("pg_ctl.exe" if os.name == "nt" else "pg_ctl")
    subprocess.run(
        [str(pg_ctl), "-D", str(POSTGRES_DATA), "-m", "fast", "-w", "stop"],
        check=False,
        text=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
