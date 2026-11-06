# The Beauty Abode

Website for The Beauty Abode, Birchington. Built by [Morphed Studio](https://morphed.studio).

This repo is the **demo staging site**: one page (`public/index.html`) with three views (Home, Treatments, Courses), served by a Cloudflare Worker.

## How it is served

- `public/` holds the site. Static assets are bundled with the Worker.
- `src/worker.js` runs first on every request. Anything under `/m/` (images, video, font, logos) is read from the R2 bucket `beauty-abode-staging`, with byte-range support so video streams properly. If a file is not in R2 yet, the bundled copy in `public/m` is served instead, so the site never breaks.
- Staging is kept out of search engines (`X-Robots-Tag: noindex`, `robots.txt` disallows all).

## Deploy

Connected to Cloudflare Workers Builds, so every push to `main` deploys.

- Build command: *(none)*
- Deploy command: `npx wrangler deploy`

To push media to R2 (run once, and again when files in `public/m` change):

```sh
npm install
npx wrangler login
npm run sync:r2
```

## Local preview

```sh
npm install
npm run dev
```

## Still to confirm before launch

Email address, Facebook page, course prices and dates, accrediting body, group size.
