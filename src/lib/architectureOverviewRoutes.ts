import { overview } from './architectureOverview';

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point];
type Route = { from: string; to: string; curves: readonly Curve[] };

// Layout only. Ports sit in the boundary/unused-space bands of the existing lobes.
// A route never creates a connection: rendering iterates the canonical bundles below.
export const familyPorts: Record<string, Record<string, Point>> = {
  memory: { upperSeam: [418, 315], rightSeam: [410, 355], crown: [415, 330] },
  cognition: {
    crown: [725, 337], upperRight: [810, 365], right: [885, 480],
    lowerLeft: [430, 610], base: [610, 625], left: [407, 560], lowerRight: [850, 585],
  },
  'background-cognition': {
    base: [575, 328], rightSeam: [792, 270], lowerLeft: [438, 305], leftSeam: [422, 235],
  },
  evaluation: {
    upperLeft: [815, 335], left: [855, 410], lowerLeft: [875, 435],
    crownSeam: [835, 360], base: [970, 460],
  },
  infrastructure: { upperLeft: [395, 540], upperRight: [478, 655] },
  interfaces: { crown: [770, 645], right: [825, 775], lowerRight: [815, 830] },
  perception: { upperLeft: [840, 650], top: [1060, 500], lowerLeft: [870, 845] },
  inference: { upperLeft: [1100, 455] },
};

// Pair-to-port assignments and Bezier handles are presentation metadata, not topology.
// Keys use the projection's canonical sorted pair order. Final curve endpoints are
// checked against named ports so inconsistent endpoint edits fail validation.
export const presentationRoutes: Record<string, Route> = {
  'background-cognition:cognition': { from: 'base', to: 'crown', curves: [[[620, 365], [680, 360], [725, 337]]] },
  'background-cognition:evaluation': { from: 'rightSeam', to: 'upperLeft', curves: [[[815, 275], [810, 315], [815, 335]]] },
  'background-cognition:infrastructure': { from: 'lowerLeft', to: 'upperLeft', curves: [[[440, 350], [385, 360], [370, 415]], [[345, 465], [345, 520], [395, 540]]] },
  'background-cognition:memory': { from: 'leftSeam', to: 'upperSeam', curves: [[[445, 260], [450, 295], [418, 315]]] },
  'cognition:evaluation': { from: 'upperRight', to: 'left', curves: [[[855, 350], [875, 365], [855, 410]]] },
  'cognition:inference': { from: 'right', to: 'upperLeft', curves: [[[960, 445], [1020, 410], [1100, 455]]] },
  'cognition:infrastructure': { from: 'lowerLeft', to: 'upperRight', curves: [[[445, 610], [485, 620], [478, 655]]] },
  'cognition:interfaces': { from: 'base', to: 'crown', curves: [[[650, 680], [730, 690], [770, 645]]] },
  'cognition:memory': { from: 'left', to: 'rightSeam', curves: [[[370, 515], [375, 415], [410, 355]]] },
  'cognition:perception': { from: 'lowerRight', to: 'upperLeft', curves: [[[895, 600], [875, 625], [840, 650]]] },
  'evaluation:interfaces': { from: 'lowerLeft', to: 'right', curves: [[[925, 490], [935, 550], [890, 590]], [[835, 630], [808, 710], [825, 775]]] },
  'evaluation:memory': { from: 'crownSeam', to: 'crown', curves: [[[780, 300], [575, 305], [415, 330]]] },
  'evaluation:perception': { from: 'base', to: 'top', curves: [[[1010, 430], [1080, 455], [1060, 500]]] },
  'interfaces:perception': { from: 'lowerRight', to: 'lowerLeft', curves: [[[825, 870], [855, 875], [870, 845]]] },
};

export function routeOverview(
  projection = overview,
  routes = presentationRoutes,
  ports = familyPorts,
) {
  const families = new Set(projection.families.map(family => family.id));
  const pairs = new Set(projection.bundles.map(bundle => `${bundle.source}:${bundle.target}`));
  for (const family of Object.keys(ports)) {
    if (!families.has(family)) throw new Error(`Unknown port family: ${family}`);
  }
  for (const key of Object.keys(routes)) {
    if (!pairs.has(key)) throw new Error(`Route has no canonical bundle: ${key}`);
  }
  const validPoint = (point: Point | undefined): point is Point =>
    Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
  return projection.bundles.map(bundle => {
    const key = `${bundle.source}:${bundle.target}`;
    const route = routes[key];
    const start = route ? ports[bundle.source]?.[route.from] : undefined;
    const end = route ? ports[bundle.target]?.[route.to] : undefined;
    if (!route || !validPoint(start) || !validPoint(end) || !route.curves.length ||
        route.curves.some(curve => curve.length !== 3 || !curve.every(validPoint))) {
      throw new Error(`Unusable overview route: ${key}`);
    }
    const last = route.curves.at(-1)![2];
    if (last[0] !== end[0] || last[1] !== end[1]) throw new Error(`Route misses its port: ${key}`);
    const path = `M${start.join(' ')} ` + route.curves.map(([a, b, target]) =>
      `C${a.join(' ')} ${b.join(' ')} ${target.join(' ')}`).join(' ');
    return { ...bundle, path };
  });
}

export const routedBundles = routeOverview();
