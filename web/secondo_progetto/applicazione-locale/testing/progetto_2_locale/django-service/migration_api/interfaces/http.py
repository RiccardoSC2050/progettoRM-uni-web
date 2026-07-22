"""Utility condivise dai controller HTTP JSON."""

import json
from json import JSONDecodeError

from django.http import JsonResponse


def read_json(request) -> dict:
    try:
        payload = json.loads(request.body.decode("utf-8"))
    except (JSONDecodeError, UnicodeDecodeError) as exception:
        raise ValueError("JSON non valido.") from exception

    if not isinstance(payload, dict):
        raise ValueError("Il corpo JSON deve essere un oggetto.")
    return payload


def success(**payload) -> JsonResponse:
    return JsonResponse({"success": True, **payload})


def failure(message: str, status: int) -> JsonResponse:
    return JsonResponse({"success": False, "message": message}, status=status)
