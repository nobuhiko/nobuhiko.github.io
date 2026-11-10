// スクロールで .reveal を出す(動きを減らす設定のときは CSS 側で最初から出ている)
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
})();

// ぱらぱらの動画は、画面に近づいてから読んで動かす(最初の表示を軽くする)。動きを減らす設定のときは、最初の 1 こま(poster)のまま
if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
  const vids = document.querySelectorAll('video[data-autoplay]');
  const start = (v) => { const p = v.play(); if (p) p.catch(() => {}); };
  if (!('IntersectionObserver' in window)) vids.forEach(start);
  else {
    const vo = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { start(e.target); vo.unobserve(e.target); }
    }, { rootMargin: '300px 0px' });
    vids.forEach((v) => vo.observe(v));
  }
}

// 明るい/暗いの切り替え(トップのナビの ◐)。選んだほうを覚えておく
document.querySelectorAll('.theme').forEach((b) => b.addEventListener('click', () => {
  const light = document.documentElement.classList.toggle('light');
  try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
}));
