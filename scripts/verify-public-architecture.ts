import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validatePublicArchitecture, publicArchitectureCounts } from '../src/lib/publicArchitecture';

const artifactUrl = new URL('../src/data/public-architecture.json', import.meta.url);
const expectedSha256 = '521faf4d63c3d5c155ce45e3e69ee40a68566fd808457bdbe29c8692a95b24cd';
const artifactBytes = await readFile(artifactUrl);
const actualSha256 = createHash('sha256').update(artifactBytes).digest('hex');
if (actualSha256 !== expectedSha256) {
  throw new Error(`Reviewed public architecture copy changed: expected ${expectedSha256}, received ${actualSha256}`);
}
const raw = artifactBytes.toString('utf8');
const architecture = validatePublicArchitecture(JSON.parse(raw));
const counts = publicArchitectureCounts(architecture);

function expectRejected(name: string, change: (copy: any) => void): void {
  const copy = structuredClone(architecture);
  change(copy);
  try {
    validatePublicArchitecture(copy);
  } catch {
    return;
  }
  throw new Error(`Validator accepted invalid fixture: ${name}`);
}

expectRejected('unknown top-level field', (copy) => { copy.private = true; });
expectRejected('unexpected schema version', (copy) => { copy.schema_version = 2; });
expectRejected('unexpected disclosure version', (copy) => { copy.disclosure_version = 'future'; });
expectRejected('duplicate node id', (copy) => { copy.nodes[1].id = copy.nodes[0].id; });
expectRejected('missing family reference', (copy) => { copy.nodes[0].family = 'missing-family'; });
expectRejected('missing relationship node', (copy) => { copy.relationships[0].target = 'missing-node'; });
expectRejected('missing annotation node', (copy) => { copy.annotations[0].node_ids[0] = 'missing-node'; });
expectRejected('mismatched node annotation', (copy) => { copy.nodes.find((node: any) => node.annotation_ids.length).annotation_ids = []; });
expectRejected('unknown maturity', (copy) => { copy.nodes[0].maturity = 'COMPLETE'; });
expectRejected('unknown relationship kind', (copy) => { copy.relationships[0].kind = 'calls'; });
expectRejected('unknown nested field', (copy) => { copy.nodes[0].position.z = 1; });

const forbiddenSourcePatterns = [
  /fetch\s*\(/i,
  /EventSource/i,
  /WebSocket/i,
  /\/api\//i,
  /localhost/i,
  /127\.0\.0\.1/i,
  /sqlite/i,
  /\.snapshot\.db/i,
  /public_exports/i,
  /[A-Z]:\\Users\\/i,
] as const;

const integrationFiles = [
  new URL('../src/components/ArchitectureExplorer.astro', import.meta.url),
  new URL('../src/lib/publicArchitecture.ts', import.meta.url),
] as const;

for (const url of integrationFiles) {
  const source = await readFile(url, 'utf8');
  for (const pattern of forbiddenSourcePatterns) {
    if (pattern.test(source)) {
      throw new Error(`Static architecture boundary failed: ${pattern} found in ${fileURLToPath(url)}`);
    }
  }
}

console.log(
  `Validated exact public architecture ${actualSha256}: ${counts.nodes} nodes, ${counts.relationships} relationships, ${counts.families} families.`,
);
