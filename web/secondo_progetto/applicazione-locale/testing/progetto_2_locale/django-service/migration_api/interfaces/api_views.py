"""Controller HTTP JSON del servizio locale Django."""

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from migration_api.application.database_service import (
    available_databases,
    delete_destination_database,
    import_destination_resource,
    prepare_destination_database,
)
from migration_api.interfaces.http import failure, read_json, success


@require_GET
def health(request):
    return success(service="django-migration-api")


@require_GET
def databases(request):
    try:
        return success(databases=available_databases())
    except Exception as exception:
        return failure(str(exception), 500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_database(request):
    try:
        database = delete_destination_database(read_json(request).get("database"))
        return success(database=database, deleted=True)
    except ValueError as exception:
        return failure(str(exception), 400)
    except Exception as exception:
        return failure(str(exception), 500)


@csrf_exempt
@require_POST
def prepare_database(request):
    try:
        database = prepare_destination_database(read_json(request).get("database"))
        return success(database=database, overwritten=True)
    except ValueError as exception:
        return failure(str(exception), 400)
    except Exception as exception:
        return failure(str(exception), 500)


@csrf_exempt
@require_POST
def import_resource(request, resource):
    try:
        database, selected, imported = import_destination_resource(
            resource,
            request.GET.get("database"),
            read_json(request),
        )
        return success(
            database=database,
            resource=selected.value,
            imported=imported,
        )
    except ValueError as exception:
        return failure(str(exception), 400)
    except Exception as exception:
        return failure(str(exception), 500)
