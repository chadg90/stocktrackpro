const DEFAULT_DISCLAIMER =
  'This article summarises general principles and is not legal advice. Always check current GOV.UK guidance for your operation.';

const DEFECT_PRODUCT_PATH = '/vehicle-defect-reporting-software/';

/**
 * Link the first natural defect phrase to the product page (max one per article).
 * Does not change wording — only wraps an existing match. Skips if already linked.
 */
export function linkFirstDefectProductMention(markdown: string): string {
  if (markdown.includes(DEFECT_PRODUCT_PATH)) return markdown;

  const re = /\b(defect reports?|defect reporting|defect records?|defects)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown))) {
    const start = match.index;
    const end = start + match[0].length;
    // Skip matches that sit inside an existing markdown link destination or label.
    const before = markdown.slice(0, start);
    const lastOpenLabel = before.lastIndexOf('[');
    const lastCloseLabel = before.lastIndexOf(']');
    if (lastOpenLabel > lastCloseLabel) continue;
    const lastLinkDest = before.lastIndexOf('](');
    if (lastLinkDest !== -1) {
      const closeDest = markdown.indexOf(')', lastLinkDest);
      if (closeDest === -1 || closeDest >= start) continue;
    }

    return `${markdown.slice(0, start)}[${match[0]}](${DEFECT_PRODUCT_PATH})${markdown.slice(end)}`;
  }
  return markdown;
}

/**
 * Ensure internal markdown links use trailing slashes (avoids middleware 308 hops).
 * Leaves hashes, query strings, absolute URLs, and file extensions alone.
 */
export function ensureInternalMarkdownTrailingSlashes(markdown: string): string {
  return markdown.replace(
    /\]\((\/[^)\s]+)\)/g,
    (_match, rawHref: string) => {
      if (/^(mailto:|tel:|https?:)/i.test(rawHref)) return `](${rawHref})`;
      const hashIndex = rawHref.indexOf('#');
      const queryIndex = rawHref.indexOf('?');
      let path = rawHref;
      let suffix = '';
      if (hashIndex >= 0) {
        path = rawHref.slice(0, hashIndex);
        suffix = rawHref.slice(hashIndex);
      } else if (queryIndex >= 0) {
        path = rawHref.slice(0, queryIndex);
        suffix = rawHref.slice(queryIndex);
      }
      if (!path || path === '/') return `](${rawHref})`;
      if (/\.[a-z0-9]+$/i.test(path)) return `](${rawHref})`;
      if (!path.endsWith('/')) path = `${path}/`;
      return `](${path}${suffix})`;
    }
  );
}

/** Normalise markdown and ensure a disclaimer exists for published articles. */
export function polishComplianceMarkdown(markdown: string, publishing: boolean): string {
  let text = markdown
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  text = ensureInternalMarkdownTrailingSlashes(text);
  text = linkFirstDefectProductMention(text);

  if (publishing && !/not legal advice/i.test(text)) {
    text = `${text}\n\n${DEFAULT_DISCLAIMER}`;
  }

  return text;
}
