import socket
import time
import urllib.error
import urllib.request

from .errors import StartupError


def port_open(port: int) -> bool:
    with socket.socket() as connection:
        connection.settimeout(0.5)
        return connection.connect_ex(("127.0.0.1", port)) == 0


def wait_for(url: str, timeout: int) -> None:
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status < 500:
                    return
        except urllib.error.HTTPError as exception:
            last_error = exception
            if exception.code < 500:
                return
        except Exception as exception:
            last_error = exception
        time.sleep(1)
    suffix = f" ({last_error})" if last_error else ""
    raise StartupError(f"Servizio non disponibile: {url}{suffix}")
