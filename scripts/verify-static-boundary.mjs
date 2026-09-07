import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const roots = [
  'src/components/ArchitectureExplorer.astro',
  'src/components/ArchitecturePreview.astro',
  'src/data/public-architecture.json',
  'src/lib/publicArchitecture.ts',
  'src/pages/architecture.astro',
];

const forbidden = [
  ['runtime fetch', /\bfetch\s*\(/i],
  ['EventSource client', /\bEventSource\b/],
  ['WebSocket client', /\bWebSocket\b/],
  ['runtime API path', /\/api(?:\/|\b)/i],
  ['loopback host', /\b(?:localhost|127\.0\.0\.1)\b/i],
  ['SQLite reference', /\bsqlite\b/i],
  ['legacy internal realtime capability id', /interaction\.realtime_webrtc/i],
];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(target)));
    else if (/\.(?:html|js|mjs|json)$/i.test(entry.name)) files.push(target);
  }
  return files;
}

const candidates = [...roots];
try {
  candidates.push(...(await filesBelow('dist')));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

const failures = [];
for (const filename of candidates) {
  const text = await readFile(filename, 'utf8');
  for (const [label, pattern] of forbidden) {
    if (pattern.test(text)) failures.push(`${filename}: ${label}`);
  }
}

if (failures.length) {
  throw new Error(`Static architecture boundary failed:\n${failures.join('\n')}`);
}
console.log(`Static architecture boundary valid across ${candidates.length} files.`);
