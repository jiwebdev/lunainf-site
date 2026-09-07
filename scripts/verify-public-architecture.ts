import artifact from '../src/data/public-architecture.json';
import { validatePublicArchitecture } from '../src/lib/publicArchitecture';
import assert from 'node:assert/strict';

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
