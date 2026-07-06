import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ComplianceArticleContent from '@/components/ComplianceArticleContent';

type Props = {
  markdown: string;
};

const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3>{children}</h3>,
  p: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul>{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="my-6 list-decimal space-y-2.5 pl-6 text-white/80">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote>{children}</blockquote>,
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
};

/** Markdown renderer without the outer article wrapper — for composed CMS article bodies. */
export function ComplianceMarkdownRenderer({ markdown }: Props) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {markdown}
    </ReactMarkdown>
  );
}

/** Renders CMS compliance article markdown with the same typography as static articles. */
export default function ComplianceArticleMarkdown({ markdown }: Props) {
  return (
    <ComplianceArticleContent>
      <ComplianceMarkdownRenderer markdown={markdown} />
    </ComplianceArticleContent>
  );
}
