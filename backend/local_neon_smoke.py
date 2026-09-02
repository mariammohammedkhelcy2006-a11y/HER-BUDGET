"""Run a read-only localhost smoke test against DATABASE_URL in .env.example."""
import json
import threading
import time
import urllib.error
import urllib.request

import uvicorn
from dotenv import load_dotenv

load_dotenv(".env.example", override=True)

from main import app  # noqa: E402


def main() -> None:
    server = uvicorn.Server(
        uvicorn.Config(app, host="127.0.0.1", port=8008, log_level="error")
    )
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    try:
        for _ in range(20):
            try:
                with urllib.request.urlopen("http://127.0.0.1:8008/health", timeout=2) as response:
                    health = json.load(response)
                break
            except Exception:
                time.sleep(0.5)
        else:
            raise RuntimeError("Localhost server did not start")

        with urllib.request.urlopen("http://127.0.0.1:8008/", timeout=5) as response:
            page = response.read().decode("utf-8")

        request = urllib.request.Request(
            "http://127.0.0.1:8008/api/auth/login",
            data=b'{"email":"missing@example.com","password":"invalid"}',
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(request, timeout=5)
            raise RuntimeError("Invalid credentials unexpectedly succeeded")
        except urllib.error.HTTPError as error:
            assert error.code == 401, error.code

        assert health == {"status": "ok", "database": "ok"}, health
        assert "HerBudget" in page
        print("Localhost frontend, Neon health, and auth protection passed")
    finally:
        server.should_exit = True
        thread.join(timeout=10)


if __name__ == "__main__":
    main()
