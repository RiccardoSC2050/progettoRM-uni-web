import contextlib
import os
import subprocess
import sys
import traceback
import webbrowser

from .configuration import write_service_configuration
from .errors import StartupError
from .maven_runtime import build_war
from .network import wait_for
from .paths import LOGS, RUNTIME
from .postgres_runtime import ensure_postgres
from .preflight import verify_prerequisites
from .python_runtime import check_project, prepare_python
from .services import start_django
from .settings import load_settings
from .tomcat import deploy, prepare_tomcat, start as start_tomcat


class Tee:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data):
        for stream in self.streams:
            stream.write(data)
            stream.flush()
        return len(data)

    def flush(self):
        for stream in self.streams:
            stream.flush()


def _open_browser(url: str) -> None:
    try:
        if os.name == "nt" and hasattr(os, "startfile"):
            os.startfile(url)  # type: ignore[attr-defined]
            return
        if webbrowser.open_new_tab(url):
            return
    except Exception:
        pass
    print("Apertura automatica non riuscita: copiare manualmente il link nel browser.")


def _run() -> int:
    RUNTIME.mkdir(exist_ok=True)
    LOGS.mkdir(parents=True, exist_ok=True)
    settings = load_settings()

    print("[1/8] Controllo dei prerequisiti...")
    runtime = verify_prerequisites()
    print(f"      {runtime.python}")
    print(f"      {runtime.java}")

    print("[2/8] Preparazione di PostgreSQL locale...")
    ensure_postgres(settings.postgres.port)
    write_service_configuration(settings)

    print("[3/8] Preparazione dell'ambiente Python...")
    python = prepare_python()
    check_project(python)

    print("[4/8] Compilazione della servlet Java...")
    war = build_war()

    print("[5/8] Preparazione di Tomcat locale...")
    tomcat = prepare_tomcat(settings.local.tomcat_port)
    deploy(war, tomcat)

    print("[6/8] Avvio del servizio Django...")
    start_django(python, settings.local)
    django_url = f"http://127.0.0.1:{settings.local.django_port}/api/migration/health/"
    wait_for(django_url, 45)

    print("[7/8] Avvio della servlet Java su Tomcat...")
    start_tomcat(tomcat, settings.local.tomcat_port)
    app_url = f"http://127.0.0.1:{settings.local.tomcat_port}/migration-servlet/"
    browser_url = (
        f"http://127.0.0.1:{settings.local.django_port}"
        "/api/migration/browser/?database=DATABASE1"
    )
    wait_for(app_url, 90)

    print("[8/8] Servizi pronti. Apertura dell'applicazione...")
    print("")
    print("============================================================")
    print(" LINK UTILI")
    print("============================================================")
    print(f" Sito locale per importare: {app_url}")
    print(f" Visualizzatore PostgreSQL: {browser_url}")
    print("")
    print(" Connessione PostgreSQL:")
    print(f"   Host: {settings.postgres.host}")
    print(f"   Porta: {settings.postgres.port}")
    print(f"   Utente: {settings.postgres.user}")
    print("   Password: nessuna")
    print(f"   Database amministrativo: {settings.postgres.database}")
    print("============================================================")
    print("")
    _open_browser(app_url)
    return 0


def main() -> int:
    LOGS.mkdir(parents=True, exist_ok=True)
    log_path = LOGS / "launcher.log"
    with log_path.open("a", encoding="utf-8") as log:
        log.write("\n\n=== NUOVO AVVIO ===\n")
        tee_out = Tee(sys.stdout, log)
        tee_err = Tee(sys.stderr, log)
        with contextlib.redirect_stdout(tee_out), contextlib.redirect_stderr(tee_err):
            try:
                return _run()
            except (StartupError, subprocess.CalledProcessError) as exception:
                print(f"\nERRORE: {exception}", file=sys.stderr)
                return 1
            except Exception:
                print("\nERRORE IMPREVISTO:", file=sys.stderr)
                traceback.print_exc()
                print(f"Dettagli completi salvati in: {log_path}", file=sys.stderr)
                return 1


if __name__ == "__main__":
    raise SystemExit(main())
