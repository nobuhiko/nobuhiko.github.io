#!/usr/bin/env python3
"""ページが変わったことを、IndexNow で検索エンジン(Bing ほか)に知らせる。

  python3 tools/indexnow.py            前回送ったあとに lastmod が変わったページだけ送る
  python3 tools/indexnow.py --all      sitemap.xml の全部を送る
  python3 tools/indexnow.py --dry      送らずに、送る URL を出す

push して公開されたあとに、手元から動かす(公開の前に送ると、検索エンジンが古いページを読む)。
鍵は、サイトの一番上の <鍵>.txt(中身は鍵だけ。公開してよいもの。IndexNow の決まり)。
このサイトは GitHub Pages に直接向いていて Cloudflare を通っていないので、Cloudflare の Crawler Hints は効かない(2026-11-19)。
前回送った lastmod は .indexnow-sent.json に残す(git には入れない)。

送る前に、公開されているサイトを 2 つ確かめる。どちらかが合わなければ、送らずに止まる(記録も付けない)。
  1. 鍵のファイルが読める(読めないと、送り先は 200 を返すのに検索エンジンは捨てる)
  2. 公開中の sitemap.xml の lastmod が、手元と同じ(push がまだ反映されていないと、古いページを読まれる)
2026-11-19: 鍵のファイルを足した直後に 14 ページ送ったら、記録は「送った」なのに Bing には 1 件も入っていなかった。
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOST = "umiushi-lab.com"
SENT = ROOT / ".indexnow-sent.json"


def key() -> str:
    for f in ROOT.glob("*.txt"):
        if re.fullmatch(r"[0-9a-f]{32}", f.stem) and f.read_text().strip() == f.stem:
            return f.stem
    sys.exit("鍵のファイル(<32 桁の 16 進>.txt)が見つかりません")


def pages() -> dict[str, str]:
    xml = (ROOT / "sitemap.xml").read_text()
    return {m.group(1): m.group(2) for m in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml)}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"Cache-Control": "no-cache", "User-Agent": "umiushi-lab-indexnow"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read().decode()


def check_published(k: str, urls: list[str], now: dict[str, str]) -> None:
    """公開されているサイトが、鍵と手元の sitemap に追いついているか。追いついていなければ止まる。"""
    try:
        live_key = fetch(f"https://{HOST}/{k}.txt").strip()
    except Exception as e:  # 404 など
        sys.exit(f"鍵のファイル https://{HOST}/{k}.txt が読めません({e})。push して 1〜2 分待ってから、もう一度")
    if live_key != k:
        sys.exit(f"鍵のファイル https://{HOST}/{k}.txt の中身が鍵と違います。送りません")
    try:
        xml = fetch(f"https://{HOST}/sitemap.xml")
    except Exception as e:
        sys.exit(f"公開中の sitemap.xml が読めません({e})。送りません")
    live = {m.group(1): m.group(2) for m in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml)}
    late = [u for u in urls if live.get(u) != now[u]]
    if late:
        sys.exit("まだ公開されていないページがあります(公開中の sitemap.xml の lastmod が手元と違う)。push して 1〜2 分待ってから、もう一度:\n  " + "\n  ".join(late))


def main() -> None:
    now = pages()
    before = json.loads(SENT.read_text()) if SENT.exists() else {}
    urls = sorted(now) if "--all" in sys.argv else sorted(u for u, d in now.items() if before.get(u) != d)
    if not urls:
        print("変わったページはありません")
        return
    print("\n".join(urls))
    if "--dry" in sys.argv:
        return
    k = key()
    check_published(k, urls, now)
    body = json.dumps({"host": HOST, "key": k, "keyLocation": f"https://{HOST}/{k}.txt", "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as res:
        print(f"IndexNow: HTTP {res.status}({len(urls)} 件)")
    before.update({u: now[u] for u in urls})
    SENT.write_text(json.dumps(before, indent=1))


if __name__ == "__main__":
    main()
