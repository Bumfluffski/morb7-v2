# Morb7 — Spencer Morby

Astro, static output, deployed to Vercel. Two layers:

- **Layer 1 · experience** — `/` (the fork), `/buying` (the drive), `/selling` (Sixteen Saturdays). Each page mounts a Three.js scene from `src/scenes/` as a client script. GSAP ScrollTrigger drives every scroll effect from a single progress value; there is no smooth-scroll library, on purpose (see decision log turn 5).
- **Layer 2 · reference** — `/about`, `/streets/[suburb]`, `/writing`. Plain HTML, zero client JS, schema in the head via the `schema` prop on `Base.astro`.

```
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/
```

## Rules that are enforced by structure
- Suburb guides render a dashed "Waiting for Spencer" box for any section without his words. There is no way to ship a claim he has not made without deleting that guard.
- The buying/selling choice is a cookie (`morb7_journey`) set by the fork; `Base.astro` highlights the toggle from the `journey` prop; deep links never see the fork.
- `src/lib/world.js` holds the shared 3D helpers (renderer, materials, grid, house, tree, car geometry). The scenes still carry their original inline versions from the prototypes; migrate them to `world.js` as each scene is next touched, not all at once.

## Deploy
Vercel → Framework preset: Astro. No environment variables yet. Add the WhatsApp number as `PUBLIC_WHATSAPP` once Spencer confirms it.
