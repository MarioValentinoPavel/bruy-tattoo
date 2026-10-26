// BrUy Tattoo · «El muro»: pinta con espray (la máquina es la boquilla), trabajos que aparecen con espray y títulos que gotean
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = () => (document.documentElement.lang === 'en' ? 'en' : 'es');

  // ---------- espray ----------
  function spray() {
    const cv = document.getElementById('spray'), g = cv.getContext('2d'), hero = cv.parentElement;
    let W, H, color = '#00b74a', down = false, drips = [], raf = 0;
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      const old = W ? g.getImageData(0, 0, cv.width, cv.height) : null, ow = cv.width, oh = cv.height;
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
      if (old) { const t = document.createElement('canvas'); t.width = ow; t.height = oh; t.getContext('2d').putImageData(old, 0, 0); g.drawImage(t, 0, 0, W, H); }
    };
    size(); new ResizeObserver(size).observe(cv);
    const puff = (x, y, rad, c, n = 70) => {
      g.fillStyle = c;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, r = Math.pow(Math.random(), 1.8) * rad;
        g.globalAlpha = .25 + Math.random() * .5;
        g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, .6 + Math.random() * 1.6, 0, 6.283); g.fill();
      }
      g.globalAlpha = .55;
      g.beginPath(); g.arc(x, y, rad * .32, 0, 6.283); g.fill();
      g.globalAlpha = 1;
      if (Math.random() < .05) drips.push({ x: x + (Math.random() - .5) * rad * .4, y: y + rad * .25, w: 1.5 + Math.random() * 2.5, len: 30 + Math.random() * 110, v: 0, c });
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      drips = drips.filter((d) => d.len > 0);
      for (const d of drips) {
        const step = Math.min(d.len, 1.2 + d.v); d.v = Math.min(3, d.v + .05);
        g.fillStyle = d.c; g.globalAlpha = .9;
        g.fillRect(d.x - d.w / 2, d.y, d.w, step);
        g.beginPath(); g.arc(d.x, d.y + step, d.w * .7, 0, 6.283); g.fill();
        d.y += step; d.len -= step; d.w *= .997;
      }
      g.globalAlpha = 1;
      raf = drips.length ? requestAnimationFrame(tick) : 0;
    };
    let last = null;
    const at = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const paint = (e) => {
      const p = at(e), rad = Math.max(22, W * .022);
      if (last) { const dx = p.x - last.x, dy = p.y - last.y, n = Math.ceil(Math.hypot(dx, dy) / (rad * .35)); for (let i = 1; i <= n; i++) puff(last.x + dx * i / n, last.y + dy * i / n, rad, color, 40); }
      else puff(p.x, p.y, rad, color);
      last = p;
    };
    hero.addEventListener('pointerdown', (e) => { if (e.target.closest('a, button')) return; down = true; last = null; paint(e); });
    hero.addEventListener('pointermove', (e) => { if (down) paint(e); });
    addEventListener('pointerup', () => { down = false; last = null; });
    hero.addEventListener('pointercancel', () => { down = false; });
    document.querySelectorAll('.can').forEach((b) => {
      b.style.background = b.dataset.c;
      b.addEventListener('click', () => { color = b.dataset.c; document.querySelectorAll('.can').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    });
    document.getElementById('clean').addEventListener('click', () => {
      if (reduce || typeof gsap === 'undefined') { g.clearRect(0, 0, W, H); return; }
      gsap.to(cv, { opacity: 0, duration: .5, onComplete: () => { g.clearRect(0, 0, W, H); drips = []; cv.style.opacity = 1; } });
    });
    // al entrar, un grafiti de fondo detrás del título: nubes verde y azul
    return () => {
      const t = document.querySelector('.tag').getBoundingClientRect(), r = cv.getBoundingClientRect();
      const x0 = t.left - r.left, y0 = t.top - r.top, w = t.width, h = t.height;
      const path = [];
      for (let i = 0; i <= 70; i++) path.push({ x: x0 + w * (i / 70) * .55, y: y0 + h * (.45 + Math.sin(i * .3) * .22), c: "#0b5c2c" });
      for (let i = 0; i <= 70; i++) path.push({ x: x0 + w * (.5 + (i / 70) * .55), y: y0 + h * (.5 + Math.cos(i * .26) * .22), c: "#173a8f" });
      let k = 0;
      const step = () => { for (let j = 0; j < 4 && k < path.length; j++, k++) puff(path[k].x, path[k].y, h * .2, path[k].c, 110); if (k < path.length) setTimeout(step, 22); };
      step();
    };
  }

  function now() {
    const el = document.getElementById('now');
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const day = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    const wk = day >= 1 && day <= 5;
    const open = (wk && ((m >= 600 && m < 840) || (m >= 1020 && m < 1260))) || (day === 6 && m >= 630 && m < 1320);
    el.classList.toggle('open', open);
    el.textContent = open ? (L() === 'en' ? 'Open now' : 'Abierto ahora') : (L() === 'en' ? 'Closed now' : 'Ahora cerrado');
  }

  function header() {
    const top = document.querySelector('.top'); let last = 0;
    addEventListener('scroll', () => {
      const y = scrollY; top.classList.toggle('solid', y > 40);
      if (y > 500 && y > last + 4) top.classList.add('hide'); else if (y < last - 4) top.classList.remove('hide');
      last = y;
    }, { passive: true });
  }

  function motion() {
    gsap.registerPlugin(ScrollTrigger);
    // títulos: entran con un pequeño golpe y luego gotean
    gsap.utils.toArray('h2.drip').forEach((h) => {
      gsap.timeline({ scrollTrigger: { trigger: h, start: 'top 85%' } })
        .from(h, { scale: 1.25, opacity: 0, rotate: -3, duration: .5, ease: 'power4.out' })
        .fromTo(h, { '--dh': '0px' }, { '--dh': () => 14 + Math.random() * 14 + 'px', duration: 2.2, ease: 'power1.out' }, '-=.1');
    });
    // trabajos: cada foto aparece con una nube de espray
    gsap.utils.toArray('.pc').forEach((p, i) => {
      p.style.setProperty('--sx', 20 + Math.random() * 60 + '%'); p.style.setProperty('--sy', 20 + Math.random() * 60 + '%');
      gsap.fromTo(p, { '--sr': '0%' }, { '--sr': '120%', duration: 1.4, ease: 'power2.out', delay: (i % 3) * .12, scrollTrigger: { trigger: p, start: 'top 90%' } });
    });
    gsap.utils.toArray('.am-txt p, .am-facts li, .art-b, .tags li, .how > div, .rs blockquote, .visita dl').forEach((el) => gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.from('.am-img', { rotate: -12, scale: .8, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.amigos', start: 'top 75%' } });
    gsap.from('.art figure', { scale: 1.2, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.artistas', start: 'top 80%' } });
    gsap.from('.foot-big span', { y: 120, rotate: (i) => (i ? 8 : -8), opacity: 0, duration: 1.2, ease: 'back.out(1.6)', stagger: .12, scrollTrigger: { trigger: '.foot', start: 'top 92%' } });
  }

  function intro(tag) {
    if (reduce || typeof gsap === 'undefined') return;
    gsap.timeline()
      .from('.hero-flags', { y: 20, opacity: 0, duration: .8, ease: 'expo.out' })
      .from('.tag span', { scale: 1.6, opacity: 0, rotate: (i) => (i ? 10 : -10), duration: .55, ease: 'power4.out', stagger: .14 }, .1)
      .add(() => tag && tag(), .3)
      .from('.hero-claim', { y: 20, opacity: 0, rotate: -6, duration: .8, ease: 'back.out(2)' }, .7)
      .from('.hero-p, .hero-cta, .cans, .hero-hint', { y: 24, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08 }, .9);
  }

  function init() {
    const tag = spray();
    now(); header();
    intro(tag);
    if (!reduce && typeof gsap !== 'undefined') motion();
    document.fonts && document.fonts.ready.then(() => typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh());
  }
  document.addEventListener('langchange', () => { if (document.body.dataset.inited) now(); });
  const go = () => { init(); document.body.dataset.inited = '1'; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
