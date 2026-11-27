'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type HubArticle = {
  slug: string;
  title: string;
  metaDescription: string;
};

const TOPICS = [
  'Walkaround checks',
  'Driver hours',
  'MOT & tax',
  'Legal/HSE',
  'Fleet costs',
] as const;

type Topic = (typeof TOPICS)[number];

export function complianceTopic(slug: string, title: string): Topic {
  const text = `${slug} ${title}`.toLowerCase();
  if (/hour|tachograph/.test(text)) return 'Driver hours';
  if (/\bmot\b|road tax|tax expiry|tax reminder/.test(text)) return 'MOT & tax';
  if (/cost|fuel|expense/.test(text)) return 'Fleet costs';
  if (/walkaround|pre-use|inspection|defect|nil-defect|paper vs|paper-vs/.test(text)) {
    return 'Walkaround checks';
  }
  return 'Legal/HSE';
}

export default function ComplianceArticleFilters({ articles }: { articles: HubArticle[] }) {
  const [topic, setTopic] = useState<Topic | 'All'>('All');
  const visible = useMemo(
    () =>
      topic === 'All'
        ? articles
        : articles.filter((article) => complianceTopic(article.slug, article.title) === topic),
    [articles, topic]
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTopic('All')}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            topic === 'All'
              ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white'
              : 'border-[var(--mkt-border)] bg-white text-[var(--mkt-ink)]'
          }`}
        >
          All
        </button>
        {TOPICS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTopic(name)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              topic === name
                ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white'
                : 'border-[var(--mkt-border)] bg-white text-[var(--mkt-ink)]'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {visible.length === 0 ? (
          <li className="text-[var(--mkt-muted)] text-sm">No articles in this topic yet.</li>
        ) : (
          visible.map((article) => (
            <li key={article.slug}>
              <Link href={`/compliance-centre/${article.slug}/`} className="block mkt-card p-6">
                <h2 className="text-xl font-semibold text-[var(--mkt-ink)] mb-2">{article.title}</h2>
                <p className="text-[var(--mkt-muted)] text-sm leading-relaxed">{article.metaDescription}</p>
                <span className="inline-flex mt-4 text-[var(--brand-blue)] text-sm font-semibold">
                  Read article →
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
