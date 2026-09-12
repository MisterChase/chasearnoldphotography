/* ============================================================================
   PROJECT PAGE — hero, credits, photoset, next-project link.
   ========================================================================== */

import { head, header, footer, scripts, lightbox, esc, splitChars, u } from './shell.mjs';
import { picture, video, embed, block, SIZES } from './media-tags.mjs';

/* Consecutive @half items pair up; @third items group in threes. Everything
   else stands alone. This is what makes a folder of loose files read as a
   laid-out spread without you having to specify anything. */
function groupBlocks(blocks) {
  const rows = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.width === 'half' || b.width === 'third') {
      const size = b.width === 'half' ? 2 : 3;
      const run = [b];
      while (run.length < size && blocks[i + run.length]?.width === b.width) run.push(blocks[i + run.length]);
      rows.push({ type: b.width, items: run });
      i += run.length;
    } else {
      rows.push({ type: b.width, items: [b] });
      i += 1;
    }
  }
  return rows;
}

export function renderProject(site, p, { next, prev }) {
  const hero = p.cover;
  const rest = p.media.filter((m) => m !== hero);
  const blocks = rest.map((m, i) => block(m, { alt: `${p.title} — ${m.human}`, index: i }));
  const rows = groupBlocks(blocks);

  const heroVisual = !hero ? '' : hero.kind === 'video'
    ? video(hero, { alt: p.title, inlineLoop: true, className: 'ph__media' })
    : picture(hero, { sizes: SIZES.full, alt: `${p.title} — ${hero.human}`, eager: true, className: 'ph__media' });

  const credits = [
    ['YEAR', p.year],
    ['CLIENT', p.client],
    ['ROLE', p.role],
    ['DISCIPLINE', p.services.join(' / ')],
  ].filter(([, v]) => v);

  const lightboxable = p.media.filter((m) => m.kind === 'image');

  return `${head(site, {
    title: p.title,
    description: p.description,
    path: `/work/${p.slug}/`,
    image: hero && hero.kind === 'image' ? hero.src : hero?.poster ?? null,
  })}
${header(site, { active: 'work', backLink: true })}
<div class="progress" id="progress" aria-hidden="true"><i></i></div>

<main id="main" class="proj" data-lightbox-scope>

  ${hero ? `<section class="ph">${heroVisual}<span class="ph__fade" aria-hidden="true"></span></section>` : ''}

  <section class="pintro">
    <h1 class="pintro__title" aria-label="${esc(p.title)}"><span aria-hidden="true">${splitChars(p.title)}</span></h1>
    <p class="pintro__desc">${esc(p.description)}</p>
    <dl class="pintro__credits">
      ${credits.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
    </dl>
    ${p.about ? `<div class="pintro__about">${p.about.split(/\n\s*\n/).map((t) => `<p data-reveal>${esc(t.trim())}</p>`).join('')}</div>` : ''}
  </section>

  ${p.embed ? `<section class="pembed" data-reveal>${embed(p.embed, { title: p.title })}</section>` : ''}

  <section class="pmedia">
    ${rows.map((row) => {
      if (row.type === 'full')
        return `<figure class="pb pb--full" data-reveal>${row.items[0].html}</figure>`;
      if (row.type === 'wide')
        return `<figure class="pb pb--wide" data-reveal>${row.items[0].html}</figure>`;
      return `<div class="pb pb--${row.type}" data-reveal>${row.items.map((it) => `<figure>${it.html}</figure>`).join('')}</div>`;
    }).join('\n    ')}
  </section>

  ${lightboxable.length ? `<p class="pmedia__hint"><span class="lbl">CLICK ANY IMAGE TO ENLARGE &middot; &#8592; &#8594; TO BROWSE</span></p>` : ''}

  <nav class="pnext" aria-label="Project navigation">
    ${prev ? `<a class="pnext__side" href="${u(`/work/${esc(prev.slug)}/`)}" data-cursor="PREV">&#8592; ${esc(prev.title)}</a>` : '<span></span>'}
    ${next ? `
    <a class="pnext__main" href="${u(`/work/${esc(next.slug)}/`)}" data-cursor="NEXT">
      <span class="lbl">NEXT PROJECT</span>
      <span class="pnext__title">${esc(next.title)}</span>
      <span class="pnext__desc">${esc(next.description)}</span>
    </a>` : ''}
  </nav>

</main>
${lightbox()}
${footer(site)}
${scripts()}`;
}

export function renderNotFound(site) {
  return `${head(site, { title: '404', description: 'Page not found', path: '/404.html' })}
${header(site, { backLink: true })}
<main id="main" class="nf">
  <h1 class="nf__code">404</h1>
  <p class="nf__msg">That page doesn't exist.</p>
  <a class="nf__back" href="${u('/')}" data-scramble>&#8592; BACK TO INDEX</a>
</main>
${footer(site)}
${scripts()}`;
}
