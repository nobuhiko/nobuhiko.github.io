# umiushi-lab.com(会社のサイト)

静的なファイルをそのまま出す。組み立ては無い(`shisa/` だけ `tools/build-shisa.py` で作る)。

## 出し方(2026-11-24〜、Cloudflare Workers へ移す途中)

- 置き場は Cloudflare Workers `umiushi-lab-site`(`wrangler.jsonc`、`worker/index.js`)。ファイルはリポジトリの直下をそのまま出す。出さないものは `.assetsignore`
- **DNS を切り替えるまでは、本番はまだ GitHub Pages**(main に push すると出る)。切り替えたら、この行を消して「main に入ると Cloudflare の自動ビルドが出す」に書き換える
- 仮の URL: https://umiushi-lab-site.redsnow-kissmark.workers.dev (検索に載らないよう noindex を付けてある)
- URL の形は GitHub Pages のときと同じ(`/shisa` → `/shisa/` へ 301、`/tokushoho.html` も `/tokushoho` も 200、無ければ `404.html`)。`worker/index.js` の `serve` がやっている。ストアの審査に出した URL(プライバシーポリシー、特商法)を変えないため、ここは崩さない

## 外に貼った画像を数える

オーナーズストアのプラグインのページは、見られた回数が分からない。説明文に貼った自分の画像が取りに来られた回数を、その目安にする(本人 2026-11-24)。

- 数える画像は `worker/index.js` の `COUNTED`(と `/os/` の下ぜんぶ)。プラグインごとに別の画像を貼る(ストアからは「どのページから来たか」が届かないので、画像のパスで見分ける)
- 数えるのは、参照元が ec-cube.net か wordpress.org のときだけ。ロボットは外す
- 置き場は D1 `umiushi-lab-site` の `hits`(日付・パス・参照元・回数)。IP や端末の情報は残さない
- 見る: `npx wrangler d1 execute umiushi-lab-site --remote --command "SELECT * FROM hits ORDER BY day DESC LIMIT 30"`
