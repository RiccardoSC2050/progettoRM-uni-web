import os
import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path

from .errors import StartupError
from .paths import JAVA, LOGS, RUNTIME

MAVEN_VERSION = "3.9.9"
MAVEN_URL = (
    "https://archive.apache.org/dist/maven/maven-3/"
    f"{MAVEN_VERSION}/binaries/apache-maven-{MAVEN_VERSION}-bin.zip"
)


def prepare_maven() -> Path:
    """Restituisce Maven di sistema oppure prepara una copia privata nel progetto."""
    system = shutil.which("mvn.cmd" if os.name == "nt" else "mvn")
    if system:
        return Path(system)

    tools = RUNTIME / "tools"
    home = tools / f"apache-maven-{MAVEN_VERSION}"
    executable = home / "bin" / ("mvn.cmd" if os.name == "nt" else "mvn")
    if executable.exists():
        return executable

    tools.mkdir(parents=True, exist_ok=True)
    archive = tools / f"apache-maven-{MAVEN_VERSION}-bin.zip"
    print("Maven non trovato: installazione locale automatica nel progetto...")
    try:
        request = urllib.request.Request(
            MAVEN_URL,
            headers={"User-Agent": "Progetto2-Launcher/1.0"},
        )
        with urllib.request.urlopen(request, timeout=180) as response, archive.open("wb") as output:
            shutil.copyfileobj(response, output)
        with zipfile.ZipFile(archive) as package:
            package.extractall(tools)
    except Exception as exc:
        raise StartupError(
            "Impossibile installare Maven automaticamente. "
            "Controllare la connessione Internet e riprovare."
        ) from exc
    finally:
        archive.unlink(missing_ok=True)

    if not executable.exists():
        raise StartupError("Installazione locale di Maven non riuscita.")
    if os.name != "nt":
        executable.chmod(executable.stat().st_mode | 0o111)
    return executable


def _maven_command(maven: Path, arguments: list[str]) -> list[str]:
    """Costruisce un comando affidabile anche quando Maven è un file .cmd su Windows."""
    if os.name == "nt" and maven.suffix.lower() in {".cmd", ".bat"}:
        return ["cmd.exe", "/d", "/s", "/c", "call", str(maven), *arguments]
    return [str(maven), *arguments]


def build_war() -> Path:
    """Compila la servlet e restituisce il WAR pronto per Tomcat."""
    pom = JAVA / "pom.xml"
    if not pom.is_file():
        raise StartupError("File servlet-java/pom.xml non trovato.")

    maven = prepare_maven()
    LOGS.mkdir(parents=True, exist_ok=True)
    repository = RUNTIME / "maven-repository"
    repository.mkdir(parents=True, exist_ok=True)
    log_path = LOGS / "maven-build.log"

    arguments = [
        "--batch-mode",
        "--no-transfer-progress",
        f"-Dmaven.repo.local={repository}",
        "-DskipTests",
        "clean",
        "package",
    ]
    command = _maven_command(maven, arguments)
    environment = os.environ.copy()
    environment["MAVEN_USER_HOME"] = str(RUNTIME / "maven-home")

    print("Compilazione Maven della servlet...")
    process = subprocess.run(
        command,
        cwd=str(JAVA),
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )
    log_path.write_text(
        (process.stdout or "") + "\n" + (process.stderr or ""),
        encoding="utf-8",
    )
    if process.returncode != 0:
        raise StartupError(
            "Compilazione della servlet Java non riuscita. "
            "Consultare .runtime/logs/maven-build.log."
        )

    war = JAVA / "target" / "migration-servlet.war"
    if not war.is_file() or war.stat().st_size == 0:
        raise StartupError(
            "Maven ha terminato senza produrre servlet-java/target/migration-servlet.war. "
            "Consultare .runtime/logs/maven-build.log."
        )
    return war
