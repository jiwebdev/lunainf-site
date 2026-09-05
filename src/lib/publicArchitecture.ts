import artifact from '../data/public-architecture.json';

export const PUBLIC_ARCHITECTURE_SCHEMA_VERSION = 1 as const;
export const PUBLIC_ARCHITECTURE_DISCLOSURE_VERSION = 'public-architecture-v1' as const;

export const PUBLIC_MATURITIES = [
  'WORKING',
  'WORKING + GROWING',
  'EXPERIMENTAL',
  'ARCHITECTURAL',
] as const;

export const PUBLIC_RELATIONSHIP_KINDS = [
  'can-activate',
  'contributes-to',
  'coordinates-with',
  'expresses-through',
  'influences',
  'provides-context-to',
  'records-into',
  'requests-inference-from',
  'routes-inference-to',
  'supports',
] as const;

export type PublicMaturity = (typeof PUBLIC_MATURITIES)[number];
export type PublicRelationshipKind = (typeof PUBLIC_RELATIONSHIP_KINDS)[number];

export interface PublicArchitectureFamily {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface PublicArchitecturePosition {
  x: number;
  y: number;
}

export interface PublicArchitectureNode {
  id: string;
  label: string;
  family: string;
  description: string;
  maturity: PublicMaturity;
  position: PublicArchitecturePosition;
  annotation_ids: string[];
  maturity_explanation?: string;
  why_it_matters?: string;
  example?: string;
}

export interface PublicArchitectureRelationship {
  source: string;
  target: string;
  kind: PublicRelationshipKind;
  label: string;
}

export interface PublicArchitectureAnnotation {
  id: string;
  label: string;
  description: string;
  node_ids: string[];
}

export interface PublicArchitecture {
  schema_version: typeof PUBLIC_ARCHITECTURE_SCHEMA_VERSION;
  disclosure_version: typeof PUBLIC_ARCHITECTURE_DISCLOSURE_VERSION;
  title: string;
  summary: string;
  families: PublicArchitectureFamily[];
  nodes: PublicArchitectureNode[];
  relationships: PublicArchitectureRelationship[];
  annotations: PublicArchitectureAnnotation[];
}

const TOP_LEVEL_KEYS = [
  'schema_version',
  'disclosure_version',
  'title',
  'summary',
  'families',
  'nodes',
  'relationships',
  'annotations',
] as const;
const FAMILY_KEYS = ['id', 'label', 'description', 'color'] as const;
const NODE_REQUIRED_KEYS = ['id', 'label', 'family', 'description', 'maturity', 'position', 'annotation_ids'] as const;
const NODE_OPTIONAL_KEYS = ['maturity_explanation', 'why_it_matters', 'example'] as const;
const POSITION_KEYS = ['x', 'y'] as const;
const RELATIONSHIP_KEYS = ['source', 'target', 'kind', 'label'] as const;
const ANNOTATION_KEYS = ['id', 'label', 'description', 'node_ids'] as const;
const PUBLIC_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_COLOR = /^#[0-9a-fA-F]{6}$/;

function fail(path: string, message: string): never {
  throw new Error(`Invalid public architecture at ${path}: ${message}`);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'expected an object');
  }
  return value as Record<string, unknown>;
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'expected an array');
  return value;
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  path: string,
): void {
  const allowed = new Set([...required, ...optional]);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  const missing = required.filter((key) => !(key in value));
  if (unknown.length) fail(path, `unknown field(s): ${unknown.join(', ')}`);
  if (missing.length) fail(path, `missing field(s): ${missing.join(', ')}`);
}

function nonEmptyString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') fail(path, 'expected a non-empty string');
  return value;
}

function publicId(value: unknown, path: string): string {
  const id = nonEmptyString(value, path);
  if (!PUBLIC_ID.test(id)) fail(path, 'expected a lowercase public identifier');
  return id;
}

function stringList(value: unknown, path: string): string[] {
  return array(value, path).map((entry, index) => publicId(entry, `${path}[${index}]`));
}

function uniqueIds(values: readonly { id: string }[], path: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) fail(path, `duplicate id: ${value.id}`);
    seen.add(value.id);
  }
}

