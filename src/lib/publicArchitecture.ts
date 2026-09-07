export const PUBLIC_ARCHITECTURE_MATURITIES = [
  'WORKING',
  'WORKING + GROWING',
  'EXPERIMENTAL',
  'ARCHITECTURAL',
] as const;

export const PUBLIC_ARCHITECTURE_RELATIONSHIP_KINDS = [
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

export type PublicMaturity = (typeof PUBLIC_ARCHITECTURE_MATURITIES)[number];
export type PublicRelationshipKind =
  (typeof PUBLIC_ARCHITECTURE_RELATIONSHIP_KINDS)[number];

export interface PublicArchitectureFamily {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface PublicArchitectureNode {
  id: string;
  label: string;
  family: string;
  description: string;
  maturity: PublicMaturity;
  position: { x: number; y: number };
  annotation_ids: string[];
  why_it_matters?: string;
  example?: string;
  maturity_explanation?: string;
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
  schema_version: 1;
  disclosure_version: 'public-architecture-v1';
  title: string;
  summary: string;
  families: PublicArchitectureFamily[];
  nodes: PublicArchitectureNode[];
  relationships: PublicArchitectureRelationship[];
  annotations: PublicArchitectureAnnotation[];
}

const maturityValues = new Set<string>(PUBLIC_ARCHITECTURE_MATURITIES);
const relationshipKinds = new Set<string>(PUBLIC_ARCHITECTURE_RELATIONSHIP_KINDS);

function fail(path: string, message: string): never {
  throw new Error(`Invalid public architecture at ${path}: ${message}`);
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(path, 'expected an object');
  }
  return value as Record<string, unknown>;
}

function exactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[],
  path: string,
): void {
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(path, `unknown field ${JSON.stringify(key)}`);
  }
  for (const key of required) {
    if (!(key in value)) fail(path, `missing required field ${JSON.stringify(key)}`);
  }
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(path, 'expected a non-empty string');
  }
  return value;
}

function numberAt(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'expected a finite number');
  }
  return value;
}

function arrayAt(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'expected an array');
  return value;
}

function stringArrayAt(value: unknown, path: string): string[] {
  return arrayAt(value, path).map((item, index) => stringAt(item, `${path}[${index}]`));
}

function optionalStringAt(
  value: Record<string, unknown>,
  key: string,
  path: string,
): string | undefined {
  return key in value ? stringAt(value[key], `${path}.${key}`) : undefined;
}

function uniqueIds(items: readonly { id: string }[], path: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) fail(path, `duplicate id ${JSON.stringify(item.id)}`);
    seen.add(item.id);
  }
}

