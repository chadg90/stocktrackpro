'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '@/lib/firebase';

type InvitePreview = {
  valid: boolean;
  companyName?: string;
  role?: string;
  inviteeName?: string | null;
  email?: string | null;
  status?: string;
};

const APP_STORE_URL = 'https://apps.apple.com/gb/app/stock-track-pro/id6744621973';

export default function InviteAcceptPage() {
  const params = useParams<{ inviteId: string }>();
  const inviteId = useMemo(() => params?.inviteId || '', [params?.inviteId]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const loadInvite = async () => {
      if (!firebaseFunctions || !inviteId) {
        setError('Invite link is invalid.');
        setLoading(false);
        return;
      }

      try {
        const getInvitePreview = httpsCallable(firebaseFunctions, 'getInvitePreview');
        const result = await getInvitePreview({ inviteId });
        const preview = result.data as InvitePreview;
        setInvite(preview);
        if (!preview.valid) {
          if (preview.status === 'accepted') {
            setError(
              'This invite was already used to set up an account. Open the Stock Track PRO app and sign in with the same email from your invite. If you are unsure of the password, use Forgot password on the login screen. A new invite cannot replace an existing account.'
            );
          } else {
            setError('This invite is no longer valid. Please ask your manager for a new invite.');
          }
        }
      } catch (err) {
        console.error('Error loading invite preview:', err);
        setError('Unable to load this invite. Please request a new invite link.');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [inviteId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent || '';
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
  }, []);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseFunctions || !inviteId) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const acceptInvite = httpsCallable(firebaseFunctions, 'acceptInvite');
      const result = await acceptInvite({
        inviteId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      const payload = result.data as { success?: boolean; email?: string };
      setSignedUpEmail((payload?.email || '').trim() || null);
      setAccepted(true);
    } catch (err: any) {
      console.error('Invite acceptance failed:', err);
      const code = String(err?.code || '');
      const message = String(err?.message || '');
      if (code.includes('already-exists')) {
        setError('An account already exists for this email. Please sign in on the app.');
      } else if (code.includes('failed-precondition')) {
        setError(
          'This invite is no longer valid (expired, cancelled, or already used). If you already submitted this form once, sign in on the app with that password or use Forgot password. Otherwise ask your manager for a new invite.'
        );
      } else if (message.toLowerCase().includes('missing required metadata')) {
        setError('This invite is missing setup data. Please ask your manager to send a new invite.');
      } else {
        setError('Could not accept this invite. Please ask your manager to resend it.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <p className="text-white/70">Loading invite...</p>
      </main>
    );
  }

  if (accepted) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-emerald-500/35 bg-zinc-950 p-6 sm:p-8 shadow-lg shadow-emerald-500/5">
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40"
              aria-hidden
            >
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">You have successfully signed up</h1>
            <p className="text-white/70 text-sm sm:text-base max-w-md">
              Your Stock Track PRO account is ready. Open the app on your phone and sign in with the email and password you
              just created.
            </p>
          </div>

          {signedUpEmail && (
            <div className="mb-6 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Sign in with this email</p>
              <p className="text-white font-medium break-all">{signedUpEmail}</p>
            </div>
          )}

          <ol className="text-sm text-white/75 space-y-3 mb-6 list-decimal list-inside text-left">
            <li>
              <span className="text-white/90">Get the app</span> — use the App Store link below, or your manager’s link if you
              are on Android (testing).
            </li>
            <li>
              <span className="text-white/90">Open Stock Track PRO</span> and choose sign in (not create account).
            </li>
            <li>
              <span className="text-white/90">Enter your email and password</span> from this page. Use Forgot password in the
              app if you need to reset it later.
            </li>
          </ol>

          <div className="space-y-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 text-center transition-colors"
            >
              Open App Store — Stock Track PRO
            </a>
            <div className="rounded-lg border border-white/15 bg-white/5 p-4 text-left">
              <p className="text-sm text-white/80 font-medium">Android (internal testing)</p>
              <p className="text-sm text-white/60 mt-1">
                Your manager will send your install or Play testing link. Then sign in with the same email and password as
                above.
              </p>
            </div>
            <Link
              href="/"
              className="block w-full rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-4 text-center transition-colors"
            >
              Continue to website
            </Link>
            {isMobile && (
              <p className="text-xs text-white/45 text-center">
                Tip: after installing, return here if you need your sign-in email again, or use Continue to website when you are
                done.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-blue-500/30 bg-zinc-950 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-2">Accept Invitation</h1>
        <p className="text-white/70 mb-6">
          You were invited to join <span className="text-white">{invite?.companyName || 'Stock Track PRO'}</span>
          {invite?.role ? ` as ${invite.role}` : ''}. Set your password to continue.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg bg-black border border-blue-500/30 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg bg-black border border-blue-500/30 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 outline-none"
            />
          </div>
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-black border border-blue-500/30 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 outline-none"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg bg-black border border-blue-500/30 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 outline-none"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Setting up account...' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </main>
  );
}
