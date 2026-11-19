#!/usr/bin/env python3
"""shisa/ の日本語のページを、共通の枠(head・上の帯・パンくず・フッター)に入れて作る。

使い方: python3 tools/build-shisa.py
- 元は shisa/_src/*.html。先頭の <!--meta {...} --> に、置き場所(path)・種類(type)・題・説明・構造化データを書く
- 種類: lp(商品のページ。パンくずなし)/ hub(商品を並べるページ)/ doc(調べもののページ。パンくずあり)
- 出すのは shisa/<path>index.html。作られたファイルは手で直さない(直すのは _src と、このファイルと shisa.css)
- 見た目は shisa/shisa.css の 1 枚。決まり: 不要なラベルや説明を避け、レイアウトに説明させる
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "shisa" / "_src"
BASE = "https://umiushi-lab.com/shisa/"
HUB_NAME = "脆弱性を AI で診断・修正するプラグイン"
ORG = {"@type": "Organization", "name": "合同会社うみうしラボ", "url": "https://umiushi-lab.com/"}
CSS_VER = "20261119s"
# お知らせの帯(1 行)。時事の話(PHP の脆弱性など)は、ここと専用のページにだけ書く。
# 商品のページの本文には書かない(どのページにも同じ説明が並ぶため。2026-11-19)。空にすると帯は出ない
NOTICE = None  # 例: ("PHP2Shell に当たるかを見分けて、対策を入れます", "ec-cube-php/")。2026-11-19: 形を決めるまで出さない
GA = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-YYZQDTEPR0"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-YYZQDTEPR0');</script>"""


def build(src: Path) -> Path:
    text = src.read_text(encoding="utf-8")
    m = re.match(r"<!--meta\n(.*?)\n-->\n", text, re.S)
    meta, body = json.loads(m.group(1)), text[m.end():]
    path = meta["path"]
    up = "../" if path else ""          # shisa/ まで戻る
    root = up + "../"                   # サイトのトップまで戻る
    url = BASE + path
    graph = list(meta.get("jsonld", []))
    crumb = ""
    if meta["type"] == "doc":
        # パンくずは、うみうしラボ → 商品を並べるページ → このページ
        # 見えるパンくずは置かない(上の帯と同じ名前が並ぶだけだった。検索向けのデータにだけ入れる。2026-11-19)
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "うみうしラボ", "item": "https://umiushi-lab.com/"},
            {"@type": "ListItem", "position": 2, "name": HUB_NAME, "item": BASE},
            {"@type": "ListItem", "position": 3, "name": meta["crumb"], "item": url}]})
    alt = ""
    if meta.get("hreflang_en"):
        alt = (f'<link rel="alternate" hreflang="ja" href="{url}">\n<link rel="alternate" hreflang="en" href="{meta["hreflang_en"]}">\n'
               f'<link rel="alternate" hreflang="x-default" href="{meta["hreflang_en"]}">\n')
    notice = ""
    if NOTICE and meta["type"] in ("lp", "hub"):
        notice = f'<a class="notice" href="{up}{NOTICE[1]}"><span class="wrap">{NOTICE[0]}</span></a>\n'
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    main_open = '<main class="doc"><div class="wrap">' if meta["type"] == "doc" else "<main>"
    main_close = "</div></main>" if meta["type"] == "doc" else "</main>"
    brand = (f'<span class="name">{HUB_NAME}</span>' if not path
             else f'<a class="name" href="{up}">{HUB_NAME}</a>')
    top = f'<header class="top"><div class="wrap">{brand}<a class="lab" href="{root}">うみうしラボ</a></div></header>\n'
    out = f"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{meta["title"]}</title>
<meta name="description" content="{meta["description"]}">
<meta property="og:title" content="{meta["title"].split(" | ")[0].split("| ")[0]}">
<meta property="og:description" content="{meta["description"]}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="うみうしラボ">
<meta property="og:locale" content="ja_JP">
<meta property="og:image" content="https://umiushi-lab.com/shisa/{meta.get("og", "og.png")}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{url}">
{alt}<script type="application/ld+json">
{ld}
</script>
<link rel="icon" href="{root}favicon.ico" sizes="any">
<link rel="icon" href="{root}favicon-32.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap">
<link rel="stylesheet" href="{up}shisa.css?v={CSS_VER}">
</head>
<body class="page-{meta["type"]}{(" " + meta["theme"]) if meta.get("theme") else ""}">
{top}{notice}{crumb}{main_open}
{body.strip()}
{main_close}
<footer class="foot"><div class="wrap"><span>© 2026 <a href="{root}">合同会社うみうしラボ</a></span><span><a href="{up}terms.html">利用規約</a><a href="{root}tokushoho.html">特定商取引法に基づく表記</a></span></div></footer>
{GA}
</body>
</html>
"""
    dest = ROOT / "shisa" / path / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")
    return dest


if __name__ == "__main__":
    for f in sorted(SRC.glob("*.html")):
        print(build(f).relative_to(ROOT))
