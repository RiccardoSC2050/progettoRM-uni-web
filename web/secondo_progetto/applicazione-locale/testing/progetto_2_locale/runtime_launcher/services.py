import subprocess
from pathlib import Path

from .errors import StartupError
from .network import port_open
from .paths import DJANGO, LOGS, PIDS
from .settings import LocalSettings


def start_django(python: Path, settings: LocalSettings) -> None:
    if port_open(settings.django_port):
        print(f"      Django risulta già attivo sulla porta {settings.django_port}: riutilizzo il servizio.")
        return
    LOGS.mkdir(parents=True, exist_ok=True)
    PIDS.mkdir(parents=True, exist_ok=True)
    log_path = LOGS / "django.log"
    with log_path.open("a", encoding="utf-8") as output:
        process = subprocess.Popen(
            [
                str(python),
                "manage.py",
                "runserver",
                f"127.0.0.1:{settings.django_port}",
                "--noreload",
            ],
            cwd=str(DJANGO),
            stdout=output,
            stderr=subprocess.STDOUT,
        )
    (PIDS / "django.pid").write_text(str(process.pid), encoding="utf-8")
