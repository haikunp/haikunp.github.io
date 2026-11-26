import json
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import config, prices, content, publish

TABLE_NAMES = ("sigcamp", "cpu")


def _read_ui():
    return (config.ROOT / "dashboard" / "ui.html").read_text(encoding="utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "MiniAddaDash/2.0"

    def log_message(self, fmt, *args):
        pass

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _html(self, html, status=200):
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        if not n:
            return {}
        return json.loads(self.rfile.read(n).decode("utf-8"))

    def do_GET(self):
        try:
            if self.path == "/" or self.path.startswith("/?"):
                self._html(_read_ui())
            elif self.path == "/api/state":
                self._json(config.load_state())
            elif self.path == "/api/token":
                self._json(publish.check_token())
            elif self.path == "/api/prices":
                p, src = prices.fetch_prices(force=True)
                self._json({"ok": True, "prices": p, "source": src, "coins": prices.COINS})
            elif self.path.startswith("/api/table/"):
                name = self.path.split("/api/table/", 1)[1]
                if name not in TABLE_NAMES:
                    return self._json({"error": "not found"}, 404)
                self._json({"ok": True, "rows": content.list_rows(name)})
            else:
                self._json({"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, 500)

    def do_POST(self):
        try:
            if self.path.startswith("/api/table/"):
                name = self.path.split("/api/table/", 1)[1]
                if name not in TABLE_NAMES:
                    return self._json({"error": "not found"}, 404)
                b = self._body()
                rows = content.save_rows(name, b.get("rows", []))
                self._json({"ok": True, "rows": rows})
            elif self.path == "/api/publish":
                self._json(self._publish(self._body()))
            else:
                self._json({"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, 500)

    def _publish(self, b):
        """Publish selected tables via GitHub in one commit."""
        what = b.get("what", list(TABLE_NAMES))
        files = {}
        for name in what:
            if name not in TABLE_NAMES:
                continue
            path = content.TABLES[name]["file"]
            if path.exists():
                files[content.repo_path(name)] = path.read_text(encoding="utf-8")
        if not files:
            return {"ok": False, "error": "Nothing to publish"}
        msg = b.get("message") or "Dashboard: update tables"
        res = publish.publish(files, msg)
        return {"ok": True, "published": res}


def run(host="127.0.0.1", port=8787, open_browser=True):
    config.ensure_dirs()
    httpd = ThreadingHTTPServer((host, port), Handler)
    url = f"http://{host}:{port}/"
    print(f"MiniAdda dashboard at {url}")
    if open_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        httpd.server_close()
