import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getCmsArticleBySlug } from '@/lib/compliance-articles/server';
import { getStaticComplianceArticle } from '@/lib/compliance-articles/static';
import { SITE_NAME } from '@/lib/brand';

export const runtime = 'nodejs';
export const alt = 'Fleet Track PRO Compliance Centre';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

async function resolveTitle(slug: string): Promise<string> {
  const staticArticle = getStaticComplianceArticle(slug);
  if (staticArticle) return staticArticle.title;
  const cms = await getCmsArticleBySlug(slug);
  if (cms) return cms.title;
  return 'Compliance Centre';
}

export default async function ComplianceArticleOgImage({ params }: Props) {
  const { slug } = await params;
  const title = await resolveTitle(slug);

  let logoSrc: string | null = null;
  try {
    const logoBytes = await readFile(join(process.cwd(), 'public', 'logo-white.png'));
    logoSrc = `data:image/png;base64,${logoBytes.toString('base64')}`;
  } catch {
    logoSrc = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A1628',
          padding: '56px 64px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" width={280} height={84} style={{ objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 700 }}>{SITE_NAME}</div>
          )}
          <div
            style={{
              color: '#7DD3FC',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Compliance Centre
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              color: '#F8FAFC',
              fontSize: title.length > 70 ? 44 : 52,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', color: '#94A3B8', fontSize: 22 }}>
          UK fleet compliance guidance
        </div>
      </div>
    ),
    { ...size }
  );
}
