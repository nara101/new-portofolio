# Nabila Ramadhanty — Portfolio

Next.js 16 · TypeScript · Tailwind · Framer Motion · GSAP ScrollTrigger · Lenis

## Run it

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (blocked while placeholders remain)
npm start
```

## The placeholder guard

`npm run build` runs `scripts/check-placeholders.mjs` first and **fails** while
any filler copy is still in `src/content/site.ts`. This is deliberate.

Testimonials, metrics and awards are claims a recruiter can check. Placeholder
copy has a way of surviving to production, and an invented quote attributed to a
real-sounding person is very hard to walk back. So filler cannot ship by
accident.

To replace content:

1. Edit the entry in `src/content/site.ts`.
2. Change `placeholder(...)` to `real(...)` for that export.
3. `npm run check:placeholders` should print `✓ No placeholder content found.`

`npm run build:allow-placeholders` bypasses the guard for local preview only.
Don't deploy the output.

### Still filler

| Export | Section | Notes |
| --- | --- | --- |
| `testimonials` | Words | Renders a visible "awaiting real quotes" notice instead of fake ones. Ask a Bangkit mentor, your Diskominfo-SP supervisor, or a Generation Girls colleague — or delete the section. |
| `achievements` | — | Not currently rendered. Only add numbers you can defend. |
| `learningJourney` | — | Not currently rendered. |

Everything else is real: the About copy (grammar-edited only), both timelines,
nine certificates, four projects, and the skills list. Project tech stacks were
read off the live deployed sites, not guessed. The GitHub section is live from
the API.

## Structure

```
src/
  app/          layout (fonts, metadata, no-JS fallback), globals.css, page
  content/      site.ts (all copy) + types.ts (provenance system)
  components/
    sections/   one file per section, each with a distinct interaction
    ui/         Aurora, Cursor, Loader, Nav, Magnetic, Reveal, EasterEggs
    providers/  SmoothScroll (Lenis + GSAP ticker)
  lib/          utils, useReducedMotion / useFinePointer
scripts/        check-placeholders.mjs
legacy/         the previous static site, untouched, for reference
```

## Motion and accessibility

Every animated surface is neutralised by `prefers-reduced-motion: reduce`:

- Lenis is not initialised at all — native scroll takes over.
- The custom cursor never mounts, and the system cursor is only hidden once the
  custom one is actually rendering (`body[data-custom-cursor="on"]`).
- The intro loader is dismissed before first paint.
- Aurora pointer-parallax is disabled.

Also: skip link, one `<h1>`, focus-visible rings, focus trap + scroll lock in the
PDF dialog, and the skills constellation is a decorative `aria-hidden` SVG backed
by a real keyboard-navigable list. The `<noscript>` block in `layout.tsx` forces
every reveal visible if JS fails — otherwise the page would be blank rather than
merely static.

## Known issues

**OneDrive.** The project lives in `OneDrive/Documents`, and OneDrive
intermittently locks `.next` mid-sync, producing:

```
Error: EPERM: operation not permitted, rmdir '...\.next\static\...'
```

Re-running the build usually clears it. The real fix is to move the project
outside OneDrive, or exclude `node_modules` and `.next` from sync.

**Fonts.** The brief named Satoshi / General Sans / Clash Display. Those are
Fontshare-licensed and can't be self-hosted through `next/font`, so display is
Plus Jakarta Sans and body is Inter — both self-hosted, no layout shift. If you
want Clash Display, it needs a Fontshare CDN link and costs a render-blocking
request.

## Suggested next

- The site says "Web Developer", but the record (Bangkit, TensorFlow ×2,
  Stanford ML, Math for ML, Associate Data Scientist, Data Science Mentor) is
  weighted toward data/ML. Consider whether that title undersells you.
- The four projects have no `challenge` / `solution` written. The `Project` type
  already has those fields; the case-study panel will use them.
"# new-portofolio" 
