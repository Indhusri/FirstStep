import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { PREMIUM_CONFIG } from '../data/premiumConfig';
import { BillingPeriod, UserEntitlement, UserProfile } from '../types';
import { postJson } from '../utils/apiClient';

interface PremiumPageProps {
  user: UserProfile | null;
  entitlement: UserEntitlement;
  onAuthSuccess: (user: UserProfile, entitlement: UserEntitlement) => void;
  onEntitlementUpdate: (entitlement: UserEntitlement) => void;
  onOpenJourney: () => void;
}

type CheckoutStep = 'overview' | 'auth' | 'payment' | 'welcome';

export const PremiumPage: React.FC<PremiumPageProps> = ({
  user,
  entitlement,
  onAuthSuccess,
  onEntitlementUpdate,
  onOpenJourney,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<BillingPeriod>('annual');
  const [step, setStep] = useState<CheckoutStep>('overview');

  // Auth form state
  const [email, setEmail] = useState(user?.email || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [institutionCode, setInstitutionCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Payment order state
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    amountInr: number;
    planLabel: string;
    mode: 'demonstration' | 'live';
    notice: string;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackInfo, setFeedbackInfo] = useState<string | null>(null);

  const planObj =
    selectedPlan === 'annual' ? PREMIUM_CONFIG.plans.annual : PREMIUM_CONFIG.plans.monthly;

  const startOrderCreation = async (targetUser: UserProfile) => {
    setFeedbackError(null);
    setPaymentLoading(true);
    try {
      const data = await postJson<{
        orderId: string;
        amountInr: number;
        planLabel: string;
        mode: 'demonstration' | 'live';
        notice: string;
      }>('/api/payments/create-order', {
        userId: targetUser.id,
        billingPeriod: selectedPlan,
      });
      setActiveOrder(data);
      setStep('payment');
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Checkout error.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleChoosePremium = () => {
    setFeedbackError(null);
    setFeedbackInfo(null);
    if (!user) {
      setStep('auth');
    } else if (entitlement.hasPremiumAccess) {
      onOpenJourney();
    } else {
      startOrderCreation(user);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setAuthLoading(true);
    try {
      const data = await postJson<{ user: UserProfile; entitlement: UserEntitlement }>(
        '/api/auth/session',
        { email, displayName, institutionCode },
      );
      onAuthSuccess(data.user, data.entitlement);
      if (data.entitlement.hasPremiumAccess) {
        setStep('welcome');
      } else {
        await startOrderCreation(data.user);
      }
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyPayment = async (outcome: 'paid' | 'failed' | 'cancelled') => {
    if (!activeOrder) return;
    setFeedbackError(null);
    setFeedbackInfo(null);
    setPaymentLoading(true);
    try {
      const data = await postJson<{ verified: boolean; entitlement?: UserEntitlement }>(
        '/api/payments/verify',
        { orderId: activeOrder.orderId, outcome },
      );
      if (data.entitlement) {
        onEntitlementUpdate(data.entitlement);
      }
      if (data.verified) {
        setActiveOrder(null);
        setStep('welcome');
      } else {
        setActiveOrder(null);
        setStep('overview');
        setFeedbackError(
          outcome === 'cancelled'
            ? 'Payment was cancelled. Your account remains on FirstStep Free.'
            : 'Payment did not succeed. Premium was not activated.',
        );
      }
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Verification error.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setFeedbackError(null);
    setCancelLoading(true);
    try {
      const data = await postJson<{ entitlement: UserEntitlement }>('/api/subscriptions/cancel', {
        userId: user.id,
      });
      onEntitlementUpdate(data.entitlement);
      setFeedbackInfo('Your subscription has been cancelled. You will not be billed again.');
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  // STEP 6: WELCOME SCREEN
  if (step === 'welcome') {
    return (
      <div className="max-w-2xl mx-auto px-5 py-14">
        <div className="eclipse-card rounded-3xl p-8 sm:p-11 text-center space-y-5">
          <Sparkles className="w-8 h-8 text-[#FFB68D] mx-auto" />
          <p className="text-xs font-medium text-[#FFB68D]">
            {entitlement.source === 'institutional_sponsored'
              ? 'Institution-Sponsored Access Active'
              : 'FirstStep Premium Active'}
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome to your FirstStep Premium journey.
          </h1>
          <p className="text-sm sm:text-base text-[#DDC1B3] leading-relaxed">
            Your personal goals, guided programmes, extended journal, and personal insights are now unlocked.
            {entitlement.subscription?.currentPeriodEnd && (
              <>
                {' '}
                Current period runs through{' '}
                <span className="text-white font-medium">
                  {new Date(entitlement.subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
                .
              </>
            )}
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onOpenJourney}
              className="eclipse-button-primary min-h-[48px] px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore My Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: SIGN IN / CREATE ACCOUNT
  if (step === 'auth') {
    return (
      <div className="max-w-xl mx-auto px-5 py-12">
        <form onSubmit={handleAuthSubmit} className="eclipse-card rounded-3xl p-7 sm:p-9 space-y-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
            <UserCheck className="w-4 h-4" />
            <span>Step 4 · Account Required for Subscription</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sign in or create your FirstStep account
          </h1>
          <p className="text-sm text-[#D1A98E] leading-relaxed">
            An account is required to manage your subscription and keep your personal journals and reflection history private across devices.
          </p>

          {feedbackError && (
            <div className="rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/35 px-4 py-3 text-xs text-[#ffdad6] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
              Preferred Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should FirstStep greet you?"
              className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
              Institutional Access Code (Optional)
            </label>
            <input
              type="text"
              value={institutionCode}
              onChange={(e) => setInstitutionCode(e.target.value)}
              placeholder="Have a campus/org code? Try CAMPUS-DEMO"
              className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
            />
            <p className="text-[11px] text-[#94A3B8] mt-1">
              If your institution sponsors FirstStep, entering your code activates access without charging you.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep('overview')}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] cursor-pointer"
            >
              Back to Plans
            </button>
            <button
              type="submit"
              disabled={authLoading}
              className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Continue to Checkout</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // STEP 5: PAYMENT CHECKOUT (RAZORPAY-READY + CLEARLY LABELLED DEMONSTRATION MODE)
  if (step === 'payment' && activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-5 py-12">
        <div className="eclipse-card rounded-3xl p-7 sm:p-9 space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
            <CreditCard className="w-4 h-4" />
            <span>Step 5 · Secure Server-Verified Checkout</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeOrder.planLabel}
            </h1>
            <p className="text-3xl font-bold text-[#FFB68D] tabular-nums mt-2">
              ₹{activeOrder.amountInr.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-normal text-[#D1A98E]">
                ({selectedPlan === 'annual' ? 'billed annually' : 'billed monthly'})
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-[#191c21] border border-[#FF8A3D]/35 p-4 text-xs text-[#DDC1B3] leading-relaxed">
            <p className="font-semibold text-[#FFB68D] mb-1">
              {activeOrder.mode === 'demonstration'
                ? 'Demonstration Mode Active (No Real Charge)'
                : 'Live Razorpay Checkout'}
            </p>
            <p>{activeOrder.notice}</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={paymentLoading}
              onClick={() => handleVerifyPayment('paid')}
              className="eclipse-button-primary min-h-[48px] w-full rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Simulate Verified Payment Success</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => handleVerifyPayment('failed')}
                className="eclipse-button-ghost min-h-[44px] rounded-full text-xs font-medium text-[#ffb4ab] cursor-pointer"
              >
                Simulate Failed Payment
              </button>
              <button
                type="button"
                disabled={paymentLoading}
                onClick={() => handleVerifyPayment('cancelled')}
                className="eclipse-button-ghost min-h-[44px] rounded-full text-xs font-medium text-[#DDC1B3] cursor-pointer"
              >
                Cancel Checkout
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            Order reference: <span className="font-mono">{activeOrder.orderId}</span>. Premium entitlement is activated only after server-side verification with duplicate-activation protection.
          </p>
        </div>
      </div>
    );
  }

  // STEPS 1, 2, 3 & 7: DISCOVER, COMPARE, SELECT PLAN, AND SUBSCRIPTION MANAGEMENT
  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-12">
      {feedbackError && (
        <div
          role="alert"
          className="rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/35 px-5 py-3.5 text-sm text-[#ffdad6] flex items-center gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}
      {feedbackInfo && (
        <div className="rounded-2xl bg-[#191c21] border border-[#FF8A3D]/35 px-5 py-3.5 text-sm text-[#FFB68D]">
          {feedbackInfo}
        </div>
      )}

      {/* STEP 7: SUBSCRIPTION MANAGEMENT (if signed in) */}
      {user && (
        <section className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#FFB68D] mb-1">Subscription Management</p>
              <h2 className="text-xl font-bold text-white">
                {entitlement.source === 'institutional_sponsored'
                  ? `Institution-Sponsored Access (${user.institutionName || 'Partner Institution'})`
                  : entitlement.source === 'individual_premium'
                    ? 'FirstStep Individual Premium'
                    : 'FirstStep Free'}
              </h2>
              <p className="text-xs text-[#D1A98E] mt-1">
                Signed in as {user.displayName ? `${user.displayName} · ` : ''}
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {entitlement.hasPremiumAccess && (
                <button
                  type="button"
                  onClick={onOpenJourney}
                  className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
                >
                  Open My Journey
                </button>
              )}
              {entitlement.source === 'individual_premium' &&
                entitlement.subscription?.status === 'active' && (
                  <button
                    type="button"
                    disabled={cancelLoading}
                    onClick={handleCancelSubscription}
                    className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-[#ffb4ab] cursor-pointer"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
            </div>
          </div>

          {entitlement.subscription && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/[0.08] pt-5 text-xs">
              <div>
                <span className="text-[#94A3B8] block">Status</span>
                <span className="text-white font-semibold capitalize mt-0.5 block">
                  {entitlement.subscription.status}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block">Billing Period</span>
                <span className="text-white font-semibold capitalize mt-0.5 block">
                  {entitlement.subscription.billingPeriod}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block">Next Renewal / Period End</span>
                <span className="text-white font-semibold tabular-nums mt-0.5 block">
                  {new Date(entitlement.subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {entitlement.transactions.length > 0 && (
            <div className="border-t border-white/[0.08] pt-5">
              <p className="text-xs font-semibold text-[#FFB68D] mb-3">Transaction History</p>
              <div className="space-y-2">
                {entitlement.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0c0e13]/80 rounded-xl px-4 py-2.5 border border-white/[0.05]"
                  >
                    <span className="text-white font-medium">
                      {txn.planLabel} ({txn.mode})
                    </span>
                    <span className="text-[#D1A98E] tabular-nums">
                      ₹{txn.amountInr} · {txn.status.toUpperCase()} ·{' '}
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* STEP 1: DISCOVER HERO */}
      <section className="eclipse-card rounded-3xl p-8 sm:p-12">
        <p className="text-xs font-medium text-[#FFB68D] mb-3">
          FirstStep Individual Premium
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] eclipse-title-glow mb-4 max-w-3xl [text-wrap:balance]">
          Make space for a more personal well-being journey.
        </h1>
        <p className="text-base sm:text-lg text-[#DDC1B3]/90 leading-relaxed max-w-2xl mb-6">
          Build a consistent reflection habit with saved journals, guided programmes, personalised insights and more ways to explore your thoughts.
        </p>
        <p className="text-xs text-[#94A3B8] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FFB68D] shrink-0" />
          <span>
            Essential safety workflows, crisis support, and the Well-being Snapshot always remain free.
          </span>
        </p>
      </section>

      {/* STEP 3: PLAN SELECTION */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {PREMIUM_CONFIG.heading}
          </h2>
          <p className="text-sm text-[#D1A98E] mt-1">{PREMIUM_CONFIG.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {([PREMIUM_CONFIG.plans.monthly, PREMIUM_CONFIG.plans.annual] as const).map((plan) => {
            const isSelected = selectedPlan === plan.billingPeriod;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.billingPeriod)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedPlan(plan.billingPeriod);
                }}
                className={`rounded-3xl p-7 transition-all cursor-pointer flex flex-col justify-between gap-6 ${
                  isSelected
                    ? 'bg-[#191c21] border border-[#FF8A3D] shadow-[0_0_28px_rgba(255,138,61,0.16)]'
                    : 'eclipse-card hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {plan.badgeNote && (
                      <span className="text-[11px] font-medium text-[#FFB68D]">
                        {plan.badgeNote}
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-white tabular-nums">
                    {plan.priceDisplay}{' '}
                    <span className="text-sm font-normal text-[#D1A98E]">{plan.cadenceLabel}</span>
                  </p>
                  <p className="text-sm text-[#DDC1B3] mt-3 leading-relaxed">{plan.summary}</p>
                  <ul className="mt-5 space-y-2 text-xs text-[#D1A98E]">
                    {plan.terms.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FF8A3D] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs font-semibold text-[#FFB68D]">
                  {isSelected ? 'Selected Plan' : 'Click to select'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-[#94A3B8] max-w-2xl leading-relaxed">
            {PREMIUM_CONFIG.pricingDisclaimer}
          </p>
          <button
            type="button"
            onClick={handleChoosePremium}
            disabled={paymentLoading}
            className="eclipse-button-primary min-h-[48px] px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {entitlement.hasPremiumAccess
                ? 'Open My Journey'
                : `Choose ${planObj.name} (${planObj.priceDisplay})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* STEP 2: FREE VS PREMIUM COMPARISON */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-8 overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-5">Free vs Premium Comparison</h2>
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-white/10 text-xs text-[#FFB68D]">
              <th className="py-3 pr-4 font-semibold">Feature</th>
              <th className="py-3 px-4 font-semibold">FirstStep Free</th>
              <th className="py-3 pl-4 font-semibold">FirstStep Premium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-sm">
            {PREMIUM_CONFIG.comparisonRows.map((row) => (
              <tr key={row.feature}>
                <td className="py-3.5 pr-4 text-white font-medium">{row.feature}</td>
                <td className="py-3.5 px-4 text-[#D1A98E]">{row.free}</td>
                <td className="py-3.5 pl-4 text-[#FFB68D] font-medium">{row.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