export function validatePublicArchitecture(value: unknown): PublicArchitecture {
  const root = record(value, '$');
  exactKeys(root, TOP_LEVEL_KEYS, [], '$');

  if (root.schema_version !== PUBLIC_ARCHITECTURE_SCHEMA_VERSION) {
    fail('$.schema_version', `expected ${PUBLIC_ARCHITECTURE_SCHEMA_VERSION}`);
  }
  if (root.disclosure_version !== PUBLIC_ARCHITECTURE_DISCLOSURE_VERSION) {
    fail('$.disclosure_version', `expected ${PUBLIC_ARCHITECTURE_DISCLOSURE_VERSION}`);
  }
  nonEmptyString(root.title, '$.title');
  nonEmptyString(root.summary, '$.summary');

  const families = array(root.families, '$.families').map((entry, index) => {
    const path = `$.families[${index}]`;
    const item = record(entry, path);
    exactKeys(item, FAMILY_KEYS, [], path);
    const family: PublicArchitectureFamily = {
      id: publicId(item.id, `${path}.id`),
      label: nonEmptyString(item.label, `${path}.label`),
      description: nonEmptyString(item.description, `${path}.description`),
      color: nonEmptyString(item.color, `${path}.color`),
    };
    if (!PUBLIC_COLOR.test(family.color)) fail(`${path}.color`, 'expected a six-digit hexadecimal color');
    return family;
  });

  const nodes = array(root.nodes, '$.nodes').map((entry, index) => {
    const path = `$.nodes[${index}]`;
    const item = record(entry, path);
    exactKeys(item, NODE_REQUIRED_KEYS, NODE_OPTIONAL_KEYS, path);
    const position = record(item.position, `${path}.position`);
    exactKeys(position, POSITION_KEYS, [], `${path}.position`);
    if (typeof position.x !== 'number' || !Number.isFinite(position.x)) fail(`${path}.position.x`, 'expected a finite number');
    if (typeof position.y !== 'number' || !Number.isFinite(position.y)) fail(`${path}.position.y`, 'expected a finite number');
    const maturity = nonEmptyString(item.maturity, `${path}.maturity`);
    if (!(PUBLIC_MATURITIES as readonly string[]).includes(maturity)) {
      fail(`${path}.maturity`, `unsupported value: ${maturity}`);
    }
    const node: PublicArchitectureNode = {
      id: publicId(item.id, `${path}.id`),
      label: nonEmptyString(item.label, `${path}.label`),
      family: publicId(item.family, `${path}.family`),
      description: nonEmptyString(item.description, `${path}.description`),
      maturity: maturity as PublicMaturity,
      position: { x: position.x, y: position.y },
      annotation_ids: stringList(item.annotation_ids, `${path}.annotation_ids`),
    };
    for (const key of NODE_OPTIONAL_KEYS) {
      if (key in item) node[key] = nonEmptyString(item[key], `${path}.${key}`);
    }
    return node;
  });

  const relationships = array(root.relationships, '$.relationships').map((entry, index) => {
    const path = `$.relationships[${index}]`;
    const item = record(entry, path);
    exactKeys(item, RELATIONSHIP_KEYS, [], path);
    const kind = nonEmptyString(item.kind, `${path}.kind`);
    if (!(PUBLIC_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) {
      fail(`${path}.kind`, `unsupported value: ${kind}`);
    }
    return {
      source: publicId(item.source, `${path}.source`),
      target: publicId(item.target, `${path}.target`),
      kind: kind as PublicRelationshipKind,
      label: nonEmptyString(item.label, `${path}.label`),
    } satisfies PublicArchitectureRelationship;
  });

  const annotations = array(root.annotations, '$.annotations').map((entry, index) => {
    const path = `$.annotations[${index}]`;
    const item = record(entry, path);
    exactKeys(item, ANNOTATION_KEYS, [], path);
    return {
      id: publicId(item.id, `${path}.id`),
      label: nonEmptyString(item.label, `${path}.label`),
      description: nonEmptyString(item.description, `${path}.description`),
      node_ids: stringList(item.node_ids, `${path}.node_ids`),
    } satisfies PublicArchitectureAnnotation;
  });

  uniqueIds(families, '$.families');
  uniqueIds(nodes, '$.nodes');
  uniqueIds(annotations, '$.annotations');

  const familyIds = new Set(families.map(({ id }) => id));
  const nodeIds = new Set(nodes.map(({ id }) => id));
  const annotationIds = new Set(annotations.map(({ id }) => id));
  for (const node of nodes) {
    if (!familyIds.has(node.family)) fail(`$.nodes.${node.id}.family`, `missing family: ${node.family}`);
    if (new Set(node.annotation_ids).size !== node.annotation_ids.length) {
      fail(`$.nodes.${node.id}.annotation_ids`, 'duplicate annotation id');
    }
    for (const annotationId of node.annotation_ids) {
      if (!annotationIds.has(annotationId)) fail(`$.nodes.${node.id}.annotation_ids`, `missing annotation: ${annotationId}`);
      const annotation = annotations.find(({ id }) => id === annotationId)!;
      if (!annotation.node_ids.includes(node.id)) {
        fail(`$.nodes.${node.id}.annotation_ids`, `annotation ${annotationId} does not include this node`);
      }
    }
  }
  for (const relationship of relationships) {
    if (!nodeIds.has(relationship.source)) fail('$.relationships', `missing source node: ${relationship.source}`);
    if (!nodeIds.has(relationship.target)) fail('$.relationships', `missing target node: ${relationship.target}`);
  }
  const relationshipKeys = relationships.map(({ source, target, kind, label }) => `${source}\u0000${target}\u0000${kind}\u0000${label}`);
  if (new Set(relationshipKeys).size !== relationshipKeys.length) fail('$.relationships', 'duplicate relationship');
  for (const annotation of annotations) {
    const annotationNodeIds = new Set(annotation.node_ids);
    if (annotationNodeIds.size !== annotation.node_ids.length) fail(`$.annotations.${annotation.id}.node_ids`, 'duplicate node id');
    for (const nodeId of annotation.node_ids) {
      if (!nodeIds.has(nodeId)) fail(`$.annotations.${annotation.id}.node_ids`, `missing node: ${nodeId}`);
      const node = nodes.find(({ id }) => id === nodeId)!;
      if (!node.annotation_ids.includes(annotation.id)) {
        fail(`$.annotations.${annotation.id}.node_ids`, `node ${nodeId} does not declare this annotation`);
      }
    }
  }

  return root as unknown as PublicArchitecture;
}

export const publicArchitecture = validatePublicArchitecture(artifact);

export function publicArchitectureCounts(architecture: PublicArchitecture = publicArchitecture) {
  return {
    nodes: architecture.nodes.length,
    relationships: architecture.relationships.length,
    families: architecture.families.length,
  } as const;
}
