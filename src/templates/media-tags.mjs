/* ============================================================================
   MEDIA TAGS — turns a processed media descriptor into markup.
   The <picture> ladder means a phone downloads a 480px AVIF (~40KB) where a
   5K display downloads a 2400px one, from the same 12MB original.
   ========================================================================== */

import { esc } from './shell.mjs';

const srcsetFor = (files) => files.map((f) => `${f.url} ${f.w}w`).join(', ');

export const SIZES = {
  full:  '100vw',
  wide:  '(max-width: 860px) 100vw, 88vw',
  half:  '(max-width: 860px) 100vw, 44vw',
  third: '(max-width: 860px) 50vw, 30vw',
  tile:  '(max-width: 860px) 92vw, 44vw',
};

export function picture(m, { sizes = SIZES.tile, alt = '', eager = false, className = '', focalPoint = '' } = {}) {
  if (!m) return '';
  const jpeg = m.sources.find((s) => s.type === 'image/jpeg');
  const modern = m.sources.filter((s) => s.type !== 'image/jpeg');
  const style = `background-image:url(${m.lqip})${focalPoint ? `;object-position:${focalPoint}` : ''}`;
  return `<picture class="${className}">
${modern.map((s) => `    <source type="${s.type}" srcset="${srcsetFor(s.files)}" sizes="${sizes}">`).join('\n')}
    <img src="${esc(m.src)}" srcset="${srcsetFor(jpeg.files)}" sizes="${sizes}"
         width="${m.width}" height="${m.height}" alt="${esc(alt)}"
         loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"
         ${eager ? 'fetchpriority="high"' : ''}
         style="${style}"
         onload="this.style.backgroundImage='none';this.classList.add('is-loaded')"
         data-full="${esc(m.full)}"${m.fullAvif ? ` data-full-avif="${esc(m.fullAvif)}"` : ''} data-caption="${esc(alt)}">
  </picture>`;
}

/* Self-hosted clip. `loop` clips are silent, autoplaying and decorative;
   everything else gets real controls. */
export function video(m, { alt = '', className = '', inlineLoop = false } = {}) {
  if (!m) return '';
  const loop = inlineLoop || m.loop;
  return `<video class="${className}" ${loop ? 'muted loop playsinline autoplay' : 'controls playsinline preload="metadata"'}
    poster="${esc(m.poster)}" width="${m.width}" height="${m.height}"
    ${loop ? 'aria-hidden="true" tabindex="-1"' : `aria-label="${esc(alt)}"`}>
    <source src="${esc(m.src)}" type="video/mp4">
  </video>`;
}

/* Vimeo / YouTube, lazy-loaded behind a poster so it costs nothing until clicked. */
export function embed(e, { title = 'Video' } = {}) {
  if (!e) return '';
  return `<div class="embed" data-embed="${esc(e.url)}">
    <button class="embed__play" type="button" aria-label="Play ${esc(title)}">
      <span class="embed__icon">&#9654;</span><span class="embed__txt">PLAY ${esc(title.toUpperCase())}</span>
    </button>
    <span class="embed__provider">${esc(e.provider.toUpperCase())}</span>
  </div>`;
}

/* One media item inside a project page, at the width its filename asked for. */
export function block(m, { alt, index }) {
  const tag = m.tags.find((t) => ['full', 'wide', 'half', 'third'].includes(t));
  const width = tag || (m.orientation === 'landscape' ? 'wide' : 'half');
  const inner = m.kind === 'video'
    ? video(m, { alt })
    : picture(m, { sizes: SIZES[width], alt, eager: index === 0 });
  return { width, html: inner, media: m };
}
