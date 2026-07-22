import platform
import sys
import traceback

from .paths import CONFIG, ROOT
from .postgres_runtime import find_postgres_bin
from .preflight import verify_prerequisites
from .settings import load_settings


def main() -> int:
    print(f"Cartella progetto: {ROOT}")
    print(f"Sistema operativo: {platform.platform()}")
    print(f"Interprete: {sys.executable}")
    print(f"Versione Python: {sys.version.split()[0]}")
    print(f"config.ini: {'presente' if CONFIG.exists() else 'mancante'}")
    try:
        settings = load_settings()
        print(f"URL remoto: {settings.remote.base_url}")
        print(f"Porte: PostgreSQL={settings.postgres.port}, Django={settings.local.django_port}, Tomcat={settings.local.tomcat_port}")
    except Exception as exc:
        print(f"ERRORE CONFIGURAZIONE: {exc}")
    try:
        runtime = verify_prerequisites(install_missing=False)
        print(f"Java: {runtime.java}")
    except Exception as exc:
        print(f"ERRORE JAVA/PYTHON: {exc}")
    try:
        print(f"PostgreSQL bin: {find_postgres_bin()}")
    except Exception as exc:
        print(f"ERRORE POSTGRESQL: {exc}")
    print("\nLa diagnostica non avvia né modifica i servizi.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception:
        traceback.print_exc()
        raise SystemExit(1)
