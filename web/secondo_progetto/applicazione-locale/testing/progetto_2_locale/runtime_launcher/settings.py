import configparser
from dataclasses import dataclass

from .errors import StartupError
from .paths import CONFIG


@dataclass(frozen=True)
class RemoteSettings:
    base_url: str


@dataclass(frozen=True)
class PostgresSettings:
    database: str
    user: str
    password: str
    host: str
    port: int


@dataclass(frozen=True)
class LocalSettings:
    django_port: int
    tomcat_port: int
    page_size: int


@dataclass(frozen=True)
class Settings:
    remote: RemoteSettings
    postgres: PostgresSettings
    local: LocalSettings


def load_settings() -> Settings:
    parser = configparser.ConfigParser()
    if not CONFIG.exists():
        raise StartupError("File config.ini non trovato.")
    try:
        parser.read(CONFIG, encoding="utf-8")
        remote_url = parser["remote"]["base_url"].rstrip("/")
        if not remote_url.startswith(("http://", "https://")):
            raise StartupError("remote.base_url non è un indirizzo HTTP valido.")
        return Settings(
            remote=RemoteSettings(remote_url),
            postgres=PostgresSettings(
                database=parser["postgres"].get("database", "postgres"),
                user=parser["postgres"].get("user", "postgres"),
                password=parser["postgres"].get("password", ""),
                host=parser["postgres"].get("host", "127.0.0.1"),
                port=parser["postgres"].getint("port", fallback=55432),
            ),
            local=LocalSettings(
                django_port=parser["local"].getint("django_port", fallback=8000),
                tomcat_port=parser["local"].getint("tomcat_port", fallback=8080),
                page_size=parser["local"].getint("page_size", fallback=500),
            ),
        )
    except (KeyError, ValueError, configparser.Error) as exc:
        raise StartupError(f"config.ini non valido: {exc}") from exc
