from .paths import DJANGO, JAVA
from .settings import Settings


def write_service_configuration(settings: Settings) -> None:
    postgres = settings.postgres
    django_env = "\n".join([
        "DJANGO_SECRET_KEY=progetto2-local-secret",
        "DJANGO_DEBUG=false",
        "DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost",
        f"POSTGRES_ADMIN_DB={postgres.database}",
        f"POSTGRES_USER={postgres.user}",
        f"POSTGRES_PASSWORD={postgres.password}",
        f"POSTGRES_HOST={postgres.host}",
        f"POSTGRES_PORT={postgres.port}",
        "",
    ])
    (DJANGO / ".env").write_text(django_env, encoding="utf-8")

    local = settings.local
    properties = "\n".join([
        f"remote.base.url={settings.remote.base_url}",
        f"django.base.url=http://127.0.0.1:{local.django_port}/api/migration",
        f"migration.page.size={local.page_size}",
        "",
    ])
    path = JAVA / "src/main/resources/application.properties"
    path.write_text(properties, encoding="utf-8")