export function validatePublicArchitecture(input: unknown): PublicArchitecture {
  const root = objectAt(input, '$');
  exactKeys(
    root,
    [
      'schema_version',
      'disclosure_version',
      'title',
      'summary',
      'families',
      'nodes',
      'relationships',
      'annotations',
    ],
    [],
    '$',
  );
  if (root.schema_version !== 1) fail('$.schema_version', 'expected exactly 1');
  if (root.disclosure_version !== 'public-architecture-v1') {
    fail('$.disclosure_version', 'expected exactly "public-architecture-v1"');
  }

  const families = arrayAt(root.families, '$.families').map((value, index) => {
    const path = `$.families[${index}]`;
    const family = objectAt(value, path);
    exactKeys(family, ['id', 'label', 'description', 'color'], [], path);
    const color = stringAt(family.color, `${path}.color`);
    if (!/^#[0-9a-f]{6}$/i.test(color)) fail(`${path}.color`, 'expected a six-digit hex color');
    return {
      id: stringAt(family.id, `${path}.id`),
      label: stringAt(family.label, `${path}.label`),
      description: stringAt(family.description, `${path}.description`),
      color,
    };
  });

  const nodes = arrayAt(root.nodes, '$.nodes').map((value, index) => {
    const path = `$.nodes[${index}]`;
    const node = objectAt(value, path);
    exactKeys(
      node,
      ['id', 'label', 'family', 'description', 'maturity', 'position', 'annotation_ids'],
      ['why_it_matters', 'example', 'maturity_explanation'],
      path,
    );
    const maturity = stringAt(node.maturity, `${path}.maturity`);
    if (!maturityValues.has(maturity)) fail(`${path}.maturity`, `unsupported value ${maturity}`);
    const position = objectAt(node.position, `${path}.position`);
    exactKeys(position, ['x', 'y'], [], `${path}.position`);
    return {
      id: stringAt(node.id, `${path}.id`),
      label: stringAt(node.label, `${path}.label`),
      family: stringAt(node.family, `${path}.family`),
      description: stringAt(node.description, `${path}.description`),
      maturity: maturity as PublicMaturity,
      position: {
        x: numberAt(position.x, `${path}.position.x`),
        y: numberAt(position.y, `${path}.position.y`),
      },
      annotation_ids: stringArrayAt(node.annotation_ids, `${path}.annotation_ids`),
      why_it_matters: optionalStringAt(node, 'why_it_matters', path),
      example: optionalStringAt(node, 'example', path),
      maturity_explanation: optionalStringAt(node, 'maturity_explanation', path),
    };
  });

  const relationships = arrayAt(root.relationships, '$.relationships').map(
    (value, index) => {
      const path = `$.relationships[${index}]`;
      const relationship = objectAt(value, path);
      exactKeys(relationship, ['source', 'target', 'kind', 'label'], [], path);
      const kind = stringAt(relationship.kind, `${path}.kind`);
      if (!relationshipKinds.has(kind)) fail(`${path}.kind`, `unsupported value ${kind}`);
      return {
        source: stringAt(relationship.source, `${path}.source`),
        target: stringAt(relationship.target, `${path}.target`),
        kind: kind as PublicRelationshipKind,
        label: stringAt(relationship.label, `${path}.label`),
      };
    },
  );

  const annotations = arrayAt(root.annotations, '$.annotations').map((value, index) => {
    const path = `$.annotations[${index}]`;
    const annotation = objectAt(value, path);
    exactKeys(annotation, ['id', 'label', 'description', 'node_ids'], [], path);
    return {
      id: stringAt(annotation.id, `${path}.id`),
      label: stringAt(annotation.label, `${path}.label`),
      description: stringAt(annotation.description, `${path}.description`),
      node_ids: stringArrayAt(annotation.node_ids, `${path}.node_ids`),
    };
  });

  uniqueIds(families, '$.families');
  uniqueIds(nodes, '$.nodes');
  uniqueIds(annotations, '$.annotations');
  const familyIds = new Set(families.map((family) => family.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const annotationIds = new Set(annotations.map((annotation) => annotation.id));
  for (const node of nodes) {
    if (!familyIds.has(node.family)) fail(`node:${node.id}.family`, `missing family ${node.family}`);
    for (const annotationId of node.annotation_ids) {
      if (!annotationIds.has(annotationId)) {
        fail(`node:${node.id}.annotation_ids`, `missing annotation ${annotationId}`);
      }
    }
  }
  for (const relationship of relationships) {
    if (!nodeIds.has(relationship.source)) {
      fail('$.relationships', `source references missing node ${relationship.source}`);
    }
    if (!nodeIds.has(relationship.target)) {
      fail('$.relationships', `target references missing node ${relationship.target}`);
    }
  }
  for (const annotation of annotations) {
    for (const nodeId of annotation.node_ids) {
      if (!nodeIds.has(nodeId)) fail(`annotation:${annotation.id}`, `missing node ${nodeId}`);
    }
  }

  return {
    schema_version: 1,
    disclosure_version: 'public-architecture-v1',
    title: stringAt(root.title, '$.title'),
    summary: stringAt(root.summary, '$.summary'),
    families,
    nodes,
    relationships,
    annotations,
  };
}

export function visitorMaturityLabel(maturity: PublicMaturity): string {
  return maturity
    .toLocaleLowerCase('en-US')
    .replace(/(^|[ +])\p{L}/gu, (value) => value.toLocaleUpperCase('en-US'));
}
