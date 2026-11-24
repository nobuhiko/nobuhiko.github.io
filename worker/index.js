// umiushi-lab.com。静的なファイルを出すだけの Worker。
// 1 つだけ仕事がある: 外のページに貼ってある画像が取りに来られた回数を数える (オーナーズストアのページが何回見られたかの目安)。
// 本人 2026-11-24「オーナーズストアのプラグインのページが PV わからん。なんか埋め込めんかな」

// 数える画像。外のページに貼るのは、ここにあるものだけ。足すときはここに 1 行 (/os/ の下は全部数える)
const COUNTED = new Set(['/shisa/explain-thumb.jpg', '/shisa/lift-thumb.jpg']);
const COUNTED_PREFIX = '/os/';
// 数える参照元 (ここ以外から来た分は数えない。自分のサイトの中で表示された分を除くため)
const SOURCES = ['ec-cube.net', 'wordpress.org'];
const BOT = /bot|crawl|spider|slurp|preview|monitor|curl|wget|python|headless/i;

function today() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

function sourceOf(request) {
  let host = '';
  try { host = new URL(request.headers.get('referer') || '').hostname; } catch { return null; }
  return SOURCES.some((s) => host === s || host.endsWith('.' + s)) ? host : null;
}

// URL の形は GitHub Pages のときと同じにする (ストアの審査に出した URL や、外から張られたリンクを変えないため):
//   /shisa/ → /shisa/index.html、/shisa → /shisa/ へ 301、/tokushoho.html も /tokushoho も 200、無ければ 404.html
async function serve(request, env, url) {
  const at = (p) => env.ASSETS.fetch(new Request(new URL(p, url), request));
  const path = url.pathname;
  if (path.endsWith('/')) {
    const r = await at(path + 'index.html');
    if (r.status !== 404) return r;
  } else {
    const r = await at(path);
    if (r.status !== 404) return r;
    const last = path.slice(path.lastIndexOf('/') + 1);
    if (!last.includes('.')) {
      const h = await at(path + '.html');
      if (h.status !== 404) return h;
      const d = await at(path + '/index.html');
      if (d.status !== 404) return Response.redirect(new URL(path + '/' + url.search, url).toString(), 301);
    }
  }
  const nf = await at('/404.html');
  return new Response(nf.body, { status: 404, headers: nf.headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // www は付けない形にそろえる (GitHub Pages のときと同じ)
    if (url.hostname === 'www.umiushi-lab.com') {
      url.hostname = 'umiushi-lab.com';
      return Response.redirect(url.toString(), 301);
    }

    const counted = COUNTED.has(path) || path.startsWith(COUNTED_PREFIX);
    if (!counted) {
      const r = await serve(request, env, url);
      // 仮の URL (workers.dev) は検索に載せない。本番と同じ中身が 2 か所に出るのを避ける
      if (url.hostname === 'umiushi-lab.com' || r.status >= 300) return r;
      const o = new Response(r.body, r);
      o.headers.set('x-robots-tag', 'noindex');
      return o;
    }

    const res = await env.ASSETS.fetch(request);
    const src = sourceOf(request);
    if (src && request.method === 'GET' && (res.status === 200 || res.status === 304) && !BOT.test(request.headers.get('user-agent') || '')) {
      ctx.waitUntil(
        env.DB.prepare('INSERT INTO hits (day, path, src, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (day, path, src) DO UPDATE SET n = n + 1')
          .bind(today(), path, src).run().catch(() => {}),
      );
    }
    // 開くたびに確かめに来てもらう (ブラウザに持たれたままだと数えられない)。中身が同じなら 304 で、通信は小さい
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'no-cache');
    return out;
  },
};
