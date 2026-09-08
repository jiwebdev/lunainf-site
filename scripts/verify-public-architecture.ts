import artifact from '../src/data/public-architecture.json';
import { validatePublicArchitecture } from '../src/lib/publicArchitecture';
import assert from 'node:assert/strict';
import { projectOverview, representatives } from '../src/lib/architectureOverview';

const architecture = validatePublicArchitecture(artifact);

console.log(
  `Public architecture valid: ${architecture.nodes.length} subsystems, ` +
    `${architecture.relationships.length} relationships, ` +
    `${architecture.families.length} families.`,
);

function rejects(label: string, mutate: (draft: any) => void): void {
  const draft = structuredClone(artifact);
  mutate(draft);
  assert.throws(
    () => validatePublicArchitecture(draft),
    `validator accepted invalid fixture: ${label}`,
  );
}

rejects('unknown top-level field', (draft) => { draft.private_commit = 'not-public'; });
rejects('schema version drift', (draft) => { draft.schema_version = 2; });
rejects('disclosure version drift', (draft) => { draft.disclosure_version = 'next'; });
rejects('duplicate node id', (draft) => { draft.nodes[1].id = draft.nodes[0].id; });
rejects('missing family reference', (draft) => { draft.nodes[0].family = 'missing'; });
rejects('missing relationship endpoint', (draft) => { draft.relationships[0].target = 'missing'; });
rejects('missing annotation node', (draft) => { draft.annotations[0].node_ids[0] = 'missing'; });
rejects('unsupported maturity', (draft) => { draft.nodes[0].maturity = 'PARTIAL'; });
rejects('unsupported relationship kind', (draft) => { draft.relationships[0].kind = 'internal'; });

console.log('Validator rejection contracts verified with deterministic negative fixtures.');

const overview = projectOverview();
assert.deepEqual(overview, projectOverview(), 'projection must be deterministic');
assert.deepEqual(overview, projectOverview({ ...artifact, relationships: [...artifact.relationships].reverse() }));
assert.deepEqual(overview.annotation, architecture.annotations.find(a => a.id === 'model-inference'));
const nodeFamily = new Map(architecture.nodes.map(n => [n.id, n.family]));
const expectedPairs = new Map<string, number>();
for (const edge of architecture.relationships) {
  const from = nodeFamily.get(edge.source)!, to = nodeFamily.get(edge.target)!;
  if (from === to) continue;
  const key = [from, to].sort().join(':');
  expectedPairs.set(key, (expectedPairs.get(key) ?? 0) + 1);
}
assert.equal(overview.bundles.length, expectedPairs.size);
for (const bundle of overview.bundles) {
  assert.equal(bundle.count, expectedPairs.get(`${bundle.source}:${bundle.target}`));
  assert.equal(bundle.count, bundle.forward + bundle.reverse);
  assert.equal(bundle.forward, architecture.relationships.filter(e => nodeFamily.get(e.source) === bundle.source && nodeFamily.get(e.target) === bundle.target).length);
}
for (const family of overview.families) {
  const canonical = architecture.families.find(f => f.id === family.id)!;
  assert.equal(family.label, canonical.label);
  assert.equal(family.description, canonical.description);
  assert.equal(family.count, architecture.nodes.filter(n => n.family === family.id).length);
  assert.equal(family.omitted, family.count - family.representatives.length);
  assert.equal(family.incoming, architecture.relationships.filter(e => nodeFamily.get(e.target) === family.id && nodeFamily.get(e.source) !== family.id).length);
  assert.equal(family.outgoing, architecture.relationships.filter(e => nodeFamily.get(e.source) === family.id && nodeFamily.get(e.target) !== family.id).length);
}
for (const invalid of ['missing-node', 'foreground-input', 'working-memory']) {
  const curation = structuredClone(representatives);
  curation.memory.push(invalid);
  assert.throws(() => projectOverview(artifact, curation));
}
const noEdges = projectOverview({ ...artifact, relationships: [] });
assert.equal(noEdges.bundles.length, 0, 'no curated or invented connections');
console.log('Overview representatives, counts, directions, annotation and canonical-only bundles verified.');
