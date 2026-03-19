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
          setError('This invite is no longer valid. Please ask your manager for a new invite.');
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

  useEffect(() => {
    if (!accepted || !isMobile) return;
    const timer = window.setTimeout(() => {
      window.location.href = '/';
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [accepted, isMobile]);

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
      await acceptInvite({
        inviteId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      setAccepted(true);
    } catch (err: any) {
      console.error('Invite acceptance failed:', err);
      const code = String(err?.code || '');
      const message = String(err?.message || '');
      if (code.includes('already-exists')) {
        setError('An account already exists for this email. Please sign in on the app.');
      } else if (code.includes('failed-precondition')) {
        setError('This invite is no longer valid. Please ask your manager to resend it.');
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
        <div className="w-full max-w-lg rounded-2xl border border-blue-500/30 bg-zinc-950 p-6 sm:p-8">
          <h1 className="text-2xl font-semibold mb-2">You are all set</h1>
          <p className="text-white/70 mb-6">
            Your Stock Track PRO account is ready. Download the app and sign in with your email and password.
          </p>
          <div className="space-y-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 text-center transition-colors"
            >
              Download on App Store
            </a>
            <div className="rounded-lg border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-white/80 font-medium">Android (internal testing)</p>
              <p className="text-sm text-white/60 mt-1">
                Your manager will send your Android install link directly while testing is in progress.
              </p>
            </div>
            <Link
              href="/"
              className="block w-full rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 py-3 px-4 text-center transition-colors"
            >
              Continue to Website
            </Link>
            {isMobile && (
              <p className="text-xs text-white/50 text-center">
                Redirecting you to the website in 2 seconds. Use the app banner at the top to install/open Stock Track PRO.
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
