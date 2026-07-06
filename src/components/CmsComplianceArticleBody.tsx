import ComplianceArticleContent from '@/components/ComplianceArticleContent';
import { ComplianceMarkdownRenderer } from '@/components/ComplianceArticleMarkdown';

type Props = {
  markdown: string;
};

function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-12 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8">
      <h2 className="mb-5 text-xl font-semibold text-white">Key takeaways</h2>
      <ul className="compliance-takeaway-list space-y-3">{children}</ul>
    </div>
  );
}

function splitTakeaways(markdown: string): { main: string; takeaways: string | null } {
  const match = markdown.match(/\n##\s*Key takeaways\s*\n/i);
  if (!match || match.index === undefined) {
    return { main: markdown, takeaways: null };
  }

  const main = markdown.slice(0, match.index).trim();
  const takeaways = markdown
    .slice(match.index + match[0].length)
    .replace(/^This article summarises[\s\S]*$/im, '')
    .trim();

  return { main, takeaways: takeaways || null };
}

function TakeawayList({ markdown }: { markdown: string }) {
  const items = markdown
    .split('\n')
    .map((line) => line.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean);

  return (
    <>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </>
  );
}

/** Polished public render for CMS compliance articles — matches built-in article styling. */
export default function CmsComplianceArticleBody({ markdown }: Props) {
  const { main, takeaways } = splitTakeaways(markdown);
  const disclaimerMatch = main.match(/(This article summarises[\s\S]*)$/i);
  const bodyWithoutDisclaimer = disclaimerMatch ? main.slice(0, disclaimerMatch.index).trim() : main;
  const disclaimer = disclaimerMatch?.[1]?.trim();

  return (
    <ComplianceArticleContent>
      <ComplianceMarkdownRenderer markdown={bodyWithoutDisclaimer} />
      {takeaways && (
        <KeyTakeaways>
          <TakeawayList markdown={takeaways} />
        </KeyTakeaways>
      )}
      {disclaimer && <p className="compliance-disclaimer">{disclaimer}</p>}
    </ComplianceArticleContent>
  );
}
