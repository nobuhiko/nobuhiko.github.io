# umiushi-lab.com(会社のサイト)

静的なファイルをそのまま出す。組み立ては無い(`shisa/` だけ `tools/build-shisa.py` で作る)。

## 出し方(2026-11-24〜、Cloudflare Workers)

- 置き場は Cloudflare Workers `umiushi-lab-site`(`wrangler.jsonc`、`worker/index.js`)。ファイルはリポジトリの直下をそのまま出す。出さないものは `.assetsignore`
- **main に入ると、Cloudflare の自動ビルドが本番へ出す**(`npx wrangler deploy`。1 分ほど)。main へは PR で入れる
- 2026-11-24 に GitHub Pages から切り替えた。GitHub Pages の設定は残してあり、古い `nobuhiko.github.io/…` の URL を umiushi-lab.com へ転送する役だけをしている(`CNAME` のファイルはそのために置いてある。消さない)
- 仮の URL: https://umiushi-lab-site.redsnow-kissmark.workers.dev (検索に載らないよう noindex を付けてある)
- URL の形は GitHub Pages のときと同じ(`/shisa` → `/shisa/` へ 301、`/tokushoho.html` も `/tokushoho` も 200、無ければ `404.html`)。`worker/index.js` の `serve` がやっている。ストアの審査に出した URL(プライバシーポリシー、特商法)を変えないため、ここは崩さない
- 戻すとき: `wrangler.jsonc` の `routes` を消して出し、DNS に A を 4 つ(185.199.108.153〜111.153)と、www の CNAME(nobuhiko.github.io)を戻す

## 外に貼った画像を数える

オーナーズストアのプラグインのページは、見られた回数が分からない。説明文に貼った自分の画像が取りに来られた回数を、その目安にする(本人 2026-11-24)。

- いま貼ってあるもの(2026-11-24):
  - `/shisa/explain-thumb.jpg` = 診断プラグイン 4.2/4.3 系のページ(product_id=3703)
  - `/shisa/lift-thumb.jpg` = 診断プラグイン 4.0/4.1 系のページ(product_id=3706)
  - `/os/data-migration.png` = データ移行プラグイン 4.2/4.3 のページ(product_id=3189。貼るのは本人)
  - `/os/shisa-flow.jpg` = 診断プラグイン 4.2/4.3 系のページ(product_id=3703)の「入れたあと、すること」の縦長の絵(2026-11-26〜。元は self-harden の docs/submit/os-page)
  - `/os/shisa-flow-41.jpg` = 同じ絵の 4.0/4.1 系のページ(product_id=3706)用。中身は shisa-flow.jpg と同じで、数えるために名前を分けた(2026-11-26〜)
  - `/os/shisa-flow-3.jpg` = 3.0 系のページ(product_id=3715)の「入れたあと、すること」の絵。3.0 のお店の画面(2026-11-26〜)
- この 2 枚の jpg は、ストアのページごとに 1 枚ずつしか使わない(同じ絵を 2 つのページに貼ると、どちらが見られたか分からなくなる)
- 数える画像は `worker/index.js` の `COUNTED`(と `/os/` の下ぜんぶ)。プラグインごとに別の画像を貼る(ストアからは「どのページから来たか」が届かないので、画像のパスで見分ける)
- 数えるのは、参照元が ec-cube.net か wordpress.org のときだけ。ロボットは外す
- 置き場は D1 `umiushi-lab-site` の `hits`(日付・パス・参照元・回数)。IP や端末の情報は残さない
- 見る: `npx wrangler d1 execute umiushi-lab-site --remote --command "SELECT * FROM hits ORDER BY day DESC LIMIT 30"`
