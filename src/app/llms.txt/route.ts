import { buildLlmsTxt } from '@/lib/compliance-articles/llms';

export const revalidate = 300;

export async function GET() {
  const body = await buildLlmsTxt();
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
