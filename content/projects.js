/* ============================================================================
   PROJECTS
   ----------------------------------------------------------------------------
   ADDING A PROJECT — three steps, about two minutes:

     1. Make a folder:  source-media/my-project-name/
     2. Drop your images and videos in it. Name them so they sort in the
        order you want them read:  01-cover.jpg, 02-detail.jpg, 03-wide.jpg …
        (Originals can be as huge as you like — 10MB, 50MB. They never get
        uploaded; the build makes small web copies automatically.)
     3. Add an entry to the array below with a matching `slug`.

   Then run:  npm run build

   ----------------------------------------------------------------------------
   CONTROLLING THE LAYOUT WITHOUT EDITING CODE

   The detail page lays itself out from your image shapes — portraits pair up
   side by side, landscapes run wide. To override any single image, add a tag
   to its filename before the extension:

        04-portrait@full.jpg   → edge-to-edge, full bleed
        05-detail@wide.jpg     → wide, with page margin
        06-a@half.jpg          → half width (pairs with the next @half)
        07-b@half.jpg
        08-swatch@third.jpg    → third width (groups in threes)

   Videos work the same way. Drop in an .mp4 or .mov and it gets compressed,
   gets a poster frame, and plays inline.

   A file named cover.* (or just the first file) becomes the homepage tile.
   Add @loop to a short video to make it autoplay silently on hover in the grid:
        cover@loop.mp4
   ========================================================================== */

export default [
  {
    slug: 'nocturne',                    // ← must match the source-media folder name
    title: 'NOCTURNE',                   // shown in brackets: [ NOCTURNE ]
    description: 'A nightwalk photoset shot on expired film',
    services: ['PHOTOGRAPHY', 'COLOR GRADING'],  // shown in parens
    year: '2026',
    client: 'Personal',
    role: 'Photography, Post',
    // Optional longer write-up on the project page. Supports blank-line
    // paragraphs. Delete the field entirely if you don't want one.
    about: `Six nights across three cities, shot on a stock that expired in 2009 and was never refrigerated. The color shifts are the film's, not mine — I graded toward them rather than away.`,
    // Makes the tile span wider in the homepage grid. Use on your best 2–3.
    featured: true,
  },
  {
    slug: 'halfsecond',
    title: 'HALF SECOND',
    description: 'Title sequence and motion system for a short film',
    services: ['MOTION DESIGN', 'ART DIRECTION'],
    year: '2026',
    client: 'Dir. —',
    role: 'Design, Animation',
    about: `A title system built from a single rule: every element enters in under half a second, and nothing ever eases out.`,
    // Long-form video lives off-site so it stays free to host and streams well.
    // Paste any Vimeo or YouTube URL — the build figures out the rest.
    video: 'https://vimeo.com/76979871',
    featured: false,
  },
  {
    slug: 'field-notes',
    title: 'FIELD NOTES',
    description: 'An ongoing document of overlooked infrastructure',
    services: ['PHOTOGRAPHY', 'EDITORIAL'],
    year: '2025',
    client: 'Self-published',
    role: 'Photography, Sequencing, Print',
    about: `Substations, access roads, retention ponds. The parts of a place nobody photographs because nobody is meant to look at them.`,
    featured: true,
  },
  {
    slug: 'monolith',
    title: 'MONOLITH',
    description: 'Visual identity for an independent record label',
    services: ['IDENTITY', 'PACKAGING', 'ART DIRECTION'],
    year: '2025',
    client: 'Monolith Records',
    role: 'Identity, Art Direction',
    about: `One typeface, one rule for cropping, and a grid that survives being printed on a sleeve, a sticker, or a phone screen.`,
    featured: false,
  },
  {
    slug: 'transmission',
    title: 'TRANSMISSION',
    description: 'Generative visuals driven by live audio input',
    services: ['CREATIVE CODING', 'MOTION'],
    year: '2025',
    client: 'Personal',
    role: 'Concept, Code, Design',
    about: `A WebGL system that reads amplitude and frequency from a live input and renders it as displacement across a plane. Built for a single night, kept running since.`,
    featured: false,
  },
  {
    slug: 'still-life',
    title: 'STILL LIFE',
    description: 'Product photography for a ceramics studio',
    services: ['PHOTOGRAPHY', 'RETOUCHING'],
    year: '2024',
    client: '—',
    role: 'Photography, Retouching',
    about: `Hard light, one source, no fill. The studio makes matte glazes that disappear under a softbox, so everything here is lit to bring back an edge.`,
    featured: false,
  },
];
