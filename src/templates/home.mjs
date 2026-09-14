/* ============================================================================
   HOMEPAGE
   ========================================================================== */

import { head, header, footer, preloader, scripts, esc, u } from './shell.mjs';
import { picture, video, SIZES } from './media-tags.mjs';

const pad = (n) => String(n + 1).padStart(2, '0');

function tile(p, i) {
  const cover = p.cover;
  if (!cover) return '';
  const loop = p.loopVideo;
  const aspect = cover.aspect || 1;

  const visual = cover.kind === 'video'
    ? video(cover, { alt: p.title, inlineLoop: true, className: 'tile__media' })
    : picture(cover, { sizes: SIZES.tile, alt: `${p.title} — cover`, eager: i < 2, className: 'tile__media' });

  return `
    <a class="tile ${p.featured ? 'tile--featured' : ''}" href="${u(`/work/${esc(p.slug)}/`)}"
       data-cursor="VIEW" data-reveal style="--aspect:${aspect}; order:${i}">
      <span class="tile__idx">${pad(i)}</span>
      <div class="tile__frame">
        ${visual}
        ${loop ? video(loop, { inlineLoop: true, className: 'tile__loop' }) : ''}
        <span class="tile__shade" aria-hidden="true"></span>
      </div>
      <div class="tile__meta">
        <h3 class="tile__name">[&nbsp;${esc(p.title)}&nbsp;]</h3>
        <span class="tile__desc">${esc(p.description)}</span>
        <span class="tile__svc">(&nbsp;${p.services.map(esc).join(' / ')}&nbsp;)</span>
      </div>
    </a>`;
}

function indexRow(p, i) {
  const thumb = p.cover && p.cover.kind === 'image'
    ? `<img class="row__thumb" src="${esc(p.cover.sources.find(s=>s.type==='image/jpeg').files[0].url)}" alt="" aria-hidden="true" loading="lazy">`
    : '';
  return `
    <a class="row" href="${u(`/work/${esc(p.slug)}/`)}" data-cursor="OPEN" data-reveal>
      <span class="row__idx">${pad(i)}</span>
      <span class="row__title">${esc(p.title)}</span>
      <span class="row__desc">${esc(p.description)}</span>
      <span class="row__svc">${p.services.map(esc).join(' / ')}</span>
      <span class="row__year">${esc(p.year)}</span>
      <span class="row__arrow">&#8594;</span>
      ${thumb}
    </a>`;
}

export function renderHome(site, projects, stats, heroMedia) {
  const withCovers = projects.filter((p) => p.cover);

  /* The opening photo. If none is present the site still works — it falls back
     to the name set in oversized type, so the page is never broken. */
  const heroVisual = !heroMedia
    ? '<div class="hero__fallback" aria-hidden="true"></div>'
    : heroMedia.kind === 'video'
      ? video(heroMedia, { inlineLoop: true, className: 'hero__img' })
      : picture(heroMedia, { sizes: '100vw', alt: '', eager: true, className: 'hero__img', focalPoint: site.hero?.focalPoint });
  // Alternate into two columns so they can drift at different scroll speeds.
  const colA = withCovers.filter((_, i) => i % 2 === 0);
  const colB = withCovers.filter((_, i) => i % 2 === 1);
  const idxOf = (p) => withCovers.indexOf(p);

  const allServices = [...new Set(projects.flatMap((p) => p.services))];

  return `${head(site, { path: '/' })}
${preloader(site)}
${header(site, { active: 'work' })}

<main id="main">

  <section class="hero" style="--dissolve:${site.hero?.dissolveLength ?? 1}">
    <div class="hero__stage" id="heroStage">
      ${heroVisual}
      <span class="hero__veil" aria-hidden="true"></span>
      <div class="hero__overlay">
        <p class="hero__role">${esc(site.role)}</p>
      </div>
      <div class="hero__foot">
        <div class="hero__title">
          <h1 class="hero__name">${esc(site.name)}</h1>
          ${site.hero?.caption ? `<span class="hero__caption">${esc(site.hero.caption)}</span>` : ''}
        </div>
        <a class="hero__cue" href="${u('/#work')}" aria-label="Scroll to work">
          <span>SCROLL</span><span class="hero__cueline"></span>
        </a>
      </div>
    </div>
  </section>

  <section class="work" id="work" aria-labelledby="work-h">
    <h2 class="sr-only" id="work-h">Selected work</h2>
    <div class="work__bar">
      <span class="lbl">INDEX &mdash; ${String(withCovers.length).padStart(2, '0')}</span>
      <div class="work__views" role="group" aria-label="Change layout">
        <button type="button" class="vbtn is-active" data-view="grid" aria-pressed="true">GRID</button>
        <button type="button" class="vbtn" data-view="list" aria-pressed="false">INDEX</button>
      </div>
    </div>

    <div class="work__grid" data-grid>
      <div class="work__col" data-col="a" data-speed="0">${colA.map((p) => tile(p, idxOf(p))).join('')}</div>
      <div class="work__col" data-col="b" data-speed="1">${colB.map((p) => tile(p, idxOf(p))).join('')}</div>
    </div>

    <div class="work__list" data-list hidden>
      <div class="row row--head" aria-hidden="true">
        <span class="row__idx">#</span><span class="row__title">PROJECT</span>
        <span class="row__desc">DESCRIPTION</span><span class="row__svc">DISCIPLINE</span>
        <span class="row__year">YEAR</span><span class="row__arrow"></span>
      </div>
      ${withCovers.map((p, i) => indexRow(p, i)).join('')}
    </div>
  </section>

  <section class="about" id="about" aria-labelledby="about-h">
    <div class="about__l"><h2 class="lbl" id="about-h">ABOUT</h2></div>
    <div class="about__c">
      <p class="about__bio" data-reveal>${esc(site.bio)}</p>
      <a class="about__mail" href="mailto:${esc(site.email)}" data-scramble>${esc(site.email)} &#8599;</a>
    </div>
    <div class="about__r">
      <span class="lbl">DISCIPLINES</span>
      <ul class="about__list">
        ${allServices.map((s) => `<li>${esc(s)}</li>`).join('')}
      </ul>
    </div>
  </section>

</main>
${footer(site)}
${scripts()}`;
}
