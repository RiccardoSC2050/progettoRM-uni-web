"""Controller HTML del visualizzatore PostgreSQL locale."""

from pathlib import Path

from django.http import HttpResponse
from django.shortcuts import render
from django.utils.html import escape
from django.views.decorators.http import require_GET

from migration_api.application.browser_service import build_browser_context

_STYLE_PATH = (
    Path(__file__).resolve().parents[1]
    / "static"
    / "migration_api"
    / "database_browser.css"
)


@require_GET
def database_browser(request):
    try:
        return render(
            request,
            "migration_api/database_browser.html",
            build_browser_context(request.GET),
        )
    except ValueError as exception:
        return HttpResponse(
            f"<h1>Richiesta non valida</h1><p>{escape(str(exception))}</p>",
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
