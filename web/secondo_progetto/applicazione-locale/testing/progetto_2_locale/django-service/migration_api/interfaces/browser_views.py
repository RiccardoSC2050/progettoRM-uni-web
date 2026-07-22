"""Controller HTML del visualizzatore PostgreSQL locale."""

from pathlib import Path

from django.http import HttpResponse
from django.utils.html import escape
from django.shortcuts import render
from django.views.decorators.http import require_GET

from migration_api.application.database_service import available_databases
from migration_api.infrastructure.database import validate_name
from migration_api.infrastructure.database_browser import (
    MAX_VISIBLE_ROWS,
    load_database_snapshot,
)

_STYLE_PATH = (
    Path(__file__).resolve().parents[1]
    / "static"
    / "migration_api"
    / "database_browser.css"
)


@require_GET
def database_browser(request):
    try:
        available = available_databases()
        requested = (request.GET.get("database") or "").strip()
        selected = validate_name(requested) if requested else (available[0] if available else "")
        if selected and selected not in available:
            selected = ""
        tables = load_database_snapshot(selected) if selected else []
        return render(
            request,
            "migration_api/database_browser.html",
            {
                "available_databases": available,
                "selected_database": selected,
                "tables": tables,
                "max_visible_rows": MAX_VISIBLE_ROWS,
            },
        )
    except ValueError as exception:
        return HttpResponse(
            f"<h1>Nome database non valido</h1><p>{escape(str(exception))}</p>",
            status=400,
            content_type="text/html; charset=utf-8",
        )
    except Exception as exception:
        return HttpResponse(
            f"<h1>Errore PostgreSQL</h1><pre>{escape(str(exception))}</pre>",
            status=500,
            content_type="text/html; charset=utf-8",
        )


@require_GET
def database_browser_stylesheet(request):
    return HttpResponse(
        _STYLE_PATH.read_text(encoding="utf-8"),
        content_type="text/css; charset=utf-8",
    )
