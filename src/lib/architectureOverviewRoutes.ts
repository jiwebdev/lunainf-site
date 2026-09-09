import { overview } from './architectureOverview';

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point];
type Route = { from: string; to: string; curves: readonly Curve[] };

// Original region-center anchors, before the boundary-routing changes.
// These coordinates are presentation only; bundles supply the canonical connections.
export const familyPorts: Record<string, Record<string, Point>> = {
  memory: { center: [300, 390] },
  'background-cognition': { center: [600, 300] },
  evaluation: { center: [940, 375] },
  cognition: { center: [655, 490] },
  infrastructure: { center: [335, 635] },
  interfaces: { center: [650, 735] },
  perception: { center: [975, 595] },
  inference: { center: [1190, 570] },
};

// Restore the original center-to-center Bezier paths, retaining the filled arrows.
export const presentationRoutes: Record<string, Route> = Object.fromEntries(
  overview.bundles.map(({ source, target }) => {
    const start = familyPorts[source].center, end = familyPorts[target].center;
    const middleX = (start[0] + end[0]) / 2;
    return [`${source}:${target}`, {
      from: 'center', to: 'center',
      curves: [[[middleX, start[1]], [middleX, end[1]], end]],
    } satisfies Route];
  }),
);

// Sample the smooth centerline, then offset its sides into one filled silhouette.
// Arrowheads finish exactly at the ports; they never protrude beyond the route ends.
function filledArrow(start: Point, curves: readonly Curve[], width: number, headStart: boolean, headEnd: boolean) {
  const samples: { point: Point; distance: number }[] = [{ point: start, distance: 0 }];
  let origin = start;
  for (const [a, b, end] of curves) {
    for (let step = 1; step <= 64; step++) {
      const t = step / 64, u = 1 - t;
      const point: Point = [0, 1].map(axis => u ** 3 * origin[axis] + 3 * u ** 2 * t * a[axis] + 3 * u * t ** 2 * b[axis] + t ** 3 * end[axis]) as [number, number];
      const previous = samples.at(-1)!;
      const stepLength = Math.hypot(point[0] - previous.point[0], point[1] - previous.point[1]);
      if (stepLength > 0) samples.push({ point, distance: previous.distance + stepLength });
    }
    origin = end;
  }
  const length = samples.at(-1)!.distance;
  if (!length) throw new Error('Arrow route has no length');
  const at = (distance: number, offset = 0): Point => {
    distance = Math.min(length, Math.max(0, distance));
    const index = Math.max(1, samples.findIndex(sample => sample.distance >= distance));
    const a = samples[index - 1], b = samples[index];
    const segment = b.distance - a.distance;
    const t = segment ? (distance - a.distance) / segment : 0;
    const dx = b.point[0] - a.point[0], dy = b.point[1] - a.point[1];
    return [a.point[0] + t * dx - offset * dy / segment, a.point[1] + t * dy + offset * dx / segment];
  };
  const headLength = Math.min(width * 1.65, length * .24);
  const from = headStart ? headLength : 0, to = headEnd ? length - headLength : length;
  const left: Point[] = [], right: Point[] = [];
  for (let step = 0; step <= 64; step++) {
    const distance = from + (to - from) * step / 64;
    const taper = headStart && headEnd ? 1 : Math.min(1, (headEnd ? distance : length - distance) / length * 3 + .08);
    left.push(at(distance, width / 2 * taper));
    right.push(at(distance, -width / 2 * taper));
  }
  const outline = [...left,
    ...(headEnd ? [at(to, width), at(length), at(to, -width)] : []),
    ...right.reverse(),
    ...(headStart ? [at(from, -width), at(0), at(from, width)] : []),
  ];
  const path = outline.map((point, index) => `${index ? 'L' : 'M'}${point.map(value => value.toFixed(2)).join(' ')}`).join(' ') + ' Z';
  return { path, width };
}

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
    const headStart = bundle.reverse > 0, headEnd = bundle.forward > 0;
    const arrow = filledArrow(start, route.curves, bundle.width * 1.65, headStart, headEnd);
    return { ...bundle, path, arrow: { ...arrow, headStart, headEnd,
      gradientStart: headStart && !headEnd ? end : start,
      gradientEnd: headStart && !headEnd ? start : end,
      originFamily: headStart && !headEnd ? bundle.target : bundle.source,
    } };

  });
}

export const routedBundles = routeOverview();
