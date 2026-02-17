'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Building2, Key, ArrowRight, Loader2, CheckCircle, Users, MapPin, Package, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

type OnboardingStep = 'account' | 'company' | 'success';

export default function OnboardingPage() {
  const router = useRouter();
  
  // Account creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Company selection
  const [step, setStep] = useState<OnboardingStep>('account');
  const [companyOption, setCompanyOption] = useState<'join' | 'create'>('join');
  const [accessCode, setAccessCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedTier, setSelectedTier] = useState<'PRO_STARTER' | 'PRO_TEAM' | 'PRO_BUSINESS' | 'PRO_ENTERPRISE'>('PRO_STARTER');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
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

  const verifyAccessCode = async () => {
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    if (!firebaseDb || !firebaseAuth) {
      setError('Firebase is not configured properly');
      return;
    }

    setVerifyingCode(true);
    setError(null);

    try {
      const codesQuery = query(
        collection(firebaseDb, 'access_codes'),
        where('code', '==', accessCode.trim().toUpperCase()),
        where('used', '==', false)
      );

      const snapshot = await getDocs(codesQuery);

      if (snapshot.empty) {
        setError('Invalid or expired access code. Please check and try again.');
        setVerifyingCode(false);
        return;
      }

      const codeDoc = snapshot.docs[0];
      const codeData = codeDoc.data();

      // Check if code is expired
      if (codeData.expires_at) {
        const expiresAt = codeData.expires_at.toDate ? codeData.expires_at.toDate() : new Date(codeData.expires_at);
        if (expiresAt < new Date()) {
          setError('This access code has expired. Please request a new one.');
          setVerifyingCode(false);
          return;
        }
      }

      // Update user profile with company and role
      const user = firebaseAuth.currentUser;
      if (!user) {
        setError('User session expired. Please try again.');
        setVerifyingCode(false);
        return;
      }

      await setDoc(
        doc(firebaseDb, 'profiles', user.uid),
        {
          company_id: codeData.company_id,
          role: codeData.role || 'user',
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );

      // Mark access code as used
      await setDoc(
        doc(firebaseDb, 'access_codes', codeDoc.id),
        {
          used: true,
          used_by: user.uid,
          used_at: serverTimestamp(),
        },
        { merge: true }
      );

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Access code verification error:', err);
      setError(err.message || 'Failed to verify access code. Please try again.');
    } finally {
      setVerifyingCode(false);
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

      // Create company with selected tier
      const companyRef = await addDoc(collection(firebaseDb, 'companies'), {
        name: companyName.trim(),
        subscription_status: 'trial',
        subscription_tier: selectedTier,
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
  const currentStepIndex = step === 'success' ? 2 : step === 'company' ? 1 : 0;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-white">Stock Track PRO</h1>
          </Link>
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {stepLabels.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                      currentStepIndex >= i ? 'bg-primary text-black' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-8 h-0.5 rounded ${currentStepIndex > i ? 'bg-primary' : 'bg-white/20'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {step === 'account' && 'Create your account'}
            {step === 'company' && 'Set up your company'}
            {step === 'success' && "You're all set"}
          </h2>
          <p className="text-white/60 text-sm">
            {step === 'account' && 'New companies start here. One account for the web dashboard and the app.'}
            {step === 'company' && 'Join an existing company with a code, or create a new company and start a free trial.'}
            {step === 'success' && 'Your company is ready. Here’s what to do next.'}
          </p>
        </div>

        {step === 'success' ? (
          <div className="dashboard-card p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">{createdCompanyName}</p>
                <p className="text-white/60 text-sm">Company created. You’re the manager.</p>
              </div>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-3">Next steps in your dashboard:</p>
              <ul className="space-y-3">
                {[
                  { icon: LayoutDashboard, text: 'Open your dashboard and explore your company view' },
                  { icon: Users, text: 'Create access codes so your team can join the app' },
                  { icon: MapPin, text: 'Add locations for assets and vehicles' },
                  { icon: Package, text: 'Add your first assets and fleet' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80 text-sm">
                    <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-xl py-3.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
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
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
                    className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
                  className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
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
                className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2"
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
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCompanyOption('join');
                    setError(null);
                  }}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    companyOption === 'join'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Key className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-white mb-1">Join Company</h3>
                  <p className="text-white/60 text-xs">
                    Use an access code from your manager
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompanyOption('create');
                    setError(null);
                  }}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    companyOption === 'create'
                      ? 'border-primary bg-primary/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-white mb-1">Create new company</h3>
                  <p className="text-white/60 text-xs">
                    7-day free trial, then choose a plan
                  </p>
                </button>
              </div>

              {companyOption === 'join' ? (
                <form onSubmit={(e) => { e.preventDefault(); verifyAccessCode(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Access Code
                    </label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors uppercase"
                      placeholder="ABC123"
                      required
                    />
                    <p className="text-white/50 text-xs mt-1">
                      Get this code from your manager
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2"
                    disabled={verifyingCode}
                  >
                    {verifyingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Join Company <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-lg bg-white/5 border border-white/20 px-3 py-2.5 text-white placeholder:text-white/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="Your Company Ltd"
                      required
                    />
                    <p className="text-white/50 text-xs mt-1">
                      You'll become the manager of this company
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Choose Your Plan (7-Day Free Trial)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTier('PRO_STARTER')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedTier === 'PRO_STARTER'
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">Starter</div>
                        <div className="text-white/60 text-xs">£19.99/mo</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTier('PRO_TEAM')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedTier === 'PRO_TEAM'
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">Team</div>
                        <div className="text-white/60 text-xs">£34.99/mo</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTier('PRO_BUSINESS')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedTier === 'PRO_BUSINESS'
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">Business</div>
                        <div className="text-white/60 text-xs">£49.99/mo</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTier('PRO_ENTERPRISE')}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedTier === 'PRO_ENTERPRISE'
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">Enterprise</div>
                        <div className="text-white/60 text-xs">£119.99/mo</div>
                      </button>
                    </div>
                    <p className="text-white/50 text-xs mt-2">
                      You can upgrade or change your plan anytime after the trial
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Company...
                      </>
                    ) : (
                      <>
                        Create Company <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => setStep('account')}
                className="w-full text-white/60 hover:text-white text-sm transition-colors"
              >
                ← Back to account details
              </button>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/50 text-center text-xs">
                Already have an account?{' '}
                <Link href="/dashboard" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
