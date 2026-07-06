/** Shared metadata shape for static + CMS compliance articles. */
export type ComplianceArticleMeta = {
  slug: string;
  title: string;
  metaDescription: string;
  datePublished: string;
  dateModified?: string;
  source: 'static' | 'cms';
};

export type CmsComplianceArticle = ComplianceArticleMeta & {
  source: 'cms';
  bodyMarkdown: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export type CmsComplianceArticleInput = {
  title: string;
  slug: string;
  metaDescription: string;
  bodyMarkdown: string;
  datePublished: string;
  dateModified?: string;
  published: boolean;
};
