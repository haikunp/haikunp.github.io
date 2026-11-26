import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_SRC = ROOT / "src" / "data"
SIGCAMP_FILE = DATA_SRC / "sigcamp.yml"
CPU_FILE = DATA_SRC / "cpu-coins.yml"
DATA = ROOT / "dashboard" / "data"
STATE_FILE = DATA / "state.json"

DEFAULT = {
    "github": {
        "owner": "haikunp",
        "repo": "haikunp.github.io",
        "branch": "main",
        "token_env": "MINIADDA_GITHUB_TOKEN",
        "base_path": "",
    },
}


def _load_dotenv():
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


_load_dotenv()


def ensure_dirs():
    DATA.mkdir(parents=True, exist_ok=True)
    DATA_SRC.mkdir(parents=True, exist_ok=True)


def load_state():
    ensure_dirs()
    if not STATE_FILE.exists():
        save_state(DEFAULT)
        return json.loads(json.dumps(DEFAULT))
    try:
        user = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except Exception:
        user = {}
    out = json.loads(json.dumps(DEFAULT))
    for k, v in user.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k].update(v)
        else:
            out[k] = v
    return out


def save_state(state):
    ensure_dirs()
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def github_token():
    state = load_state()
    env_name = state["github"].get("token_env", "MINIADDA_GITHUB_TOKEN")
    return os.environ.get(env_name, "").strip()
