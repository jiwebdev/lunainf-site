import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await filesBelow(resolved) : [resolved]));
  }
  return files;
}

function targetFor(pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!relative) return path.join(dist, 'index.html');
  if (path.extname(relative)) return path.join(dist, relative);
  return path.join(dist, relative, 'index.html');
}

const htmlFiles = (await filesBelow(dist)).filter((file) => file.endsWith('.html'));
const failures = [];
let checked = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const route = '/' + path.relative(dist, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(href)) continue;
    const url = new URL(href, `https://lunainf.com${route}`);
    if (url.origin !== 'https://lunainf.com') continue;
    checked += 1;
    try {
      await access(targetFor(url.pathname));
    } catch {
      failures.push(`${path.relative(dist, file)} -> ${href}`);
    }
  }
}

if (failures.length) throw new Error(`Broken internal links:\n${failures.join('\n')}`);
console.log(`Internal link validation passed for ${checked} generated links.`);
