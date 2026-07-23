import os
import shutil
import subprocess
import time
import urllib.request
import zipfile
from pathlib import Path

from .errors import StartupError
from .java_runtime import ensure_java, java_environment
from .network import port_open
from .paths import DOWNLOADS, LOGS, PIDS, TOOLS

TOMCAT_VERSION = "9.0.102"
TOMCAT_URL = (
    "https://archive.apache.org/dist/tomcat/tomcat-9/"
    f"v{TOMCAT_VERSION}/bin/apache-tomcat-{TOMCAT_VERSION}.zip"
)


def prepare_tomcat(port: int) -> Path:
    home = TOOLS / f"apache-tomcat-{TOMCAT_VERSION}"
    startup = _script(home, "startup")
    if not startup.exists():
        TOOLS.mkdir(parents=True, exist_ok=True)
        DOWNLOADS.mkdir(parents=True, exist_ok=True)
        archive = DOWNLOADS / f"apache-tomcat-{TOMCAT_VERSION}.zip"
        print("Installazione locale automatica di Tomcat nella cartella del progetto...")
        try:
            partial = archive.with_suffix(archive.suffix + ".part")
            partial.unlink(missing_ok=True)
            if not archive.exists() or not zipfile.is_zipfile(archive):
                archive.unlink(missing_ok=True)
                request = urllib.request.Request(
                    TOMCAT_URL,
                    headers={"User-Agent": "Progetto2-Launcher/1.0"},
                )
                with urllib.request.urlopen(request, timeout=300) as response, partial.open("wb") as output:
                    shutil.copyfileobj(response, output)
                partial.replace(archive)
            if not zipfile.is_zipfile(archive):
                raise StartupError("L'archivio Tomcat scaricato non è valido.")
            with zipfile.ZipFile(archive) as package:
                package.extractall(TOOLS)
        except Exception as exc:
            raise StartupError(
                "Impossibile scaricare Tomcat. Controllare la connessione Internet e riprovare."
            ) from exc
        finally:
            archive.with_suffix(archive.suffix + ".part").unlink(missing_ok=True)

    if not startup.exists():
        raise StartupError("Installazione locale di Tomcat non riuscita.")

    if os.name != "nt":
        for name in ("startup", "shutdown", "catalina"):
            script = _script(home, name)
            if script.exists():
                script.chmod(script.stat().st_mode | 0o111)

    _configure_port(home, port)
    return home


def deploy(war: Path, tomcat: Path) -> None:
    webapps = tomcat / "webapps"
    exploded = webapps / "migration-servlet"
    deployed_war = webapps / "migration-servlet.war"
    if exploded.exists():
        shutil.rmtree(exploded)
    deployed_war.unlink(missing_ok=True)
    shutil.copy2(war, deployed_war)


def start(tomcat: Path, port: int) -> None:
    if port_open(port):
        print(f"      Tomcat risulta già attivo sulla porta {port}: riutilizzo il servizio.")
        return

    LOGS.mkdir(parents=True, exist_ok=True)
    PIDS.mkdir(parents=True, exist_ok=True)
    java, _ = ensure_java()
    env = java_environment(java)
    env["CATALINA_HOME"] = str(tomcat)
    env["CATALINA_BASE"] = str(tomcat)
    catalina = _script(tomcat, "catalina")

    try:
        if os.name == "nt":
            creationflags = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)
            process = subprocess.Popen(
                ["cmd.exe", "/d", "/s", "/c", str(catalina), "run"],
                cwd=str(tomcat),
                env=env,
                creationflags=creationflags,
            )
        else:
            log_path = LOGS / "tomcat.log"
            output = log_path.open("a", encoding="utf-8")
            process = subprocess.Popen(
                [str(catalina), "run"],
                cwd=str(tomcat),
                env=env,
                stdout=output,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
    except OSError as exc:
        raise StartupError(
            "Tomcat non si è avviato. Consultare .runtime/logs e riprovare."
        ) from exc

    (PIDS / "tomcat.pid").write_text(str(process.pid), encoding="utf-8")


def stop(tomcat: Path) -> None:
    script = _script(tomcat, "shutdown")
    if not script.exists():
        return
    java, _ = ensure_java()
    env = java_environment(java)
    env["CATALINA_HOME"] = str(tomcat)
    env["CATALINA_BASE"] = str(tomcat)
    subprocess.run(
        [str(script)],
        cwd=str(tomcat),
        env=env,
        check=False,
        text=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    (PIDS / "tomcat.pid").unlink(missing_ok=True)
    time.sleep(1)


def local_tomcat_home() -> Path:
    return TOOLS / f"apache-tomcat-{TOMCAT_VERSION}"


def _script(home: Path, name: str) -> Path:
    extension = ".bat" if os.name == "nt" else ".sh"
    return home / "bin" / f"{name}{extension}"


def _configure_port(home: Path, port: int) -> None:
    server_xml = home / "conf" / "server.xml"
    if not server_xml.exists():
        raise StartupError("Configurazione Tomcat non trovata.")
    text = server_xml.read_text(encoding="utf-8")
    marker = 'protocol="HTTP/1.1"'
    position = text.find(marker)
    if position < 0:
        raise StartupError("Connettore HTTP di Tomcat non trovato.")
    start = text.rfind("<Connector", 0, position)
    end = text.find(">", position)
    connector = text[start:end + 1]
    import re
    updated = re.sub(r'port="\d+"', f'port="{port}"', connector, count=1)
    if updated != connector:
        text = text[:start] + updated + text[end + 1:]
        server_xml.write_text(text, encoding="utf-8")
