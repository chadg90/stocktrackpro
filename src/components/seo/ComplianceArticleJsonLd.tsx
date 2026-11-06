import type { ComplianceArticleMeta } from '@/lib/compliance-articles/types';
import { buildComplianceArticleJsonLd } from '@/lib/seo/buildComplianceArticleJsonLd';

type Props = { article: ComplianceArticleMeta };

/**
 * WebPage + Article + BreadcrumbList JSON-LD for compliance posts
 * (Google rich results + clearer IA signals).
 */
export function ComplianceArticleJsonLd({ article }: Props) {
  const graph = buildComplianceArticleJsonLd(article);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
