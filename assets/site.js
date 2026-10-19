// スクロールで .reveal を出す(動きを減らす設定のときは CSS 側で最初から出ている)
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
})();

// 動きを減らす設定のときは、ぱらぱらの動画を止めておく(最初の 1 こまのまま)
if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach((v) => { v.removeAttribute('autoplay'); v.pause(); });
}
