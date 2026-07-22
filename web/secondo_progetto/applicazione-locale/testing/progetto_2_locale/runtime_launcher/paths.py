from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUNTIME = ROOT / ".runtime"
TOOLS = RUNTIME / "tools"
LOGS = RUNTIME / "logs"
DOWNLOADS = RUNTIME / "downloads"
PIDS = RUNTIME / "pids"
CONFIG = ROOT / "config.ini"
DJANGO = ROOT / "django-service"
JAVA = ROOT / "servlet-java"
POSTGRES_DATA = RUNTIME / "postgres-data"
