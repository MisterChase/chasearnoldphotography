/* ============================================================================
   PAGE SHELL — <head>, header and footer shared by every page.
   ========================================================================== */

import site_ from '../../site.config.js';

/* Every internal URL runs through u(). On a root domain basePath is '' and
   this is a no-op; on GitHub Pages it prefixes the repo subfolder. */
export const BASE = (site_.basePath || '').replace(/\/$/, '');
export const u = (p) => BASE + p;
/* Absolute origin, for share-card images and canonical URLs. */
export const ORIGIN = (() => { try { return new URL(site_.siteUrl).origin; } catch { return ''; } })();

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Wrap each character in a span so CSS can stagger them individually. */
export const splitChars = (text) =>
  [...String(text)].map((ch, i) =>
    ch === ' '
      ? `<span class="ch ch--space" style="--i:${i}"> </span>`
      : `<span class="ch" style="--i:${i}">${esc(ch)}</span>`
  ).join('');

export function head(site, { title, description, path = '/', image = null }) {
  const fullTitle = title ? `${title} — ${site.name}` : site.siteTitle;
  const desc = description || site.siteDescription;
  const url = site.siteUrl.replace(/\/$/, '') + path;
  // Media URLs already carry basePath, so they hang off the bare origin.
  const ogImage = image ? ORIGIN + image : null;
  const f = site.fonts;

  return `<!doctype html>
<html lang="en" data-mode="${site.theme.mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="${site.theme.mode === 'dark' ? site.theme.ink : site.theme.paper}">

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : ''}
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(f.googleUrl)}">
<link rel="stylesheet" href="${u('/styles/main.css')}">
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<style>
  :root{
    --ink:${site.theme.ink}; --paper:${site.theme.paper};
    --dim:${site.theme.dim}; --accent:${site.theme.accent};
    --font-display:${f.display}; --font-mono:${f.mono};
    --parallax:${site.parallaxStrength};
  }
</style>
<noscript><style>
  /* Without JS the preloader is never dismissed and the reveal classes are
     never applied, so undo every JS-dependent starting state. All content,
     images and links work normally from here. */
  body.is-loading{ overflow:auto; height:auto; }
  .preload, .cursor{ display:none !important; }
  .pintro__title .ch{ transform:none; animation:none; }
  /* --p never advances without JS, so the photo simply stays put and you
     scroll past it to the work. */
  .hero{ height:100svh; }
  [data-reveal]:not(.tile){ opacity:1; transform:none; }
  .tile__frame{ clip-path:none; }
  .tile__frame img, .tile__frame video{ transform:none; }
  .work__list{ display:none; }  /* one view is enough without a toggle */
  .work__views{ display:none; }
</style></noscript>
</head>
<body class="${site.preloader ? 'is-loading' : ''}">`;
}

export function preloader(site, count) {
  if (!site.preloader) return '';
  return `
<div class="preload" id="preload" aria-hidden="true">
  <div class="preload__inner">
    <span class="preload__name">${esc(site.name)}</span>
    <span class="preload__num"><i id="preloadNum">0</i>%</span>
  </div>
  <div class="preload__bar"><i id="preloadBar"></i></div>
</div>`;
}

export function header(site, { active = 'work', backLink = null } = {}) {
  const nav = [
    { label: 'WORK', href: u('/#work'), key: 'work' },
    { label: 'ABOUT', href: u('/#about'), key: 'about' },
  ];
  if (site.resume) nav.push({ label: 'RESUME', href: site.resume, key: 'resume', ext: true });

  return `
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
  <div class="hdr__l">
    ${backLink
      ? `<a class="hdr__back" href="${u('/')}" data-scramble><span class="hdr__arrow">&#8592;</span> INDEX</a>`
      : `<a class="hdr__name" href="${u('/')}" data-scramble>${esc(site.name)}</a>`}
  </div>
  <nav class="hdr__c" aria-label="Primary">
    ${nav.map((n) =>
      `<a href="${esc(n.href)}"${n.ext ? ' target="_blank" rel="noopener"' : ''} class="${active === n.key ? 'is-active' : ''}" data-scramble>${esc(n.label)}</a>`
    ).join('<span class="hdr__sep">/</span>')}
  </nav>
  <div class="hdr__r">
    <a href="mailto:${esc(site.email)}" data-scramble>${esc(site.email.toUpperCase())}</a>
    ${site.socials.slice(0, 1).map((s) =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener" data-scramble>${esc(s.label)}</a>`).join('')}
  </div>
</header>
<div class="cursor" id="cursor" aria-hidden="true"><span class="cursor__label"></span></div>`;
}

export function footer(site) {
  const year = new Date().getFullYear();
  const marqueeText = `${site.marquee} &mdash; ${site.email.toUpperCase()} &mdash; `;
  return `
<footer class="ftr" id="contact">
  <div class="ftr__marquee" aria-hidden="true">
    <div class="ftr__track">${Array.from({ length: 6 }, () =>
      `<span>${marqueeText}</span>`).join('')}</div>
  </div>
  <div class="ftr__grid">
    <div class="ftr__col">
      <h2 class="lbl">CONTACT</h2>
      <a class="ftr__email" href="mailto:${esc(site.email)}" data-scramble>${esc(site.email)}</a>
    </div>
    <div class="ftr__col">
      <h2 class="lbl">ELSEWHERE</h2>
      ${site.socials.map((s) =>
        `<a href="${esc(s.url)}" target="_blank" rel="noopener" data-scramble>${esc(s.label)}</a>`).join('')}
    </div>
    <div class="ftr__col ftr__col--end">
      <span class="lbl">&copy; ${year}</span>
      <button class="ftr__top" id="toTop" type="button">BACK TO TOP &#8593;</button>
    </div>
  </div>
</footer>`;
}

export function lightbox() {
  return `
<div class="lb" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" hidden>
  <button class="lb__close" id="lbClose" type="button" aria-label="Close viewer">CLOSE &#10005;</button>
  <button class="lb__nav lb__nav--prev" id="lbPrev" type="button" aria-label="Previous">&#8592;</button>
  <button class="lb__nav lb__nav--next" id="lbNext" type="button" aria-label="Next">&#8594;</button>
  <figure class="lb__stage"><img id="lbImg" alt=""></figure>
  <div class="lb__bar">
    <span class="lb__caption" id="lbCaption"></span>
    <span class="lb__count" id="lbCount"></span>
  </div>
</div>`;
}

export const scripts = () => `
<script src="${u('/scripts/app.js')}" type="module"></script>
</body>
</html>`;
