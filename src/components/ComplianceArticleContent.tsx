import React from 'react';

/** Styled wrapper for Compliance Centre article bodies (typography plugin not used). */
export default function ComplianceArticleContent({ children }: { children: React.ReactNode }) {
  return <div className="compliance-article">{children}</div>;
}
