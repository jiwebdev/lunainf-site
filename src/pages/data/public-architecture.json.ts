import architecture from '../../data/public-architecture.json';

export function GET() {
  return new Response(JSON.stringify(architecture, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
