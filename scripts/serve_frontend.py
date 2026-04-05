#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class FrontendHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str, **kwargs):
        self._site_dir = Path(directory)
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:
        if self.path in {"/healthz", "/healthz/"}:
            body = b'{"status":"ok","service":"accrediops-frontend"}'
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def list_directory(self, path: str):
        body = (
            "<!doctype html><html><body><h1>Directory listing disabled</h1>"
            f"<p>{html.escape(path)}</p></body></html>"
        ).encode("utf-8")
        self.send_response(HTTPStatus.FORBIDDEN)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        return None

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the AccrediOps operator shell.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8013)
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1] / "frontend" / "site"),
    )
    args = parser.parse_args()

    site_root = Path(args.root).resolve()
    if not site_root.exists():
        raise SystemExit(f"Frontend root does not exist: {site_root}")

    os.chdir(site_root)
    handler = lambda *a, **kw: FrontendHandler(*a, directory=str(site_root), **kw)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
