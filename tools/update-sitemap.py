#!/usr/bin/env python3
"""sitemap.xml の lastmod を、各ページのファイルの最終更新日にそろえる。

コミットに入るページは今日、それ以外は最後にコミットされた日。.githooks/pre-commit から呼ぶ
(git config core.hooksPath .githooks を一度だけ設定)。

あわせて、製品のフォルダ(kasane-diary/ など)ごとに <フォルダ>/sitemap.xml を切り出す。
Search Console のプロパティが URL プレフィックス(https://nobuhiko.github.io/kasane-diary/)なので、
ルートの sitemap.xml はプロパティの外になり送信できないため(2026-10-19)。
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
    split(new)


def split(sitemap: str) -> None:
    urls = re.findall(r"<url><loc>[^<]+</loc><lastmod>[^<]*</lastmod></url>", sitemap)
    dirs: dict[str, list[str]] = {}
    for u in urls:
        rel = re.search(r"<loc>([^<]+)</loc>", u).group(1)[len(BASE):]
        if "/" in rel:
            dirs.setdefault(rel.split("/", 1)[0], []).append(u)
    for d, us in dirs.items():
        body = '<?xml version="1.0" encoding="UTF-8"?>\n<!-- tools/update-sitemap.py がルートの sitemap.xml から作る。手で直さない -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join("  " + u for u in us) + "\n</urlset>\n"
        out = ROOT / d / "sitemap.xml"
        if not out.exists() or out.read_text() != body:
            out.write_text(body)
            print(f"{d}/sitemap.xml を更新")


if __name__ == "__main__":
    main()
