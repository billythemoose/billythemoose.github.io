// Checks that every URL the Jekyll site served still exists in the Astro build.
// Usage: npm run build && npm run check:urls
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LIST = 'scripts/jekyll-urls.txt';
const DIST = 'dist';

const toFile = (url) => join(DIST, url.endsWith('/') ? `${url}index.html` : url);

const entries = readFileSync(LIST, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => ({ dropped: line.startsWith('!'), url: line.replace(/^!/, '') }));

const missing = entries.filter(({ dropped, url }) => !dropped && !existsSync(toFile(url)));
const dropped = entries.filter(({ dropped }) => dropped);

for (const { url } of dropped) console.log(`dropped  ${url}`);
for (const { url } of missing) console.error(`MISSING  ${url}`);

const kept = entries.length - dropped.length;
console.log(
  `\n${kept - missing.length}/${kept} kept URLs found, ${dropped.length} dropped on purpose.`,
);
process.exit(missing.length > 0 ? 1 : 0);
