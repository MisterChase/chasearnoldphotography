/* ============================================================================
   No dependencies, no build step. Every block below is independent — delete
   any one of them and the rest keeps working.
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* --- 1. preloader ---------------------------------------------------------
   Counts real image decodes rather than faking a timer, so the number means
   something. Bails out after 6s so a slow asset can never trap a visitor.  */
(function preloader() {
  const el = $('#preload');
  if (!el) { document.body.classList.remove('is-loading'); return; }
  const num = $('#preloadNum'), bar = $('#preloadBar');

  const targets = [...document.images].filter((i) => i.loading !== 'lazy');
  let loaded = 0;
  const tick = () => { loaded++; };
  targets.forEach((img) => {
    if (img.complete) tick();
    else { img.addEventListener('load', tick, { once: true }); img.addEventListener('error', tick, { once: true }); }
  });

  let shown = 0, done = false;
  const finish = () => {
    if (done) return; done = true;
    shown = 100; num.textContent = '100'; bar.style.width = '100%';
    setTimeout(() => {
      el.classList.add('is-done');
      document.body.classList.remove('is-loading');
      setTimeout(() => el.remove(), 1100);
    }, 260);
  };

  const raf = () => {
    if (done) return;
    const assets = targets.length ? loaded / targets.length : 1;
    const target = clamp(assets * 100, 0, 99);
    shown = lerp(shown, target, 0.08);
    num.textContent = Math.round(shown);
    bar.style.width = `${shown}%`;
    if (shown >= 98.5) return finish();
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  Promise.race([
    Promise.all([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => addEventListener('load', r, { once: true }))]),
    new Promise((r) => setTimeout(r, 6000)),
  ]).then(() => setTimeout(finish, 220));
})();

/* --- 2. cursor ----------------------------------------------------------- */
(function cursor() {
  const el = $('#cursor');
  if (!el || !fine || reduced) return;
  // Only now — a touch device or a reduced-motion visitor keeps its own pointer.
  document.body.classList.add('has-cursor');
  const label = $('.cursor__label', el);
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;

  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() {
    x = lerp(x, tx, 0.22); y = lerp(y, ty, 0.22);
    el.style.translate = `${x}px ${y}px`;
    requestAnimationFrame(loop);
  })();

  const enter = (e) => {
    const t = e.target.closest('[data-cursor]');
    if (!t) return;
    label.textContent = t.dataset.cursor;
    el.classList.add('is-active');
  };
  const leave = (e) => { if (e.target.closest('[data-cursor]')) el.classList.remove('is-active'); };
  document.addEventListener('pointerover', enter);
  document.addEventListener('pointerout', leave);
})();

/* --- 3. hero dissolve ------------------------------------------------------
   Maps how far you've scrolled through the (tall) hero section onto --p, 0 to 1.
   CSS does the rest: opacity, zoom and blur are all expressed in terms of --p.
   Eased with a lerp so a trackpad flick doesn't snap.                       */
(function heroDissolve() {
  const hero = $('.hero'), stage = $('#heroStage');
  if (!hero || !stage) return;

  let shown = 0, target = 0;
  const measure = () => {
    const range = hero.offsetHeight - innerHeight;
    target = range > 0 ? clamp((scrollY - hero.offsetTop) / range, 0, 1) : 0;
  };
  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', measure, { passive: true });
  measure();
  shown = target;   // deep-linking or a restored scroll position starts correct

  (function loop() {
    shown = reduced ? target : lerp(shown, target, 0.14);
    stage.style.setProperty('--p', shown.toFixed(4));
    requestAnimationFrame(loop);
  })();
})();

/* --- 4. text scramble ----------------------------------------------------- */
(function scramble() {
  if (reduced || !fine) return;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/';
  $$('[data-scramble]').forEach((el) => {
    const original = el.textContent;
    let frame = 0, raf = null;
    el.addEventListener('pointerenter', () => {
      cancelAnimationFrame(raf); frame = 0;
      const run = () => {
        const p = frame / 14;
        el.textContent = [...original].map((ch, i) =>
          ch === ' ' || i / original.length < p ? ch : CHARS[(Math.random() * CHARS.length) | 0]
        ).join('');
        if (frame++ <= 15) raf = requestAnimationFrame(run);
        else el.textContent = original;
      };
      run();
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.textContent = original; });
  });
})();

/* --- 5. scroll reveal ----------------------------------------------------- */
(function reveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-in')); return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
  items.forEach((i) => io.observe(i));
})();

