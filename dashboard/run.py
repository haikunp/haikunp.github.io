#!/usr/bin/env python3
"""Launch the MiniAdda dashboard (signature campaigns + CPU mining coins)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dashboard.server import run

if __name__ == "__main__":
    run()
