#!/usr/bin/env python3
"""sitemap.xml の lastmod を、各ページのファイルの最終更新日にそろえる。

コミットに入るページは今日、それ以外は最後にコミットされた日。.githooks/pre-commit から呼ぶ
(git config core.hooksPath .githooks を一度だけ設定)。
"""
import datetime
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
BASE = "https://nobuhiko.github.io/"


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def path_of(loc: str) -> str:
    rel = loc[len(BASE):]
    return rel + "index.html" if rel == "" or rel.endswith("/") else rel


def main() -> None:
    staged = set(git("diff", "--cached", "--name-only").splitlines())
    today = datetime.date.today().isoformat()
    s = SITEMAP.read_text()

    def repl(m: re.Match) -> str:
        loc = m.group(1)
        f = path_of(loc)
        if f in staged:
            d = today
        else:
            d = git("log", "-1", "--format=%cs", "--", f) or today
        return f"<url><loc>{loc}</loc><lastmod>{d}</lastmod></url>"

    new = re.sub(r"<url><loc>([^<]+)</loc><lastmod>[^<]*</lastmod></url>", repl, s)
    if new != s:
        SITEMAP.write_text(new)
        print("sitemap.xml を更新")


if __name__ == "__main__":
    main()
