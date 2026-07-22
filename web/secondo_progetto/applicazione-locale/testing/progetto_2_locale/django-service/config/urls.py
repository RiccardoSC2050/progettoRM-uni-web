from django.urls import include, path

urlpatterns = [
    path("api/migration/", include("migration_api.urls")),
]
