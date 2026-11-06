// Upload everything in public/m to the R2 bucket. Needs Wrangler logged in (or CLOUDFLARE_API_TOKEN set).
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BUCKET = 'beauty-abode-staging';
const TYPES = { webp: 'image/webp', mp4: 'video/mp4', svg: 'image/svg+xml', woff2: 'font/woff2' };

for (const file of readdirSync('public/m')) {
  const type = TYPES[file.split('.').pop()] || 'application/octet-stream';
  console.log(`→ m/${file}`);
  execFileSync('npx', ['wrangler', 'r2', 'object', 'put', `${BUCKET}/m/${file}`, '--file', `public/m/${file}`, '--content-type', type, '--remote'], { stdio: 'inherit' });
}
