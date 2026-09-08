import artifact from '../data/public-architecture.json';
import { validatePublicArchitecture } from './publicArchitecture';

// Presentation choices only: membership, copy, counts and connectivity come from the artifact.
export const representatives: Record<string, string[]> = {
  memory: ['working-memory', 'recent-experience', 'recent-life', 'long-term-memory'],
  cognition: ['foreground-cognition', 'activation-field', 'cognitive-scheduler', 'inference-fabric'],
  'background-cognition': ['memory-formation', 'reflection-review'],
  evaluation: ['appraisal-system', 'adaptive-dispositions'],
  perception: ['foreground-input', 'perceptual-continuity'],
  interfaces: ['luna-workbench', 'expression-system', 'realtime-conversation'],
  inference: ['cloud-ai-provider', 'local-ai-provider'],
  infrastructure: ['turn-observation', 'development-awareness', 'chronoforge-lab'],
};

export function projectOverview(input: unknown = artifact, curation = representatives) {
  const architecture = validatePublicArchitecture(input);
  const nodes = new Map(architecture.nodes.map(node => [node.id, node]));
  const seen = new Set<string>();
  if (Object.keys(curation).length !== architecture.families.length ||
      Object.keys(curation).some(id => !architecture.families.some(f => f.id === id))) {
    throw new Error('Overview curation must cover exactly the canonical families');
  }
  const families = architecture.families.map(family => {
    const selected = curation[family.id].map(id => {
      const node = nodes.get(id);
      if (!node || node.family !== family.id || seen.has(id)) {
        throw new Error(`Invalid overview representative: ${id}`);
      }
      seen.add(id);
      return node;
    });
    const count = architecture.nodes.filter(node => node.family === family.id).length;
    return { ...family, representatives: selected, count, omitted: count - selected.length,
      incoming: 0, outgoing: 0 };
  });
  const byFamily = new Map(families.map(family => [family.id, family]));
  const pairs = new Map<string, { source: string; target: string; forward: number; reverse: number; count: number; width: number }>();
  for (const relationship of architecture.relationships) {
    const from = nodes.get(relationship.source)!.family;
    const to = nodes.get(relationship.target)!.family;
    if (from === to) continue;
    byFamily.get(from)!.outgoing++;
    byFamily.get(to)!.incoming++;
    const [source, target] = [from, to].sort();
    const key = `${source}:${target}`;
    const pair = pairs.get(key) ?? { source, target, forward: 0, reverse: 0, count: 0, width: 0 };
    pair[from === source ? 'forward' : 'reverse']++;
    pair.count++;
    // Square-root scaling keeps sparse connections visible without overwhelming dense ones.
    pair.width = 3 + 3 * Math.sqrt(pair.count);
    pairs.set(key, pair);
  }
  const annotation = architecture.annotations.find(item => item.id === 'model-inference');
  if (!annotation) throw new Error('Missing canonical inference annotation');
  return { families, bundles: [...pairs.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, pair]) => pair), annotation };
}

export const overview = projectOverview();
