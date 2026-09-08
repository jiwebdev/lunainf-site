import { overview } from './architectureOverview';

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point];
type Route = { from: string; to: string; curves: readonly Curve[] };

// Layout only. Ports sit in the boundary/unused-space bands of the existing lobes.
// A route never creates a connection: rendering iterates the canonical bundles below.
export const familyPorts: Record<string, Record<string, Point>> = {
  memory: { upperSeam: [395, 335], rightSeam: [382, 455], crown: [415, 330] },
  cognition: {
    crown: [650, 350], upperRight: [810, 365], right: [885, 480],
    lowerLeft: [430, 610], base: [610, 625], left: [411, 485], lowerRight: [850, 585],
  },
  'background-cognition': {
    base: [620, 320], rightSeam: [792, 270], lowerLeft: [438, 305], leftSeam: [435, 305],
  },
  evaluation: {
    upperLeft: [815, 335], left: [855, 410], lowerLeft: [875, 435],
    crownSeam: [835, 360], base: [970, 460],
  },
  infrastructure: { upperLeft: [395, 540], upperRight: [478, 655] },
  interfaces: { crown: [650, 670], right: [825, 775], lowerRight: [815, 830] },
  perception: { upperLeft: [870, 620], top: [1010, 500], lowerLeft: [870, 845] },
  inference: { upperLeft: [1100, 455] },
};

// Pair-to-port assignments and Bezier handles are presentation metadata, not topology.
// Keys use the projection's canonical sorted pair order. Final curve endpoints are
// checked against named ports so inconsistent endpoint edits fail validation.
export const presentationRoutes: Record<string, Route> = {
  'background-cognition:cognition': { from: 'base', to: 'crown', curves: [[[630, 327], [640, 343], [650, 350]]] },
  'background-cognition:evaluation': { from: 'rightSeam', to: 'upperLeft', curves: [[[798, 290], [807, 315], [815, 335]]] },
  'background-cognition:infrastructure': { from: 'lowerLeft', to: 'upperLeft', curves: [[[420, 385], [400, 470], [395, 540]]] },
  'background-cognition:memory': { from: 'leftSeam', to: 'upperSeam', curves: [[[420, 315], [410, 325], [395, 335]]] },
  'cognition:evaluation': { from: 'upperRight', to: 'left', curves: [[[826, 377], [843, 390], [855, 410]]] },
  'cognition:inference': { from: 'right', to: 'upperLeft', curves: [[[960, 455], [1030, 450], [1100, 455]]] },
  'cognition:infrastructure': { from: 'lowerLeft', to: 'upperRight', curves: [[[444, 624], [460, 638], [478, 655]]] },
  'cognition:interfaces': { from: 'base', to: 'crown', curves: [[[620, 640], [640, 655], [650, 670]]] },
  'cognition:memory': { from: 'left', to: 'rightSeam', curves: [[[403, 470], [394, 456], [382, 455]]] },
  'cognition:perception': { from: 'lowerRight', to: 'upperLeft', curves: [[[858, 596], [866, 608], [870, 620]]] },
  'evaluation:interfaces': { from: 'lowerLeft', to: 'right', curves: [[[870, 535], [835, 665], [825, 775]]] },
  'evaluation:memory': { from: 'crownSeam', to: 'crown', curves: [[[780, 300], [575, 305], [415, 330]]] },
  'evaluation:perception': { from: 'base', to: 'top', curves: [[[985, 470], [1000, 480], [1010, 500]]] },
  'interfaces:perception': { from: 'lowerRight', to: 'lowerLeft', curves: [[[835, 835], [855, 842], [870, 845]]] },
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
    // Monotonic progress along at least one axis rules out loops and self-crossings.
    const points = [start, ...route.curves.flatMap(curve => [...curve])];
    const monotonic = ([0, 1] as const).some(axis => {
      const direction = Math.sign(end[axis] - start[axis]);
      return direction !== 0 && points.every((point, index) => index === 0 ||
        direction * (point[axis] - points[index - 1][axis]) >= 0);
    });
    if (!monotonic) throw new Error(`Overview route doubles back: ${key}`);
    const path = `M${start.join(' ')} ` + route.curves.map(([a, b, target]) =>
      `C${a.join(' ')} ${b.join(' ')} ${target.join(' ')}`).join(' ');
    // One small chevron for each direction that exists in the canonical bundle.
    const chevron = (fraction: number, reverse: boolean) => {
      const scaled = fraction * route.curves.length;
      const index = Math.min(Math.floor(scaled), route.curves.length - 1);
      const t = scaled - index, u = 1 - t;
      const origin = index ? route.curves[index - 1][2] : start;
      const [a, b, target] = route.curves[index];
      const position = (axis: 0 | 1) => u ** 3 * origin[axis] + 3 * u ** 2 * t * a[axis] + 3 * u * t ** 2 * b[axis] + t ** 3 * target[axis];
      const tangent = (axis: 0 | 1) => 3 * u ** 2 * (a[axis] - origin[axis]) + 6 * u * t * (b[axis] - a[axis]) + 3 * t ** 2 * (target[axis] - b[axis]);
      return { x: position(0), y: position(1), angle: Math.atan2(tangent(1), tangent(0)) * 180 / Math.PI + (reverse ? 180 : 0), direction: reverse ? 'reverse' : 'forward' };
    };
    const bidirectional = bundle.forward > 0 && bundle.reverse > 0;
    const chevrons = [
      ...(bundle.forward ? [chevron(bidirectional ? .35 : .5, false)] : []),
      ...(bundle.reverse ? [chevron(bidirectional ? .65 : .5, true)] : []),
    ];
    return { ...bundle, path, chevrons };
  });
}

export const routedBundles = routeOverview();
