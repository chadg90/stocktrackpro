'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { getStaticComplianceArticles } from '@/lib/compliance-articles/static';
import { polishComplianceMarkdown } from '@/lib/compliance-articles/polish';
import {
  firstValidationError,
  hasBlockingValidationIssues,
  validateComplianceArticleInput,
} from '@/lib/compliance-articles/validate';
import type { CmsComplianceArticle } from '@/lib/compliance-articles/types';
import CmsComplianceArticleBody from '@/components/CmsComplianceArticleBody';
import { Plus, Trash2, ExternalLink, Pencil, EyeOff, Eye } from 'lucide-react';
import Modal from '../../components/Modal';
import { EmptyStateTableRow } from '../../components/EmptyState';
import TableSkeleton from '../../components/TableSkeleton';
import Link from 'next/link';

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toLocalDatetimeValue(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalDatetimeValue(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

const emptyForm = () => ({
  originalSlug: '',
  title: '',
  slug: '',
  metaDescription: '',
  bodyMarkdown: '',
  datePublished: toLocalDatetimeValue(new Date().toISOString()),
  published: false,
});

export default function AdminComplianceArticlesPage() {
  const staticArticles = useMemo(() => getStaticComplianceArticles(), []);
  const [articles, setArticles] = useState<CmsComplianceArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'edit' | 'preview'>('edit');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const validationIssues = useMemo(
    () =>
      validateComplianceArticleInput(
        {
          title: form.title,
          slug: form.slug,
          metaDescription: form.metaDescription,
          bodyMarkdown: form.bodyMarkdown,
          datePublished: form.datePublished,
        },
        { publishing: form.published }
      ),
    [form]
  );

  const previewMarkdown = useMemo(
    () => polishComplianceMarkdown(form.bodyMarkdown, form.published),
    [form.bodyMarkdown, form.published]
  );

  const canPublish = !hasBlockingValidationIssues(validationIssues);

  const fetchArticles = async () => {
    if (!firebaseAuth?.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch('/api/admin/compliance-articles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load articles');
      setArticles(data.articles ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      await fetchArticles();
    });
    return () => unsub();
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setModalTab('edit');
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (article: CmsComplianceArticle) => {
    setForm({
      originalSlug: article.slug,
      title: article.title,
      slug: article.slug,
      metaDescription: article.metaDescription,
      bodyMarkdown: article.bodyMarkdown,
      datePublished: toLocalDatetimeValue(article.datePublished),
      published: article.published,
    });
    setModalTab('edit');
    setError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.originalSlug ? prev.slug : slugFromTitle(title),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseAuth?.currentUser) return;

    if (form.published && !canPublish) {
      setError(firstValidationError(validationIssues) || 'Fix validation issues before publishing.');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch('/api/admin/compliance-articles', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalSlug: form.originalSlug || undefined,
          title: form.title,
          slug: form.slug,
          metaDescription: form.metaDescription,
          bodyMarkdown: form.bodyMarkdown,
          datePublished: fromLocalDatetimeValue(form.datePublished),
          dateModified: new Date().toISOString(),
          published: form.published,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');
      setIsModalOpen(false);
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save article');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!firebaseAuth?.currentUser) return;
    if (!window.confirm(`Delete article "${slug}"? This cannot be undone.`)) return;
    setProcessing(true);
    setError(null);
    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch(`/api/admin/compliance-articles/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete article');
      await fetchArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete article');
    } finally {
      setProcessing(false);
    }
  };

  const metaLength = form.metaDescription.length;
  const metaLengthClass =
    metaLength >= 80 && metaLength <= 160
      ? 'text-emerald-600 dark:text-emerald-400'
      : metaLength > 160
        ? 'text-red-600 dark:text-red-400'
        : 'text-amber-700 dark:text-amber-300';

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Compliance articles</h1>
          <p className="text-sm text-zinc-600 dark:text-white/60 mt-1 max-w-2xl">
            Publish new SEO articles to the public Compliance Centre. Existing built-in articles stay in the website code
            and are listed below for reference — they cannot be edited here.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white btn-brand-blue"
        >
          <Plus className="h-4 w-4" />
          New article
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-white">Built-in articles (read-only)</h2>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-white/10">
          {staticArticles.map((article) => (
            <li key={article.slug} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">{article.title}</p>
                <p className="text-xs text-zinc-500 dark:text-white/50">/compliance-centre/{article.slug}</p>
              </div>
              <Link
                href={`/compliance-centre/${article.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
              >
                View <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03]">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-white">CMS articles</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500 dark:text-white/50 border-b border-zinc-200 dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={4} />
            ) : articles.length === 0 ? (
              <EmptyStateTableRow colSpan={4} message="No CMS articles yet. Create your first article above." />
            ) : (
              articles.map((article) => (
                <tr key={article.slug} className="border-b border-zinc-100 dark:border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900 dark:text-white">{article.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-white/50">/compliance-centre/{article.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {article.published ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Eye className="h-3.5 w-3.5" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                        <EyeOff className="h-3.5 w-3.5" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-white/70">
                    {new Date(article.datePublished).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {article.published && (
                        <Link
                          href={`/compliance-centre/${article.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white/70"
                          title="View live"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(article)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-white/70"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(article.slug)}
                        disabled={processing}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.originalSlug ? 'Edit article' : 'New article'}>
        <div className="mb-4 flex gap-2 border-b border-zinc-200 dark:border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setModalTab('edit')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              modalTab === 'edit'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/10'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setModalTab('preview')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              modalTab === 'preview'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/10'
            }`}
          >
            Preview
          </button>
        </div>

        {modalTab === 'preview' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-black p-6 sm:p-8">
              <h2 className="mb-6 text-2xl font-bold text-white">{form.title || 'Article title'}</h2>
              <CmsComplianceArticleBody markdown={previewMarkdown || 'Add article content in the Edit tab.'} />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalTab('edit')}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-white/15 text-sm"
              >
                Back to edit
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-600 dark:text-white/70">Title</label>
            <input
              className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-zinc-900 dark:text-white"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-600 dark:text-white/70">URL slug</label>
            <input
              className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-zinc-900 dark:text-white font-mono text-sm"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: slugFromTitle(e.target.value) }))}
              required
            />
            <p className="text-xs text-zinc-500 dark:text-white/45 mt-1">
              Will appear at /compliance-centre/{form.slug || 'your-slug'}
            </p>
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-600 dark:text-white/70">Meta description (SEO)</label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-zinc-900 dark:text-white min-h-[80px]"
              value={form.metaDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
              maxLength={320}
              required
            />
            <p className={`text-xs mt-1 ${metaLengthClass}`}>
              {metaLength}/320 characters · aim for 80–155 for Google snippets
            </p>
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-600 dark:text-white/70">Publish date</label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-zinc-900 dark:text-white"
              value={form.datePublished}
              onChange={(e) => setForm((prev) => ({ ...prev, datePublished: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-600 dark:text-white/70">Article body (Markdown)</label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-white dark:bg-black/40 px-3 py-2 text-zinc-900 dark:text-white min-h-[280px] font-mono text-sm"
              value={form.bodyMarkdown}
              onChange={(e) => setForm((prev) => ({ ...prev, bodyMarkdown: e.target.value }))}
              required
              placeholder={'Opening paragraph here.\n\n## Section heading\n\nParagraph with a [GOV.UK link](https://www.gov.uk/...).\n\n## Key takeaways\n\n- Bullet one\n- Bullet two'}
            />
            <p className="text-xs text-zinc-500 dark:text-white/45 mt-1">
              Use ## for headings, ## Key takeaways for the summary box, blank lines between paragraphs, and link to GOV.UK sources.
            </p>
          </div>

          {validationIssues.length > 0 && (
            <ul className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 space-y-1.5 text-sm">
              {validationIssues.map((issue) => (
                <li
                  key={`${issue.field}-${issue.message}`}
                  className={
                    issue.severity === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-700 dark:text-amber-300'
                  }
                >
                  {issue.severity === 'error' ? '•' : '○'} {issue.message}
                </li>
              ))}
            </ul>
          )}

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
              className="rounded"
            />
            Publish live on the website
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-white/15 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing || (form.published && !canPublish)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white btn-brand-blue disabled:opacity-50"
            >
              {processing ? 'Saving…' : form.published ? 'Save & publish' : 'Save draft'}
            </button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
}
