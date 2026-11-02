import { SUPPORT_EMAIL } from '@/lib/brand';

/** Mailto used for Android (invite-only) onboarding requests. */
export function androidInviteMailto(opts?: { email?: string; companyName?: string }) {
  const subject = 'Android app invite request — Fleet Track PRO';
  const lines = [
    'Hi Fleet Track PRO team,',
    '',
    'Please add me to the Android (Google Play) testing / invite list.',
    '',
    opts?.email ? `Account email: ${opts.email}` : null,
    opts?.companyName ? `Company: ${opts.companyName}` : null,
    '',
    'Thanks,',
  ].filter(Boolean);
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
