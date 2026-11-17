import base64
import json
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from . import config

API = "https://api.github.com"


class GitHubError(Exception):
    pass


def _req(method, path, token, body=None):
    url = API + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    req.add_header("User-Agent", "MiniAdda-Publisher")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")
            if e.code >= 500 or e.code == 429:
                time.sleep(2 * (attempt + 1))
                continue
            raise GitHubError(f"GitHub API {method} {path} -> {e.code}: {detail}") from e
        except Exception:
            time.sleep(2 * (attempt + 1))
    raise GitHubError(f"GitHub API {method} {path} failed after retries")


def _ref_sha(token, owner, repo, branch):
    try:
        return _req("GET", f"/repos/{owner}/{repo}/git/ref/heads/{branch}", token)["object"]["sha"]
    except GitHubError as e:
        if "404" in str(e):
            return None
        raise


def _head_commit(token, owner, repo, sha):
    return _req("GET", f"/repos/{owner}/{repo}/git/commits/{sha}", token)


def _as_bytes(content):
    return content if isinstance(content, bytes) else str(content).encode("utf-8")


def publish(files, message):
    """Commit {repo_path: str|bytes} to the configured repo+branch.

    Returns {commit, url, files}. Raises GitHubError on auth/failure.
    """
    state = config.load_state()
    token = config.github_token()
    if not token:
        raise GitHubError("No GitHub token. Add MINIADDA_GITHUB_TOKEN to miniadda/.env")
    gh = state["github"]
    owner, repo, branch = gh["owner"], gh["repo"], gh["branch"]
    base_path = gh.get("base_path", "").strip("/")

    head_sha = _ref_sha(token, owner, repo, branch)
    if head_sha:
        base_tree = _head_commit(token, owner, repo, head_sha)["tree"]["sha"]
        parents = [head_sha]
    else:
        base_tree = None
        parents = []

    wanted = {}
    for rel, content in files.items():
        full = f"{base_path}/{rel}".strip("/") if base_path else rel
        wanted[full] = content

    def _blob(item):
        full, content = item
        blob = _req("POST", f"/repos/{owner}/{repo}/git/blobs", token, {
            "content": base64.b64encode(_as_bytes(content)).decode("ascii"),
            "encoding": "base64",
        })
        return {"path": full, "mode": "100644", "type": "blob", "sha": blob["sha"]}

    with ThreadPoolExecutor(max_workers=8) as pool:
        tree = list(pool.map(_blob, wanted.items()))

    new_tree = _req("POST", f"/repos/{owner}/{repo}/git/trees", token, {
        "base_tree": base_tree, "tree": tree,
    })
    commit = _req("POST", f"/repos/{owner}/{repo}/git/commits", token, {
        "message": message, "tree": new_tree["sha"], "parents": parents,
    })
    if head_sha:
        _req("PATCH", f"/repos/{owner}/{repo}/git/refs/heads/{branch}", token, {
            "sha": commit["sha"], "force": False,
        })
    else:
        _req("POST", f"/repos/{owner}/{repo}/git/refs", token, {
            "ref": f"refs/heads/{branch}", "sha": commit["sha"],
        })
    return {
        "commit": commit["sha"],
        "url": f"https://github.com/{owner}/{repo}/commit/{commit['sha']}",
        "files": len(tree),
    }


def check_token():
    state = config.load_state()
    token = config.github_token()
    if not token:
        return {"ok": False, "error": "No token set"}
    gh = state["github"]
    try:
        r = _req("GET", f"/repos/{gh['owner']}/{gh['repo']}", token)
        return {"ok": True, "repo": r["full_name"], "default_branch": r["default_branch"],
                "private": r["private"], "permissions": r.get("permissions", {})}
    except GitHubError as e:
        return {"ok": False, "error": str(e)}
