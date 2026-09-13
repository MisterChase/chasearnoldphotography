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
    slug: 'blue-carbon-agera-rs',
    title: 'BLUE CARBON AGERA RS',
    description: "The shot Koenigsegg reposted to their own Instagram",
    services: ['PHOTOGRAPHY'],
    year: '2025',
    client: '@ccol10',
    role: 'Photography',
    about: `One of a handful of Agera RS cars finished in exposed blue carbon, shot on a bluff above the Pacific with the doors up and the engine off. Koenigsegg's own Instagram reposted the lead frame — the closest thing to a review this car needs.`,
    featured: true,
  },
  {
    slug: 'lexus-lfa-passion-project',
    title: 'LEXUS LFA PASSION PROJECT',
    description: 'Chasing sunrises with a Japanese V10',
    services: ['PHOTOGRAPHY'],
    year: '2026',
    client: 'Personal',
    role: 'Photography',
    about: `Golden hour, palm trees, and a car with a 9,000 RPM redline built by hand in Motomachi. No brief, no client — just a reason to shoot something I'd wanted to point a camera at for years.`,
    featured: true,
  },
  {
    slug: 'sonderwunsch-nogaro-blue-gt3rs',
    title: 'SONDERWUNSCH NOGARO BLUE GT3RS',
    description: 'A one-off 911 shot before the fog burned off',
    services: ['PHOTOGRAPHY'],
    year: '2026',
    client: 'Nish',
    role: 'Photography',
    about: `A GT3 RS built through Porsche's Sonderwunsch program, finished in Nogaro Blue — a color that hasn't left the factory since the '80s rally cars. Shot on a dune road at first light, before the fog lifted and the beach houses woke up.`,
    featured: true,
  },
  {
    slug: 'nogaro-blue-rs6',
    title: 'NOGARO BLUE RS6',
    description: 'A wagon, on air, low on the sand',
    services: ['PHOTOGRAPHY'],
    year: '2025',
    client: '—',
    role: 'Photography',
    about: `Audi's own performance division built this as a station wagon, then gave it enough power to embarrass most of what's on the wheel-well decal. On air suspension low enough to leave a belly line in the sand, shot in the twenty minutes before the color left the sky.`,
    featured: true,
  },
  {
    slug: 'lamborghini-fenomeno-quail',
    title: 'LAMBORGHINI FENOMENO — THE QUAIL',
    description: 'A yellow one-off, from the reveal cloth to the lawn',
    services: ['PHOTOGRAPHY'],
    year: '2025',
    client: 'Lamborghini',
    role: 'Photography',
    about: `Twenty-nine of these will ever exist. This one had its cover pulled off in front of a few hundred people at The Quail, then spent the rest of Car Week doing exactly what a car like this is built to do: sit on a lawn in Carmel Valley and make everyone stop talking.`,
    featured: true,
  },
  {
    slug: 'stirling-moss',
    title: 'STIRLING MOSS',
    description: 'On loan from the Mercedes-Benz Museum, no windshield included',
    services: ['PHOTOGRAPHY'],
    year: '2025',
    client: 'Mercedes-Benz Museum',
    role: 'Photography',
    about: `A windshield-less tribute to Sir Stirling Moss's 1955 Mille Miglia win, one of 75 ever built. This example came straight from Mercedes-Benz's own museum in Stuttgart — no visor, no glass, just two headrest fairings and however fast you're willing to go without them.`,
    featured: true,
  },
  {
    slug: 'exploring-spain',
    title: 'EXPLORING SPAIN',
    description: "Gaudí's Barcelona, and the mountains above it",
    services: ['PHOTOGRAPHY'],
    year: '2024',
    client: 'Personal',
    role: 'Photography',
    about: `Ten days between Sagrada Família's stone and stained glass, Park Güell's tile and shadow, and the jagged peaks of Montserrat an hour outside the city. No two blocks of Barcelona look like they belong to the same architect — which, this being Gaudí's city, is mostly true.`,
    featured: true,
  },
  {
    slug: 'hiking-through-mallorca',
    title: 'HIKING THROUGH MALLORCA',
    description: 'A coastal trail, a fishing village, and a lot of wind',
    services: ['PHOTOGRAPHY'],
    year: '2024',
    client: 'Personal',
    role: 'Photography',
    about: `The Cap de Formentor trail on a day the Mediterranean couldn't decide whether it was calm or furious — glassy in the coves, throwing itself against the headlands everywhere else. Came down into Pollença for the parts that don't fit on a ridge: a red Vespa, a garden path, a boat waiting out the wind.`,
    featured: true,
  },
  {
    slug: 'graduation-photos',
    title: 'GRADUATION PHOTOS',
    description: 'Five friends, one commencement weekend at FSU',
    services: ['PHOTOGRAPHY'],
    year: '2026',
    client: '—',
    role: 'Photography',
    about: `A graduation shoot for five friends finishing at Florida State — half formal portrait against the stadium and the stoles, half the two hours after, when someone opens a bottle of champagne on a brick wall because the walk is finally over.`,
    featured: true,
  },
  {
    slug: 'engagement-photos',
    title: 'ENGAGEMENT PHOTOS',
    description: 'The proposal, and everything just after',
    services: ['PHOTOGRAPHY'],
    year: '2026',
    client: '—',
    role: 'Photography',
    about: `One knee on a picnic blanket by the water, then two hours of golden hour before either of them remembered to check the time. Shot as it happened, not staged after the fact — the nerves in the first frame are real.`,
    featured: true,
  },
];
