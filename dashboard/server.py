import json
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import config, prices, content, publish


def _read_ui():
    return (config.ROOT / "dashboard" / "ui.html").read_text(encoding="utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "MiniAddaDash/1.0"

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
            elif self.path == "/api/articles":
                self._json({"ok": True, "articles": content.list_articles()})
            elif self.path.startswith("/api/articles/"):
                slug = self.path.split("/api/articles/", 1)[1]
                a = content.get_article(slug)
                self._json(a or {"ok": False, "error": "not found"}, 200 if a else 404)
            elif self.path == "/api/sigcamp":
                self._json({"ok": True, "campaigns": content.list_sigcamp()})
            elif self.path.startswith("/api/sigcamp/"):
                slug = self.path.split("/api/sigcamp/", 1)[1]
                c = content.get_sigcamp(slug)
                self._json(c or {"ok": False, "error": "not found"}, 200 if c else 404)
            else:
                self._json({"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, 500)

    def do_POST(self):
        try:
            if self.path == "/api/state":
                state = config.load_state()
                body = self._body()
                state.update(body)
                config.save_state(state)
                self._json({"ok": True})
            elif self.path == "/api/articles":
                b = self._body()
                slug, _ = content.save_article(b.get("slug"), b.get("data", {}), b.get("body", ""))
                self._json({"ok": True, "slug": slug})
            elif self.path == "/api/sigcamp":
                b = self._body()
                slug, _ = content.save_sigcamp(b.get("slug"), b.get("data", {}), b.get("body", ""))
                self._json({"ok": True, "slug": slug})
            elif self.path == "/api/publish":
                self._json(self._publish(self._body()))
            else:
                self._json({"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, 500)

    def do_DELETE(self):
        try:
            if self.path.startswith("/api/articles/"):
                slug = self.path.split("/api/articles/", 1)[1]
                self._json({"ok": content.delete_article(slug)})
            elif self.path.startswith("/api/sigcamp/"):
                slug = self.path.split("/api/sigcamp/", 1)[1]
                self._json({"ok": content.delete_sigcamp(slug)})
            else:
                self._json({"error": "not found"}, 404)
        except Exception as e:  # noqa: BLE001
            self._json({"ok": False, "error": str(e)}, 500)

    def _publish(self, b):
        """Publish selected content types (articles, sigcamp, prices) via GitHub."""
        what = b.get("what", ["articles", "sigcamp"])
        files = {}
        if "articles" in what:
            for a in content.list_articles():
                files[content.article_repo_path(a["id"])] = (config.ARTICLES / f"{a['id']}.md").read_text(encoding="utf-8")
        if "sigcamp" in what:
            for c in content.list_sigcamp():
                files[content.sigcamp_repo_path(c["id"])] = (config.SIGCAMP / f"{c['id']}.md").read_text(encoding="utf-8")
        # prices are baked at build time by CI; nothing else to push unless the
        # user edited src/lib/coins.ts. We just commit content here.
        if not files:
            return {"ok": False, "error": "Nothing to publish"}
        msg = b.get("message") or "Dashboard: update content"
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
