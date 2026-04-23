'use client';

import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle,
  Users,
  LayoutDashboard,
  LogIn,
  Smartphone,
  CreditCard,
  Apple,
} from 'lucide-react';
import Link from 'next/link';

type OnboardingStep = 'choice' | 'account' | 'company' | 'success';

const TRIAL_DAYS = 7;
const APP_STORE_URL = 'https://apps.apple.com/gb/app/stock-track-pro/id6744621973';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.stocktrackpro.app';

export default function OnboardingPage() {
  // Account creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Company creation
  const [step, setStep] = useState<OnboardingStep>('choice');
  const [companyName, setCompanyName] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCompanyName, setCreatedCompanyName] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!firebaseAuth || !firebaseDb) {
      setError('Firebase is not configured properly');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });

      // Create profile document (without company_id yet)
      await setDoc(doc(firebaseDb, 'profiles', user.uid), {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        role: null, // Will be set based on company option
        company_id: null, // Will be set based on company option
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Move to company selection step
      setStep('company');
    } catch (err: any) {
      console.error('Account creation error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!firebaseDb || !firebaseAuth) {
      setError('Firebase is not configured properly');
      return;
    }

    setLoading(true);

    try {
      const user = firebaseAuth.currentUser;
      if (!user) {
        setError('User session expired. Please try again.');
        setLoading(false);
        return;
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

      const companyRef = await addDoc(collection(firebaseDb, 'companies'), {
        name: companyName.trim(),
        subscription_status: 'trial',
        trial_start_date: serverTimestamp(),
        trial_end_date: trialEnd.toISOString(),
        created_at: serverTimestamp(),
        created_by: user.uid,
      });

      // Update user profile with company and manager role
      await setDoc(
        doc(firebaseDb, 'profiles', user.uid),
        {
          company_id: companyRef.id,
          role: 'manager',
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      setCreatedCompanyName(companyName.trim());
      setStep('success');
    } catch (err: any) {
      console.error('Company creation error:', err);
      setError(err.message || 'Failed to create company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { key: 'account' as const, label: 'Account' },
    { key: 'company' as const, label: 'Company' },
  ];
  const currentStepIndex = step === 'success' ? 2 : step === 'company' ? 1 : step === 'account' ? 0 : -1;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-white">Stock Track PRO</h1>
          </Link>
          {step !== 'success' && step !== 'choice' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {stepLabels.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                      currentStepIndex >= i ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-8 h-0.5 rounded ${currentStepIndex > i ? 'bg-blue-500' : 'bg-white/20'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {step === 'choice' && 'Get started'}
            {step === 'account' && 'Create your account'}
            {step === 'company' && 'Set up your company'}
            {step === 'success' && "You're all set"}
          </h2>
          <p className="text-white/60 text-sm">
            {step === 'choice' && 'Start a free trial or sign in to your existing account.'}
            {step === 'account' && 'One account for the web dashboard and the app.'}
            {step === 'company' && `Create your company — your ${TRIAL_DAYS}-day free trial starts immediately.`}
            {step === 'success' && 'Your company is ready. Follow these four steps to get your team up and running.'}
          </p>
        </div>

        {step === 'choice' ? (
          <div className="dashboard-card p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setStep('account')}
                className="flex-1 p-6 rounded-xl border-2 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-left group"
              >
                <Building2 className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white text-lg mb-2">Start a free trial</h3>
                <p className="text-white/60 text-sm">
                  Create your account and company. {TRIAL_DAYS} days free, no card required. Subscribe later from £8 per vehicle per month.
                </p>
                <span className="inline-flex items-center gap-1 text-blue-500 font-medium text-sm mt-3">
                  Get started <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <Link
                href="/dashboard"
                className="flex-1 p-6 rounded-xl border-2 border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-colors text-left group flex flex-col"
              >
                <LogIn className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white text-lg mb-2">Sign in</h3>
                <p className="text-white/60 text-sm">
                  Already have a Stock Track PRO account? Sign in to the dashboard.
                </p>
                <span className="inline-flex items-center gap-1 text-blue-500 font-medium text-sm mt-3">
                  Go to login <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
            <p className="text-white/50 text-center text-xs">
              Joining an existing company? Open the invite email from your manager and follow the link, then sign in using the Stock Track PRO app.
            </p>
          </div>
        ) : step === 'success' ? (
          <div className="dashboard-card p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <CheckCircle className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{createdCompanyName}</p>
                <p className="text-white/60 text-sm">
                  Company created. You&apos;re the manager. Your {TRIAL_DAYS}-day free trial starts now.
                </p>
              </div>
            </div>

            <div>
              <p className="text-white/80 text-sm font-medium mb-3">Your next four steps:</p>
              <ol className="space-y-3">
                {[
                  {
                    icon: LayoutDashboard,
                    title: 'Open your dashboard',
                    detail: 'Your company view is ready. Take a minute to look around.',
                  },
                  {
                    icon: LayoutDashboard,
                    title: 'Add your fleet',
                    detail: 'Vehicles auto-fill from DVLA on registration. Start with active vehicles first, then set inspection habits.',
                  },
                  {
                    icon: Users,
                    title: 'Invite your team by email',
                    detail: 'From the Team page, send email invites as Manager or User. Staff click the link, set a password, and sign in on the app.',
                  },
                  {
                    icon: Smartphone,
                    title: 'Install the mobile app',
                    detail: 'You and your team use the app for QR scanning, vehicle inspections, and defect logging on the road.',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-white text-sm font-medium">
                        <item.icon className="w-4 h-4 text-blue-400" />
                        {item.title}
                      </div>
                      <p className="text-white/60 text-xs mt-1 leading-relaxed">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                Get the mobile app
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/30 py-2.5 px-3 text-sm text-white hover:border-blue-500/50 transition-colors"
                >
                  <Apple className="w-4 h-4" />
                  App Store (iOS)
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/30 py-2.5 px-3 text-sm text-white hover:border-blue-500/50 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  Google Play (Android)
                </a>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full text-white font-semibold rounded-xl py-3.5 transition-all btn-brand-blue"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-white/40 text-xs text-center">
              Want to subscribe straight away?{' '}
              <Link href="/dashboard/subscription" className="text-blue-400 hover:underline">
                Set up billing from the dashboard
              </Link>
              . No charge until your trial ends.
            </p>
          </div>
        ) : (
        <div className="dashboard-card p-8 shadow-xl">
          {step === 'account' ? (
            <form onSubmit={handleAccountCreation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  required
                  minLength={6}
                />
                <p className="text-white/50 text-xs mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2 btn-brand-blue"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleCreateCompany} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Company name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      placeholder="Your Company Ltd"
                      required
                    />
                    <p className="text-white/50 text-xs mt-1">
                      You&apos;ll become the manager of this company.
                    </p>
                  </div>

                  <div className="rounded-lg border border-blue-500/25 bg-blue-500/5 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-white/80">
                        <p className="font-medium text-white mb-0.5">
                          {TRIAL_DAYS}-day free trial — no card required
                        </p>
                        <p className="text-white/60 text-xs leading-relaxed">
                          Explore the full product with your real fleet and team.
                          When you&apos;re ready, subscribe from the dashboard: £8 per vehicle per
                          month, or £84 per vehicle per year (save ~12%).
                          Minimum 5 vehicles. Cancel anytime on monthly plans.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full text-white font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2 btn-brand-blue"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating company...
                      </>
                    ) : (
                      <>
                        Start free trial <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

              <button
                type="button"
                onClick={() => setStep('account')}
                className="w-full text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to account details
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-center text-xs">
              Already have an account?{' '}
              <Link href="/dashboard" className="text-blue-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
