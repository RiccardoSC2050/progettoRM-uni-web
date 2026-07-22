from django.urls import path

from migration_api.interfaces import api_views, browser_views

urlpatterns = [
    path("health/", api_views.health, name="migration-health"),
    path("databases/", api_views.databases, name="migration-databases"),
    path("browser/", browser_views.database_browser, name="migration-database-browser"),
    path(
        "browser/style.css",
        browser_views.database_browser_stylesheet,
        name="migration-browser-style",
    ),
    path(
        "databases/delete/",
        api_views.delete_database,
        name="migration-delete-database",
    ),
    path(
        "databases/prepare/",
        api_views.prepare_database,
        name="migration-prepare-database",
    ),
    path(
        "import/<str:resource>/",
        api_views.import_resource,
        name="migration-import",
    ),
]
