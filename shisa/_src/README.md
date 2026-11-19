# shisa/ の日本語のページの直し方

`shisa/index.html`・`shisa/wordpress/index.html`・`shisa/ec-cube-php/index.html` は、ここにある原稿から道具が作る。**作られた index.html は手で直さない。**

1. 原稿を直す: `shisa/_src/index.html`(EC-CUBE の LP)、`wordpress.html`(WordPress の LP)、`ec-cube-php.html`(対応表)。先頭の `<!--meta ... -->` に、題・説明・構造化データが入っている
2. ページを作り直す: `python3 tools/build-shisa.py`
3. `git add shisa tools && git commit`(sitemap.xml の日付は、コミットのときに自動で変わる)。main に push すると公開される

- 見た目は `shisa/shisa.css` の 1 枚。変えたら `tools/build-shisa.py` の `CSS_VER` を進める(古い CSS が残らないように)
- 上の帯・フッター・head は `tools/build-shisa.py` が付ける
- 共有用の画像(og.png)の元は `tools/og/`。Chrome で 1200x630 に撮る
- よくある質問を足したら、meta の FAQPage にも同じ文を入れる(画面に無い質問をデータにだけ入れない)
- `llms.txt` にも、対応バージョン・料金・URL が書いてある。変えたらそろえる
- 決まり: 不要なラベルや説明を避け、レイアウトに説明させる。時事の話(PHP の脆弱性など)は対応表のページに書き、LP には事例の 1 つとして 1 行だけ
- 利用規約(`shisa/terms.html`)と英語版(`en/shisa/`)は、この道具の外。直接直す
