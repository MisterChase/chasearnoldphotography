/* ============================================================================
   SITE CONFIG — everything about *you*.
   Edit this file, run `npm run build`, done. No other file needs touching.
   ========================================================================== */

export default {
  /* --- Identity ----------------------------------------------------------- */
  name: 'CHASE ARNOLD',
  // Shown under your name in the header. Keep it short.
  role: 'DIGITAL MEDIA',
  /* THE OPENING PHOTO
     The homepage opens on one full-screen photo that dissolves away as you
     scroll, revealing your work underneath.

     To use your own: put the picture in  source-media/_hero/
     and write its filename here. That's the whole job.                     */
  hero: {
    image: 'hero.jpg',
    // Small line in the bottom corner, over the photo. Set to null for none.
    caption: 'SELECTED WORK — 2024/2026',
    // How far you scroll before the photo has fully dissolved.
    // 1 = about one screen-height. Higher = slower, more lingering.
    dissolveLength: 0.9,
    // Where the photo is anchored when object-fit:cover crops it — 'X% Y%'.
    // Phones only ever see a narrow center strip (crop is width-bound), so
    // tune X for that; ultrawides only lose top/bottom, so tune Y for those.
    focalPoint: '50% 45%',
  },
  // 2–3 sentences. Appears in the About panel and in search results.
  bio: `I design and direct visual work across photography, motion and brand systems. Recent work spans editorial photosets, short-form video, and identity design for people building something worth looking at.`,
  // Used for the browser tab, SEO and social sharing cards.
  siteTitle: 'Chase Arnold — Digital Media',
  siteDescription: 'Portfolio of Chase Arnold. Photography, motion and visual identity work.',
  // Your live URL once deployed. Used for social share cards + sitemap.
  siteUrl: 'https://misterchase.github.io/chasearnoldphotography',
  // Set this when the site lives in a subfolder rather than at the root of a
  // domain — GitHub Pages does that. Must start with / and not end with one.
  // On a root domain (or your own custom domain) set it to ''.
  basePath: '/chasearnoldphotography',

  /* --- Contact & links ---------------------------------------------------- */
  email: 'chasearnold2004@gmail.com',
  // Add, remove or reorder freely. These render in the header and footer.
  socials: [
    { label: 'INSTAGRAM', url: 'https://instagram.com/' },
    { label: 'LINKEDIN',  url: 'https://linkedin.com/in/' },
  ],
  // Optional. Drop a PDF at static/resume.pdf and set this to '/resume.pdf'
  // to surface a RESUME link in the header. Set to null to hide it.
  resume: null,

  /* --- Look & feel -------------------------------------------------------- */
  theme: {
    ink:    '#0b0a0a', // page background
    paper:  '#fbfafa', // primary text
    dim:    '#7a7674', // secondary / metadata text
    accent: '#9db4c0', // project descriptions, hover states, focus rings
    // 'dark' or 'light'. 'light' flips ink/paper for a gallery-white site.
    mode: 'dark',
  },

  /* --- Typography ---------------------------------------------------------
     Any two families from fonts.google.com work. Change all three lines
     together: the Google URL loads them, the other two apply them.
     Good pairings to try:
       Archivo + JetBrains Mono   (current — neutral, Swiss, lets layout lead)
       Bricolage Grotesque + Geist Mono   (more character, less common)
       Instrument Serif + Geist Mono      (editorial, high contrast)          */
  fonts: {
    googleUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
    display: "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
  },

  /* --- Homepage behaviour ------------------------------------------------- */
  // The intro counter that fires on first visit. Set to false to skip it.
  preloader: true,
  // Columns drift at slightly different speeds as you scroll. This is the
  // signature move of the layout. 0 disables it, 1 is subtle, 3 is dramatic.
  parallaxStrength: 1.6,
  // Footer marquee text. Repeats infinitely.
  marquee: 'AVAILABLE FOR WORK',

  /* --- Media pipeline ----------------------------------------------------- */
  media: {
    // Widths (px) generated for every image. The browser picks the smallest
    // one that fits the reader's screen — this is why a 12MB master ends up
    // costing a visitor ~200KB.
    widths: [480, 800, 1200, 1600, 2400],
    // Modern formats, best first. JPEG is always emitted as a fallback.
    formats: ['avif', 'webp'],
    quality: { avif: 58, webp: 76, jpeg: 82 },
    // JPEG is only a fallback for browsers too old for WebP. Capping it here
    // keeps large duplicate copies out of the deploy. Raise it only if you
    // need to support something genuinely ancient.
    jpegFallbackMaxWidth: 1200,
    // Clicking an image opens the lightbox. This is the largest size served
    // there — big enough to show real detail, small enough to load fast.
    lightboxWidth: 2400,
    // Self-hosted video is capped at this height and this file size (MB).
    // Anything longer or heavier should live on Vimeo/YouTube instead —
    // see the `video` field in content/projects.js.
    videoMaxHeight: 1080,
    videoWarnSizeMB: 20,
  },
};
