import hashlib
import os
import re
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path

from .errors import StartupError
from .network import port_open
from .paths import DOWNLOADS, LOGS, POSTGRES_DATA, TOOLS
from .process import run

POSTGRES_VERSION = "17.10"
POSTGRES_BUILD = "1"
POSTGRES_HOME = TOOLS / f"postgresql-{POSTGRES_VERSION}"
POSTGRES_INSTALLER_URL = (
    "https://get.enterprisedb.com/postgresql/"
    f"postgresql-{POSTGRES_VERSION}-{POSTGRES_BUILD}-windows-x64.exe"
)
POSTGRES_INSTALLER_SHA256 = (
    "c0728faccc95ced5a280efdc32413fe35764b2302670eec72569b0fd41ac3513"
)


def _version_key(path: Path) -> tuple[int, ...]:
    numbers = re.findall(r"\d+", str(path.parent.parent))
    return tuple(int(value) for value in numbers[-3:]) if numbers else (0,)


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
        init_name = "initdb.exe" if os.name == "nt" else "initdb"
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
    init_name = "initdb.exe" if os.name == "nt" else "initdb"
    ctl_name = "pg_ctl.exe" if os.name == "nt" else "pg_ctl"
    for candidate in _candidate_bins():
        if (candidate / init_name).is_file() and (candidate / ctl_name).is_file():
            return candidate
    raise StartupError("PostgreSQL non trovato.")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Progetto2-Launcher/1.0"})
    with urllib.request.urlopen(request, timeout=300) as response, destination.open("wb") as output:
        shutil.copyfileobj(response, output)



def _winget_fallback() -> Path | None:
    winget = shutil.which("winget")
    if not winget:
        return None
    print("Estrazione portabile non riuscita: tentativo di installazione automatica con WinGet...")
    LOGS.mkdir(parents=True, exist_ok=True)
    process = subprocess.run(
        [
            winget,
            "install",
            "--id",
            "PostgreSQL.PostgreSQL.17",
            "-e",
            "--silent",
            "--accept-package-agreements",
            "--accept-source-agreements",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    (LOGS / "postgres-winget.log").write_text(
        (process.stdout or "") + "\n" + (process.stderr or ""),
        encoding="utf-8",
    )
    if process.returncode != 0:
        return None
    try:
        return find_postgres_bin()
    except StartupError:
        return None

def _prepare_private_postgres() -> Path:
    if os.name != "nt":
        raise StartupError(
            "PostgreSQL non trovato. Installare PostgreSQL oppure configurare POSTGRES_HOME."
        )

    TOOLS.mkdir(parents=True, exist_ok=True)
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    LOGS.mkdir(parents=True, exist_ok=True)
    installer = DOWNLOADS / f"postgresql-{POSTGRES_VERSION}-windows-x64.exe"
    extraction_log = LOGS / "postgres-extraction.log"

    print(
        "PostgreSQL non trovato: download automatico dei binari nella cartella del progetto..."
    )
    try:
        if not installer.exists() or _sha256(installer) != POSTGRES_INSTALLER_SHA256:
            installer.unlink(missing_ok=True)
            _download(POSTGRES_INSTALLER_URL, installer)
        if _sha256(installer) != POSTGRES_INSTALLER_SHA256:
            raise StartupError("Controllo di integrità del download PostgreSQL non riuscito.")

        if POSTGRES_HOME.exists():
            shutil.rmtree(POSTGRES_HOME)
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
            fallback = _winget_fallback()
            if fallback:
                return fallback
            raise StartupError(
                "Estrazione automatica di PostgreSQL non riuscita. "
                "Consultare .runtime/logs/postgres-extraction.log e postgres-winget.log."
            )
    except StartupError:
        raise
    except Exception as exc:
        raise StartupError(
            "Impossibile preparare PostgreSQL automaticamente. "
            "Controllare la connessione Internet e riprovare."
        ) from exc

    try:
        return find_postgres_bin()
    except StartupError as exc:
        fallback = _winget_fallback()
        if fallback:
            return fallback
        raise StartupError(
            "PostgreSQL è stato scaricato ma initdb.exe e pg_ctl.exe non sono stati trovati."
        ) from exc


def ensure_postgres(port: int) -> Path:
    try:
        binary = find_postgres_bin()
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
