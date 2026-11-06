/**
 * Validates compliance-article JSON-LD builders:
 * WebPage @id/url match the article canonical for 3 sample slugs.
 *
 * Run: npx tsx scripts/check-compliance-jsonld.ts
 */
import { COMPLIANCE_ARTICLES } from '../src/content/complianceArticles';
import {
  buildComplianceArticleJsonLd,
  complianceArticleCanonicalUrl,
  complianceArticleWebPageId,
} from '../src/lib/seo/buildComplianceArticleJsonLd';

const SAMPLE_COUNT = 3;

function asGraph(doc: Record<string, unknown>): Record<string, unknown>[] {
  const graph = doc['@graph'];
  if (!Array.isArray(graph)) {
    throw new Error('Expected @graph array in compliance article JSON-LD');
  }
  return graph as Record<string, unknown>[];
}

function main() {
  const samples = COMPLIANCE_ARTICLES.slice(0, SAMPLE_COUNT);
  if (samples.length < SAMPLE_COUNT) {
    throw new Error(`Need at least ${SAMPLE_COUNT} compliance articles to test`);
  }

  for (const article of samples) {
    const canonical = complianceArticleCanonicalUrl(article.slug);
    const webPageId = complianceArticleWebPageId(article.slug);
    const doc = buildComplianceArticleJsonLd({
      slug: article.slug,
      title: article.title,
      metaDescription: article.metaDescription,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      source: 'static',
    });

    const serialized = JSON.stringify(doc);
    if (/Stock Track/i.test(serialized)) {
      throw new Error(`JSON-LD for ${article.slug} still contains "Stock Track"`);
    }

    const graph = asGraph(doc);
    const webPage = graph.find((node) => node['@type'] === 'WebPage');
    const articleNode = graph.find((node) => node['@type'] === 'Article');
    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');

    if (!webPage) throw new Error(`${article.slug}: missing WebPage`);
    if (!articleNode) throw new Error(`${article.slug}: missing Article`);
    if (!breadcrumb) throw new Error(`${article.slug}: missing BreadcrumbList`);

    if (webPage['@id'] !== webPageId) {
      throw new Error(`${article.slug}: WebPage @id mismatch\n  got ${webPage['@id']}\n  expected ${webPageId}`);
    }
    if (webPage.url !== canonical) {
      throw new Error(`${article.slug}: WebPage url mismatch\n  got ${webPage.url}\n  expected ${canonical}`);
    }
    if (webPage.name !== article.title) {
      throw new Error(`${article.slug}: WebPage name should be the article title`);
    }

    const mainEntity = articleNode.mainEntityOfPage as { '@id'?: string } | undefined;
    if (mainEntity?.['@id'] !== webPageId) {
      throw new Error(`${article.slug}: Article mainEntityOfPage must point at WebPage @id`);
    }

    const author = articleNode.author as { '@id'?: string } | undefined;
    const publisher = articleNode.publisher as { '@id'?: string } | undefined;
    if (!author?.['@id'] || !publisher?.['@id']) {
      throw new Error(`${article.slug}: author/publisher must be Organization @id refs`);
    }
    if (author['@id'] !== publisher['@id']) {
      throw new Error(`${article.slug}: author and publisher should both be the Organization @id`);
    }

    console.log(`OK ${article.slug}`);
    console.log(`  canonical: ${canonical}`);
    console.log(`  webpage:   ${webPageId}`);
  }

  console.log(`\nPassed: ${samples.length} compliance article JSON-LD graphs.`);
}

main();
