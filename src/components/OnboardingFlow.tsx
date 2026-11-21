import React, { useEffect, useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  Heart,
  Sparkles,
  Check,
  ShieldAlert,
  Phone,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { getJson, postJson } from '../utils/apiClient';
import {
  auth,
  googleProvider,
  loadUserPreferencesFromFirestore,
  saveUserPreferencesToFirestore,
  syncUserProfileToFirestore,
} from '../firebase';
import {
  AuthProviderStatus,
  InteractionModePreference,
  LanguageMode,
  OnboardingPreferences,
  UserEntitlement,
  UserProfile,
} from '../types';

export type OnboardingStage = 'auth' | 'discover' | 'personalise';

interface OnboardingFlowProps {
  initialStage?: OnboardingStage;
  initialAuthMode?: 'signin' | 'signup';
  initialPreferences: OnboardingPreferences;
  user: UserProfile | null;
  authToken: string | null;
  onAuthSuccess: (payload: {
    token: string;
    user: UserProfile;
    entitlement: UserEntitlement;
    preferences: OnboardingPreferences;
  }) => void;
  onCompleteOnboarding: (prefs: OnboardingPreferences, isGuest: boolean) => void;
  onContinueAsGuest: (prefs: OnboardingPreferences) => void;
}

const GOAL_OPTIONS = [
  'Understanding my feelings',
  'Everyday stress and pressure',
  'Emotional awareness',
  'Building confidence',
  'Personal growth',
  'Better daily habits',
  'Feeling more connected',
  "I'm not sure yet",
];

const SUPPORT_METHOD_OPTIONS = [
  'Guided self-reflection',
  'Conversational AI reflection',
  'Journaling and writing',
  'Breathing and grounding exercises',
  'Literary reflections and bibliotherapy',
  'A combination of these',
];

const LANGUAGE_OPTIONS: Array<{ value: LanguageMode; label: string; sub: string }> = [
  { value: 'english', label: 'English', sub: 'Warm, clear English' },
  { value: 'tamil', label: 'தமிழ் (Tamil)', sub: 'Natural Tamil script' },
  { value: 'bilingual', label: 'English and Tamil', sub: 'Bilingual sanctuary & poetry' },
];

const INTERACTION_OPTIONS: Array<{ value: InteractionModePreference; label: string; sub: string }> = [
  { value: 'typing', label: 'Typing', sub: 'Write at your own quiet pace' },
  { value: 'voice', label: 'Voice', sub: 'Speak naturally when ready (mic asked only when used)' },
  { value: 'both', label: 'Both voice and text', sub: 'Switch freely between speaking and writing' },
  { value: 'not_sure', label: 'Not sure yet', sub: 'Decide anytime inside Reflection' },
];

/** Twin-eclipse atmospheric rim-light artwork inspired by the left & center reference screens */
function EclipseHorizonVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${
        compact ? 'h-44 sm:h-48' : 'h-56 sm:h-64'
      }`}
      aria-hidden="true"
    >
      {/* Central luminous amber flare */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-36 rounded-full blur-3xl opacity-85"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,168,88,0.72) 0%, rgba(235,106,36,0.38) 38%, rgba(11,13,18,0) 74%)',
        }}
      />
      {/* Upper dark eclipse arc with glowing bottom rim */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-[215px] w-[360px] sm:w-[420px] h-[310px] rounded-full bg-[#090A0E]"
        style={{
          boxShadow:
            '0 4px 28px rgba(255, 165, 92, 0.55), inset 0 -2px 12px rgba(255, 198, 140, 0.65)',
          borderBottom: '1.5px solid rgba(255, 208, 160, 0.75)',
        }}
      />
      {/* Lower dark eclipse arc with glowing top rim */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[52%] w-[360px] sm:w-[420px] h-[310px] rounded-full bg-[#090A0E]"
        style={{
          boxShadow:
            '0 -4px 28px rgba(255, 165, 92, 0.55), inset 0 2px 12px rgba(255, 198, 140, 0.65)',
          borderTop: '1.5px solid rgba(255, 208, 160, 0.75)',
        }}
      />
      {/* Soft bottom fade into card background */}
      <div
        className="absolute inset-x-0 bottom-0 h-16"
        style={{
          background: 'linear-gradient(to bottom, rgba(9,10,14,0) 0%, rgba(9,10,14,1) 100%)',
        }}
      />
    </div>
  );
}

/** Concentric glowing amber rings + heart/orb motif inspired by the right reference screen */
function ConcentricOrbVisual({ step }: { step: number }) {
  return (
    <div className="relative mx-auto flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center select-none" aria-hidden="true">
      {/* Outer soft glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-55"
        style={{
          background:
            'radial-gradient(circle, rgba(245,130,52,0.45) 0%, rgba(245,130,52,0.12) 55%, transparent 75%)',
        }}
      />
      {/* Outer dark ring */}
      <div className="absolute inset-2 rounded-full border border-[#F59E0B]/15 bg-[#120F0D]/80" />
      {/* Middle illuminated eclipse ring */}
      <div
        className="absolute inset-5 rounded-full transition-transform duration-500"
        style={{
          border: '2px solid rgba(245, 130, 52, 0.7)',
          boxShadow:
            '0 0 24px rgba(245, 130, 52, 0.45), inset 0 0 18px rgba(255, 180, 110, 0.35)',
          transform: `rotate(${step * 28}deg)`,
        }}
      />
      {/* Inner deep circle */}
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#090A0E] border border-amber-400/20 shadow-inner">
        {step === 6 ? (
          <Sparkles className="h-9 w-9 text-[#F58234] drop-shadow-[0_0_12px_rgba(245,130,52,0.85)]" />
        ) : (
          <Heart
            className="h-9 w-9 text-[#F58234] fill-[#F58234] drop-shadow-[0_0_14px_rgba(245,130,52,0.85)]"
          />
        )}
      </div>
    </div>
  );
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStage = 'auth',
  initialAuthMode = 'signin',
  initialPreferences,
  user,
  authToken,
  onAuthSuccess,
  onCompleteOnboarding,
  onContinueAsGuest,
}) => {
  const [stage, setStage] = useState<OnboardingStage>(initialStage);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>(initialAuthMode);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Auth form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Password reset state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoResetCodeHint, setDemoResetCodeHint] = useState<string | null>(null);

  // OAuth provider status
  const [providers, setProviders] = useState<AuthProviderStatus | null>(null);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);

  // 6-step personalisation state
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialPreferences.selected_goals || []);
  const [preferredSupportMethods, setPreferredSupportMethods] = useState<string[]>(
    initialPreferences.preferred_support_methods || []
  );
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageMode>(
    initialPreferences.preferred_language || 'bilingual'
  );
  const [preferredInteractionMode, setPreferredInteractionMode] = useState<InteractionModePreference>(
    initialPreferences.preferred_interaction_mode || 'not_sure'
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    getJson<{ providers?: AuthProviderStatus }>('/api/auth/providers')
      .then((data) => {
        if (data?.providers) setProviders(data.providers);
      })
      .catch(() => {
        // Ignore provider check error
      });
  }, []);

  const buildPreferences = (completed: boolean): OnboardingPreferences => ({
    user_id: user?.id,
    selected_goals: selectedGoals,
    preferred_support_methods: preferredSupportMethods,
    preferred_language: preferredLanguage,
    preferred_interaction_mode: preferredInteractionMode,
    onboarding_completed: completed,
    updated_at: new Date().toISOString(),
  });

  const formatFirebaseAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email address or password. Please try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password is too weak. Please use at least 8 characters.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method). You can use Google Sign-In or Guest access right now.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed before completing. Please try again.';
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    setAuthLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await syncUserProfileToFirestore(cred.user, preferredLanguage);
      const prefs = await loadUserPreferencesFromFirestore(cred.user.uid);
      const idToken = await cred.user.getIdToken();

      onAuthSuccess({
        token: idToken,
        user: profile,
        entitlement: {
          source: 'free',
          hasPremiumAccess: false,
          subscription: null,
          transactions: [],
        },
        preferences: prefs,
      });

      if (prefs.onboarding_completed) {
        onCompleteOnboarding(prefs, false);
      } else {
        setStage('discover');
      }
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    if (fullName.trim().length < 2) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (!acceptedTerms) {
      setAuthError('Please accept the Terms and Privacy Policy to create your account.');
      return;
    }

    setAuthLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: fullName.trim() });
      const profile = await syncUserProfileToFirestore(cred.user, preferredLanguage);
      const prefs = await loadUserPreferencesFromFirestore(cred.user.uid);
      const idToken = await cred.user.getIdToken();

      onAuthSuccess({
        token: idToken,
        user: profile,
        entitlement: {
          source: 'free',
          hasPremiumAccess: false,
          subscription: null,
          transactions: [],
        },
        preferences: prefs,
      });
      setStage('discover');
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Please enter your account email address.');
      return;
    }

    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthNotice('Password reset instructions have been sent to your email address.');
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);

    setAuthLoading(true);
    try {
      const data = await postJson<{ message: string }>('/api/auth/reset-password', {
        resetCode,
        newPassword,
      });
      setAuthNotice(data.message);
      setResetCode('');
      setNewPassword('');
      setDemoResetCodeHint(null);
      setAuthMode('signin');
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to reach the server. Please try again.',
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleMultiSelect = (list: string[], item: string, setter: (next: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleFinishPersonalisation = async () => {
    const finalPrefs = buildPreferences(true);
    if (auth.currentUser) {
      setSavingPrefs(true);
      try {
        await saveUserPreferencesToFirestore(auth.currentUser.uid, finalPrefs);
      } catch {
        // Proceed gracefully even if offline
      } finally {
        setSavingPrefs(false);
      }
      onCompleteOnboarding(finalPrefs, false);
    } else {
      onCompleteOnboarding(finalPrefs, true);
    }
  };

  const handleSocialClick = async (provider: 'google' | 'facebook') => {
    setAuthError(null);
    setProviderNotice(null);
    if (provider === 'google') {
      setAuthLoading(true);
      try {
        const cred = await signInWithPopup(auth, googleProvider);
        const profile = await syncUserProfileToFirestore(cred.user, preferredLanguage);
        const prefs = await loadUserPreferencesFromFirestore(cred.user.uid);
        const idToken = await cred.user.getIdToken();

        onAuthSuccess({
          token: idToken,
          user: profile,
          entitlement: {
            source: 'free',
            hasPremiumAccess: false,
            subscription: null,
            transactions: [],
          },
          preferences: prefs,
        });

        if (prefs.onboarding_completed) {
          onCompleteOnboarding(prefs, false);
        } else {
          setStage('discover');
        }
      } catch (err) {
        setAuthError(formatFirebaseAuthError(err));
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    const status = providers?.[provider];
    setProviderNotice(
      status?.note ||
        'Facebook OAuth is not configured in Firebase Auth. Please use Google Sign-In, email & password, or continue as a guest.'
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0E] text-white flex flex-col relative overflow-x-hidden">
      {/* Subtle ambient radial light behind layout */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 28% 25%, rgba(245, 130, 52, 0.16) 0%, rgba(9, 10, 14, 0) 60%)',
        }}
        aria-hidden="true"
      />

      {/* Full-width top utility bar: Brand + Always-accessible Safety Support */}
      <header className="w-full px-4 sm:px-6 lg:px-12 py-4 lg:py-5 flex items-center justify-between relative z-20 border-b border-white/[0.06] bg-[#090A0E]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[#E86F2C] to-[#FFD27D] shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          <span className="text-sm lg:text-base font-semibold tracking-wide text-white/95">
            FirstStep <span className="hidden sm:inline text-white/45 font-normal">· Eclipse Lumina</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSafetyModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 transition cursor-pointer"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Emergency &amp; Safety Support</span>
        </button>
      </header>

      {/* Responsive Body: Mobile app-card on <lg, Full-Width Split Web App on lg+ */}
      <div className="relative z-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Desktop Left Brand & Atmospheric Visual Column */}
        <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col items-center justify-center p-12 xl:p-16 border-r border-white/[0.06] bg-gradient-to-b from-[#0C0D12] via-[#090A0E] to-[#07080B] relative overflow-hidden">
          <div className="w-full max-w-md text-center space-y-6">
            {stage === 'personalise' ? (
              <ConcentricOrbVisual step={step} />
            ) : (
              <EclipseHorizonVisual />
            )}
            <div className="space-y-2.5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#FFB68D]">
                FirstStep · Eclipse Lumina
              </p>
              <p className="font-tamil text-2xl font-medium text-[#FFB68D] tracking-wide">
                மனதின் மொழி புரியும் இடம்
              </p>
              <p className="text-sm text-[#D1A98E]/85">
                Where the language of the heart is understood.
              </p>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-sm mx-auto pt-2">
              A calm, private bilingual emotional companion in English and Tamil — built for reflection,
              Sangam literature, and grounded next steps.
            </p>
          </div>
        </aside>

        {/* Right Interactive Column (Mobile: centered app card; Desktop: full-width spacious web panel) */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex items-center justify-center px-4 py-6 sm:px-8 lg:px-14 xl:px-20">
          <div className="relative z-10 w-full max-w-md lg:max-w-xl rounded-[32px] lg:rounded-3xl border border-white/10 lg:border-white/[0.08] bg-[#090A0E]/95 lg:bg-[#0D0F15]/80 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* ================= STAGE 1: AUTHENTICATION ================= */}
        {stage === 'auth' && (
          <div className="flex flex-col">
            <div className="lg:hidden">
              <EclipseHorizonVisual compact={authMode === 'signup'} />
            </div>

            <div className="px-6 sm:px-8 lg:px-10 pb-8 lg:py-10 -mt-6 lg:mt-0 relative z-10">
              <div className="text-center lg:text-left mb-6">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {authMode === 'signin'
                    ? 'Welcome Back!'
                    : authMode === 'signup'
                      ? 'Create Your Account'
                      : 'Reset Your Password'}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                  {authMode === 'signin'
                    ? 'Please enter your email and password to securely access your account.'
                    : authMode === 'signup'
                      ? 'Create a private FirstStep account to save your preferences and journey.'
                      : 'Enter your email address to receive a password reset verification code.'}
                </p>
              </div>

              {authError && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authNotice && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{authNotice}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="fs-signin-email" className="block text-xs font-medium text-white/85 mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="fs-signin-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="fs-signin-password" className="text-xs font-medium text-white/85">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthNotice(null);
                          setAuthMode('forgot');
                        }}
                        className="text-xs text-[#F59E0B] hover:text-[#FFD27D] transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="fs-signin-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/85"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background:
                        'linear-gradient(90deg, #1E130D 0%, #D96B27 50%, #1E130D 100%)',
                      border: '1px solid rgba(255, 178, 107, 0.55)',
                      boxShadow: '0 0 24px rgba(235, 114, 42, 0.35)',
                    }}
                  >
                    {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
                  <div>
                    <label htmlFor="fs-signup-name" className="block text-xs font-medium text-white/85 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fs-signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="fs-signup-email" className="block text-xs font-medium text-white/85 mb-1">
                      Email Address
                    </label>
                    <input
                      id="fs-signup-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="fs-signup-password" className="block text-xs font-medium text-white/85 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="fs-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/85"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fs-signup-confirm" className="block text-xs font-medium text-white/85 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="fs-signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/85"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-[#9CA3AF] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/25 bg-white/5 accent-[#E86F2C]"
                    />
                    <span>
                      I accept the FirstStep <span className="text-white/85 underline">Terms of Service</span> and{' '}
                      <span className="text-white/85 underline">Privacy Policy</span>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{
                      background:
                        'linear-gradient(90deg, #1E130D 0%, #D96B27 50%, #1E130D 100%)',
                      border: '1px solid rgba(255, 178, 107, 0.55)',
                      boxShadow: '0 0 24px rgba(235, 114, 42, 0.35)',
                    }}
                  >
                    {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {authMode === 'forgot' && (
                <div className="space-y-4">
                  <form onSubmit={handleForgotPassword} className="space-y-3.5" noValidate>
                    <div>
                      <label htmlFor="fs-forgot-email" className="block text-xs font-medium text-white/85 mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="fs-forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#F59E0B]/70 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full rounded-full py-3 text-sm font-semibold text-white transition"
                      style={{
                        background:
                          'linear-gradient(90deg, #1E130D 0%, #D96B27 50%, #1E130D 100%)',
                        border: '1px solid rgba(255, 178, 107, 0.55)',
                      }}
                    >
                      {authLoading ? 'Sending...' : 'Request Reset Code'}
                    </button>
                  </form>

                  {demoResetCodeHint && (
                    <form
                      onSubmit={handleCompleteReset}
                      className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4"
                    >
                      <p className="text-xs text-amber-200">
                        Verification code: <strong className="font-mono">{demoResetCodeHint}</strong>
                      </p>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter verification code"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 8 chars)"
                        className="w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/35"
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full rounded-full bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition"
                      >
                        Update Password
                      </button>
                    </form>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthNotice(null);
                      setAuthMode('signin');
                    }}
                    className="w-full text-center text-xs text-[#9CA3AF] hover:text-white transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* SOCIAL AUTHENTICATION (honest status, never simulated) */}
              {authMode !== 'forgot' && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[11px] uppercase tracking-widest text-white/40">OR</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialClick('google')}
                      className="flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] py-2.5 px-3 text-xs font-medium text-white/80 hover:bg-white/[0.07] transition"
                    >
                      <span className="font-bold text-[#F59E0B]">G</span>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialClick('facebook')}
                      className="flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] py-2.5 px-3 text-xs font-medium text-white/80 hover:bg-white/[0.07] transition"
                    >
                      <span className="font-bold text-blue-400">f</span>
                      <span>Facebook</span>
                      {!providers?.facebook.configured && (
                        <span className="text-[10px] text-white/40">(Setup)</span>
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-center text-[11px] text-white/35">
                    Instagram sign-in is not currently supported.
                  </p>

                  {providerNotice && (
                    <p className="mt-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90 text-center">
                      {providerNotice}
                    </p>
                  )}

                  {/* Switch Sign In / Sign Up */}
                  <div className="mt-5 text-center text-xs text-[#9CA3AF]">
                    {authMode === 'signin' ? (
                      <>
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError(null);
                            setAuthNotice(null);
                            setAuthMode('signup');
                          }}
                          className="font-semibold text-white hover:text-[#FFD27D] transition"
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError(null);
                            setAuthNotice(null);
                            setAuthMode('signin');
                          }}
                          className="font-semibold text-white hover:text-[#FFD27D] transition"
                        >
                          Sign In
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Guest Access Option */}
              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setStage('discover')}
                  className="text-xs font-medium text-[#FFD27D]/90 hover:text-[#FFD27D] transition"
                >
                  Continue as Guest →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: DISCOVER INNER PEACE ================= */}
        {stage === 'discover' && (
          <div className="flex flex-col">
            <EclipseHorizonVisual />

            <div className="px-6 sm:px-8 pb-9 -mt-4 relative z-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium text-white/75 mb-5">
                {user ? `Signed in as ${user.displayName || user.email}` : 'Your Sanctuary Awaits'}
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                Discover
                <br />
                Inner Peace
              </h1>

              <p className="mt-4 text-sm text-[#9CA3AF] leading-relaxed max-w-xs mx-auto">
                Create your account now to explore features, tools, and enjoy a more personalised FirstStep
                experience.
              </p>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setStage('personalise');
                  }}
                  className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(90deg, #1E130D 0%, #D96B27 50%, #1E130D 100%)',
                    border: '1px solid rgba(255, 178, 107, 0.6)',
                    boxShadow: '0 0 28px rgba(235, 114, 42, 0.38)',
                  }}
                >
                  Get Started
                </button>

                {!user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setStage('auth');
                    }}
                    className="w-full rounded-full border border-white/12 bg-white/[0.03] py-3.5 text-sm font-medium text-white/80 hover:bg-white/[0.07] transition"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCompleteOnboarding(buildPreferences(true), false)}
                    className="w-full rounded-full border border-white/12 bg-white/[0.03] py-3.5 text-sm font-medium text-white/80 hover:bg-white/[0.07] transition"
                  >
                    Go Directly to Sanctuary
                  </button>
                )}
              </div>

              {!user && (
                <button
                  type="button"
                  onClick={() => onContinueAsGuest(buildPreferences(true))}
                  className="mt-5 text-xs text-white/45 hover:text-white/80 transition"
                >
                  Skip directly to Sanctuary as Guest
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STAGE 3: 6-STEP PERSONALISE CAROUSEL ================= */}
        {stage === 'personalise' && (
          <div className="px-6 sm:px-8 pt-7 pb-8 flex flex-col min-h-[580px] justify-between">
            {/* Top visual + step content */}
            <div>
              <ConcentricOrbVisual step={step} />

              <div className="mt-5 text-center">
                {step === 1 && (
                  <>
                    <h2 className="text-2xl font-semibold text-[#F59E0B] tracking-tight">
                      Let&apos;s begin with you.
                    </h2>
                    <p className="mt-3 text-sm text-[#9CA3AF] leading-relaxed max-w-xs mx-auto">
                      Everyone&apos;s journey is different. Let&apos;s understand what you would like from
                      FirstStep.
                    </p>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                      What would you like help exploring?
                    </h2>
                    <p className="mt-1.5 text-xs text-[#9CA3AF]">Select as many as feel relevant.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {GOAL_OPTIONS.map((goal) => {
                        const active = selectedGoals.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => toggleMultiSelect(selectedGoals, goal, setSelectedGoals)}
                            className={`rounded-full px-3.5 py-2 text-xs font-medium transition border ${
                              active
                                ? 'border-[#F59E0B] bg-[#F59E0B]/20 text-[#FFD27D] shadow-[0_0_14px_rgba(245,158,11,0.25)]'
                                : 'border-white/12 bg-white/[0.03] text-white/75 hover:bg-white/[0.07]'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                      How would you like FirstStep to support you?
                    </h2>
                    <p className="mt-1.5 text-xs text-[#9CA3AF]">Choose one or more approaches.</p>
                    <div className="mt-4 space-y-2 text-left">
                      {SUPPORT_METHOD_OPTIONS.map((method) => {
                        const active = preferredSupportMethods.includes(method);
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() =>
                              toggleMultiSelect(
                                preferredSupportMethods,
                                method,
                                setPreferredSupportMethods
                              )
                            }
                            className={`w-full flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium transition border ${
                              active
                                ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#FFD27D]'
                                : 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
                            }`}
                          >
                            <span>{method}</span>
                            {active && <Check className="h-4 w-4 text-[#F59E0B] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                      Which language feels most natural to you?
                    </h2>
                    <p className="mt-1.5 text-xs text-[#9CA3AF]">You can change this anytime.</p>
                    <div className="mt-4 space-y-2.5 text-left">
                      {LANGUAGE_OPTIONS.map((opt) => {
                        const active = preferredLanguage === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPreferredLanguage(opt.value)}
                            className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 transition border ${
                              active
                                ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-white'
                                : 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium">{opt.label}</div>
                              <div className="text-[11px] text-[#9CA3AF]">{opt.sub}</div>
                            </div>
                            {active && <Check className="h-4 w-4 text-[#F59E0B]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 5 && (
                  <div className="text-left">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight text-left">
                      How do you prefer to express yourself?
                    </h2>
                    <p className="mt-1.5 text-xs text-[#9CA3AF] text-left leading-relaxed">
                      Microphone permission is only requested when you tap voice inside Reflection.
                    </p>
                    <div className="mt-4 space-y-2.5 text-left">
                      {INTERACTION_OPTIONS.map((opt) => {
                        const active = preferredInteractionMode === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPreferredInteractionMode(opt.value)}
                            className={`w-full flex items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left transition border ${
                              active
                                ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-white'
                                : 'border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div className="text-left">
                              <div className="text-sm font-medium text-left">{opt.label}</div>
                              <div className="mt-0.5 text-[11px] text-[#9CA3AF] text-left leading-relaxed">
                                {opt.sub}
                              </div>
                            </div>
                            {active && <Check className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">
                      Your journey begins here.
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
                      FirstStep is ready to help you explore your thoughts, discover helpful resources and
                      find an appropriate next step.
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-white/50">Language</span>
                        <span className="text-[#FFD27D] font-medium capitalize">
                          {preferredLanguage === 'bilingual' ? 'English & Tamil' : preferredLanguage}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-white/50">Expression</span>
                        <span className="text-white/90 font-medium capitalize">
                          {preferredInteractionMode.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-white/50">Focus Areas</span>
                        <span className="text-white/90 text-right">
                          {selectedGoals.length > 0 ? selectedGoals.slice(0, 2).join(', ') : 'Open exploration'}
                          {selectedGoals.length > 2 ? ` +${selectedGoals.length - 2}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-white/50">Support Style</span>
                        <span className="text-white/90 text-right">
                          {preferredSupportMethods.length > 0
                            ? `${preferredSupportMethods.length} selected`
                            : 'All Sanctuary tools'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <button
                        type="button"
                        disabled={savingPrefs}
                        onClick={handleFinishPersonalisation}
                        className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(90deg, #1E130D 0%, #D96B27 50%, #1E130D 100%)',
                          border: '1px solid rgba(255, 178, 107, 0.6)',
                          boxShadow: '0 0 28px rgba(235, 114, 42, 0.38)',
                        }}
                      >
                        {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Enter My Sanctuary
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full rounded-full border border-white/12 bg-white/[0.03] py-2.5 text-xs font-medium text-white/75 hover:bg-white/[0.07] transition"
                      >
                        Edit My Preferences
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Carousel Controls inspired by the right reference screen (Skip | Go/Next | 1/6) */}
            <div className="mt-7 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishPersonalisation}
                    className="text-xs font-medium text-white/55 hover:text-white transition"
                  >
                    Skip
                  </button>
                )}
              </div>

              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(6, s + 1))}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold text-white transition active:scale-95"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, #F58234 0%, #9E4314 68%, #2E150A 100%)',
                    border: '1.5px solid rgba(255, 198, 140, 0.7)',
                    boxShadow: '0 0 24px rgba(245, 130, 52, 0.45)',
                  }}
                  aria-label="Next step"
                >
                  {step === 1 ? 'Go' : <ChevronRight className="h-5 w-5" />}
                </button>
              ) : (
                <span className="text-xs text-[#F59E0B] font-medium">Ready</span>
              )}

              <div className="flex items-center gap-3">
                {step > 1 && step < 6 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(6, s + 1))}
                    className="text-xs text-white/45 hover:text-white/80 transition"
                  >
                    Skip
                  </button>
                )}
                <span className="text-xs font-medium tabular-nums text-white/75">
                  {step}
                  <span className="text-white/35">/6</span>
                </span>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Always-accessible Emergency & Safety Support Modal */}
      {showSafetyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="safety-modal-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-rose-400/30 bg-[#12131A] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-300">
                <ShieldAlert className="h-5 w-5" />
                <h3 id="safety-modal-title" className="text-base font-semibold text-white">
                  Immediate Support &amp; Safety
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                aria-label="Close safety support"
                className="text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
              You never need an account to access emergency or emotional crisis support. If you feel unsafe
              or overwhelmed right now, please reach out to a human helpline immediately:
            </p>
            <div className="mt-4 space-y-2.5">
              <a
                href="tel:14416"
                className="flex items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-white hover:bg-rose-500/20 transition"
              >
                <div>
                  <div>Tele-MANAS (India)</div>
                  <div className="text-xs text-rose-200/80">24/7 Free Confidential Support (English &amp; Tamil)</div>
                </div>
                <span className="inline-flex items-center gap-1 font-semibold text-rose-200">
                  <Phone className="h-4 w-4" /> 14416
                </span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.08] transition"
              >
                <div>
                  <div>Local Emergency Services</div>
                  <div className="text-xs text-white/60">Immediate emergency assistance</div>
                </div>
                <span className="font-semibold text-white/90">112</span>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setShowSafetyModal(false)}
              className="mt-5 w-full rounded-full border border-white/15 py-2.5 text-xs font-medium text-white/80 hover:bg-white/5 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
