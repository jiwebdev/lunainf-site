import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const dist = resolve('dist');
const forbidden = [
  /\/api\//i,
  /EventSource/i,
  /WebSocket/i,
  /localhost/i,
  /127\.0\.0\.1/i,
  /sqlite/i,
  /\.snapshot\.db/i,
  /public_exports/i,
  /[A-Z]:\\Users\\/i,
  /"(?:capability_id|concept_id|implementation_name|source_paths?|runtime_state|private_node_id)"/i,
];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return nested.flat();
}

const files = await filesUnder(dist);
const textFiles = files.filter((file) => /\.(?:html|js|css|xml|txt)$/i.test(file));
for (const file of textFiles) {
  const contents = await readFile(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(contents)) {
      throw new Error(`Static output boundary failed: ${pattern} found in ${relative(dist, file)}`);
    }
  }
}

const htmlFiles = textFiles.filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) {
  const contents = await readFile(file, 'utf8');
  const hrefs = [...contents.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    if (!pathname || pathname.includes('.')) continue;
    const destination = pathname === '/'
      ? resolve(dist, 'index.html')
      : resolve(dist, pathname.slice(1), 'index.html');
    try {
      if (!(await stat(destination)).isFile()) throw new Error('not a file');
    } catch {
      throw new Error(`Broken internal link ${href} in ${relative(dist, file)}`);
    }
  }
}

const architectureHtml = await readFile(resolve(dist, 'architecture', 'index.html'), 'utf8');
for (const required of [
  '46 subsystems',
  '57 relationships',
  '8 architectural families',
  'AI model inference happens here',
  'data-architecture-search',
  'data-family-filter',
  'data-zoom="reset"',
  'data-directory-node',
  'tabindex="0"',
  '<noscript>',
]) {
  if (!architectureHtml.includes(required)) throw new Error(`Architecture output is missing: ${required}`);
}

console.log(`Validated ${textFiles.length} static output files and internal page links.`);