/* --- 6. column parallax ---------------------------------------------------
   The signature move: the right column drifts slightly slower than the left,
   so the grid never reads as a plain two-up. Disabled on touch and when the
   reader has asked for less motion.                                        */
(function parallax() {
  const cols = $$('.work__col[data-speed="1"]');
  const grid = $('[data-grid]');
  if (!cols.length || !grid || reduced) return;

  const strength = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax')) || 0;
  if (!strength) return;

  let current = 0, target = 0, active = innerWidth > 860;
  const update = () => {
    if (!active) { target = 0; return; }
    const r = grid.getBoundingClientRect();
    const travelled = clamp(innerHeight - r.top, 0, r.height + innerHeight);
    target = -travelled * 0.035 * strength;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { active = innerWidth > 860; update(); }, { passive: true });
  update();

  (function loop() {
    current = lerp(current, target, 0.075);
    if (Math.abs(current - target) > 0.05) cols.forEach((c) => { c.style.transform = `translate3d(0,${current.toFixed(2)}px,0)`; });
    requestAnimationFrame(loop);
  })();
})();

/* --- 7. grid / index view toggle ------------------------------------------ */
(function views() {
  const grid = $('[data-grid]'), list = $('[data-list]'), btns = $$('.vbtn');
  if (!grid || !list) return;
  const KEY = 'portfolio:view';

  const apply = (v) => {
    const isList = v === 'list';
    grid.hidden = isList; list.hidden = !isList;
    btns.forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem(KEY, v); } catch {}
  };

  btns.forEach((b) => b.addEventListener('click', () => apply(b.dataset.view)));
  try { const saved = localStorage.getItem(KEY); if (saved) apply(saved); } catch {}
})();

/* --- 8. lightbox ---------------------------------------------------------- */
(function lightbox() {
  const lb = $('#lightbox');
  const scope = $('[data-lightbox-scope]');
  if (!lb || !scope) return;

  const imgs = $$('img[data-full]', scope);
  if (!imgs.length) return;

  const stage = $('#lbImg'), cap = $('#lbCaption'), count = $('#lbCount');
  let index = 0, lastFocus = null;

  // AVIF is meaningfully smaller at full size; fall back where it isn't decodable.
  const canAvif = (() => {
    const c = document.createElement('canvas');
    return c.toDataURL && c.toDataURL('image/avif').startsWith('data:image/avif');
  })();
  const fullOf = (img) => (canAvif && img.dataset.fullAvif) || img.dataset.full;

  const preload = (i) => { if (imgs[i]) new Image().src = fullOf(imgs[i]); };

  const show = (i) => {
    index = (i + imgs.length) % imgs.length;
    const src = imgs[index];
    stage.src = fullOf(src);
    stage.alt = src.alt || '';
    cap.textContent = src.dataset.caption || '';
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(imgs.length).padStart(2, '0')}`;
    preload(index + 1); preload(index - 1);
  };

  const open = (i) => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    show(i);
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; stage.src = ''; }, 350);
    lastFocus?.focus();
  };

  imgs.forEach((img, i) => img.addEventListener('click', () => open(i)));
  $('#lbClose').addEventListener('click', close);
  $('#lbNext').addEventListener('click', () => show(index + 1));
  $('#lbPrev').addEventListener('click', () => show(index - 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb__stage')) close(); });

  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'Tab') { e.preventDefault(); $('#lbClose').focus(); }
  });

  // Swipe on touch devices.
  let sx = 0;
  lb.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 55) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* --- 9. lazy video embeds -------------------------------------------------
   Nothing is requested from Vimeo/YouTube until the reader actually clicks. */
(function embeds() {
  $$('[data-embed]').forEach((box) => {
    const btn = $('.embed__play', box);
    btn?.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = box.dataset.embed + '&autoplay=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      f.title = btn.getAttribute('aria-label') || 'Video';
      box.replaceChildren(f);
    });
  });
})();

/* --- 10. reading progress + back to top ------------------------------------ */
(function progress() {
  const bar = $('#progress i');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = `${max > 0 ? clamp((scrollY / max) * 100, 0, 100) : 0}%`;
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }
  $('#toTop')?.addEventListener('click', () =>
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
})();

/* --- 11. pause offscreen loops -------------------------------------------- */
(function videoPower() {
  const loops = $$('video[loop][autoplay]');
  if (!loops.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { threshold: 0.1 });
  loops.forEach((v) => io.observe(v));
})();
