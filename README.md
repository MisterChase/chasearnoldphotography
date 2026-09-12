# Your portfolio

Everything you'll normally change lives in **two files** and **one folder**:

```
site.config.js          ← your name, bio, email, links, colours
content/projects.js     ← the list of your projects
source-media/           ← your actual photos and videos
```

You never have to touch anything else.

---

## First: the one command you always run

After *any* change you make, run this:

```bash
npm run build
```

Then to look at it on your own computer:

```bash
npm run serve
```

That prints a link (`http://localhost:4321`). Open it in your browser. That's
your site. It's only visible to you until you publish.

To publish it to the internet, see [Putting it online](#putting-it-online) at the bottom.

---

## How do I change my name, bio, or email?

Open **`site.config.js`**. Near the top you'll see:

```js
name: 'CHASE ARNOLD',
role: 'DIGITAL MEDIA',
bio: `I design and direct visual work across...`,
email: 'chasearnold2004@gmail.com',
```

Change the text between the quotes. Save. Run `npm run build`.

Your Instagram / LinkedIn / Vimeo links are just below that, in `socials`.
Replace the `url:` values with your real profiles. Delete any line you don't
want; add more the same way.

---

## How do I change the big opening photo?

The homepage opens on one full-screen photo that dissolves away as you scroll.

1. Put your photo in the folder **`source-media/_hero/`**
2. Open `site.config.js`, find `hero:`, and write your filename:

```js
hero: {
  image: 'my-best-shot.jpg',      ← just the filename
  caption: 'SELECTED WORK — 2024/2026',
  dissolveLength: 0.9,            ← bigger = photo lingers longer
},
```

3. `npm run build`

Use a wide (landscape) photo — it fills the whole screen. It can be as big as
it wants; the site shrinks it for you.

---

## How do I add a project?

**Step 1.** In Terminal, run this with your project's name:

```bash
npm run new "Rooftops"
```

That creates a folder for you and adds a starter entry.

**Step 2.** Put your photos and videos in the folder it just made —
`source-media/rooftops/`. Name them in the order you want people to see them:

```
01-cover.jpg
02-street.jpg
03-window.jpg
```

The numbers control the order. Files can be huge — 10MB, 50MB, straight off
the camera. They never get uploaded; the site makes small copies automatically.

**Step 3.** Open `content/projects.js`, find the entry it added, and fill in
the blanks:

```js
{
  slug: 'rooftops',                             ← leave this alone
  title: 'ROOFTOPS',                            ← shown on the site
  description: 'A year of looking down',        ← one line, under the title
  services: ['PHOTOGRAPHY'],                    ← the tags in brackets
  year: '2026',
  client: 'Personal',
  role: 'Photography',
  about: `A longer paragraph about the work.`,  ← optional, delete if unwanted
  featured: false,                              ← true makes the tile bigger
},
```

**Step 4.** `npm run build`

---

## How do I change the order things appear in?

**Projects on the homepage:** they appear in the same order they're listed in
`content/projects.js`. Cut and paste an entry higher up to move it up.

**Photos inside a project:** rename the files. `01-` comes before `02-`.

---

## How do I make a photo bigger or smaller on the page?

Rename the file and add a tag before the `.jpg`:

| Rename it to | What it does |
|---|---|
| `03-shot@full.jpg` | Fills the whole screen, edge to edge |
| `03-shot@wide.jpg` | Big, with a margin down the sides |
| `03-shot@half.jpg` | Half width — two of these sit side by side |
| `03-shot@third.jpg` | Third width — three sit in a row |

If you don't add a tag, the site decides for you: tall photos pair up, wide
photos run wide. That usually looks right, so only use the tags when you want
something specific.

---

## How do I add a video?

**Short clip, no sound** (a few seconds, plays by itself): just drop the `.mp4`
or `.mov` into the project folder like a photo. Done.

To make a clip play when someone hovers over the project on the homepage, name
it `cover@loop.mp4`.

**A real video with sound:** upload it to Vimeo or YouTube first, then paste the
link into that project in `content/projects.js`:

```js
video: 'https://vimeo.com/123456789',
```

Why not just upload it here? Video files are enormous. Vimeo and YouTube handle
that for free and your site stays fast.

---

## How do I delete a project?

1. Delete its folder from `source-media/`
2. Delete its entry from `content/projects.js` (everything from `{` to `},`)
3. `npm run build`

---

## How do I change the colours?

In `site.config.js`:

```js
theme: {
  ink:    '#0b0a0a',   ← page background
  paper:  '#fbfafa',   ← main text
  dim:    '#7a7674',   ← small grey text
  accent: '#9db4c0',   ← project descriptions, highlights
  mode: 'dark',        ← change to 'light' for a white site
},
```

Fonts are right below that, with a few suggested pairings in the comments.

---

## Putting it online

Your site is live at:

**https://misterchase.github.io/chasearnoldphotography/**

To push your latest changes to it:

```bash
npm run deploy
```

That builds the site and uploads it. Takes about a minute. Refresh the page
after and your changes are there.

### Want a proper domain like chasearnoldphotography.com?

Buy the domain (about $12/year from Namecheap, Cloudflare, or Porkbun), then:

1. In your GitHub repo → **Settings → Pages → Custom domain**, enter it
2. At your registrar, add the DNS records GitHub shows you
3. In `site.config.js`, set `basePath: ''` and update `siteUrl` to your domain
4. `npm run deploy`

Hosting stays free — you're only paying for the name.

---

## If something goes wrong

**The site looks broken / images are missing**
Run `npm run build` and read what it prints. It tells you in plain English
what it couldn't find.

**A change didn't show up**
You probably forgot `npm run build`. It's needed every time.

**Everything is really messed up**
```bash
npm run clean
npm run build
```
That throws away the cache and rebuilds from scratch. Takes a minute or two.
It can't damage your original photos — those are never modified.

---

## Getting rid of the demo content

The site ships with six made-up projects and a placeholder opening photo so you
could see it working. To clear them out:

1. Delete the folders inside `source-media/` (including `_hero`)
2. Open `content/projects.js` and delete all six entries
3. Add your own, following [How do I add a project?](#how-do-i-add-a-project)

---

## The technical bits (you can ignore this)

Your original files stay on your computer and are never uploaded. When you run
`npm run build`, the site reads them and writes small web-sized copies into
`dist/` — AVIF, WebP and JPEG at five different sizes each, plus a tiny blurred
version that shows instantly while the real one loads. A visitor's browser picks
whichever one suits their screen. A 12MB camera file typically reaches them as
about 200KB.

The first build takes a minute or two. After that only files you actually
changed get reprocessed, so it's near-instant.

Built with no framework — plain HTML, CSS and JavaScript generated by a small
Node script in `scripts/`. It works with JavaScript turned off, works with a
keyboard, and respects the system "reduce motion" setting.
