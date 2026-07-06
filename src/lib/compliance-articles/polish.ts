const DEFAULT_DISCLAIMER =
  'This article summarises general principles and is not legal advice. Always check current GOV.UK guidance for your operation.';

/** Normalise markdown and ensure a disclaimer exists for published articles. */
export function polishComplianceMarkdown(markdown: string, publishing: boolean): string {
  let text = markdown
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (publishing && !/not legal advice/i.test(text)) {
    text = `${text}\n\n${DEFAULT_DISCLAIMER}`;
  }

  return text;
}
