import os
import signal
import subprocess

from .java_runtime import find_java
from .paths import PIDS
from .postgres_runtime import stop_postgres
from .tomcat import local_tomcat_home, stop as stop_tomcat


def _stop_django() -> None:
    pid_file = PIDS / "django.pid"
    if not pid_file.exists():
        return
    try:
        pid = int(pid_file.read_text(encoding="utf-8"))
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/T", "/F"],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            os.kill(pid, signal.SIGTERM)
    except (ValueError, ProcessLookupError):
        pass
    finally:
        pid_file.unlink(missing_ok=True)


def main() -> int:
    print("Arresto di Django...")
    _stop_django()
    print("Arresto di Tomcat...")
    find_java()
    stop_tomcat(local_tomcat_home())
    print("Arresto di PostgreSQL locale...")
    stop_postgres()
    print("Servizi arrestati.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
