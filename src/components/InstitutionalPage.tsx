import React, { useRef } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { INSTITUTIONAL_PRICING_CONFIG } from '../data/institutionalConfig';
import { InstitutionalEnquiry } from './InstitutionalEnquiry';

interface InstitutionalPageProps {
  onTrySnapshot: () => void;
}

const CAPABILITIES = [
  'Free Well-being Snapshot for individuals (no sign-in required)',
  'AI-assisted emotional reflection in everyday, non-clinical language',
  'Bilingual English and Tamil experience with Sangam poetry & bibliotherapy',
  'Curated self-help resource library across six practical areas',
  'Guided pathways towards appropriate qualified professional support',
  'Privacy-conscious institutional access with strict individual data isolation',
  'Optional privacy-protected aggregate engagement insights (subject to consent & minimum group sizes)',
];

export const InstitutionalPage: React.FC<InstitutionalPageProps> = ({ onTrySnapshot }) => {
  const enquiryRef = useRef<HTMLDivElement | null>(null);

  const scrollToEnquiry = () => {
    enquiryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { tiers, disclaimer, illustrativeModel } = INSTITUTIONAL_PRICING_CONFIG;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-16 space-y-12">
      {/* Hero */}
      <section className="eclipse-card rounded-3xl p-8 sm:p-12">
        <p className="text-xs font-medium text-[#FFB68D] mb-3">
          FirstStep for Institutions · B2B2C Well-being Navigation
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] eclipse-title-glow mb-5 max-w-3xl [text-wrap:balance]">
          Make the first step towards well-being easier for your community.
        </h1>
        <p className="text-base sm:text-lg text-[#DDC1B3]/90 leading-relaxed max-w-2xl mb-8">
          FirstStep helps institutions provide accessible emotional well-being reflection, self-help guidance and pathways to appropriate professional support through an AI-enabled navigation platform.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={scrollToEnquiry}
            className="eclipse-button-primary min-h-[48px] px-7 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Request an Institutional Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onTrySnapshot}
            className="eclipse-button-ghost min-h-[48px] px-6 py-3 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Experience the Free Snapshot
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#D1A98E]">
          <span className="inline-flex items-center gap-1.5 text-white font-medium">
            <GraduationCap className="w-4 h-4 text-[#FF8A3D]" />
            Initial focus: Colleges & Universities
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#FFB68D]/75" />
            Employers & Corporate Teams
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#FFB68D]/75" />
            Senior-Care & Community Organisations
          </span>
        </div>
      </section>

      {/* B2B2C Visual Explanation */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] mb-1">How the B2B2C Model Works</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Institution → FirstStep Platform → Individual Users
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '01. Institution Subscribes',
              desc: 'A college, university, or organisation licences FirstStep for its eligible community through a recurring annual or monthly subscription.',
            },
            {
              step: '02. Individuals Access Freely',
              desc: 'Students, staff, or community members use the free Well-being Snapshot, bilingual reflection experience, and self-help library without paywalls.',
            },
            {
              step: '03. Navigation & Privacy-Safe Insights',
              desc: 'FirstStep guides individuals towards appropriate human support, while institutions may optionally view privacy-protected aggregate engagement trends.',
            },
          ].map((item) => (
            <div key={item.step} className="eclipse-card rounded-3xl p-6">
              <p className="text-xs font-semibold text-[#FFB68D] mb-2">{item.step}</p>
              <p className="text-sm text-[#e2e2ea]/85 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities & Privacy Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="eclipse-card rounded-3xl p-7">
          <h2 className="text-xl font-bold text-white mb-5">Platform Capabilities</h2>
          <ul className="space-y-3 text-sm text-[#e2e2ea]/90">
            {CAPABILITIES.map((cap, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-[#FF8A3D] shrink-0 mt-0.5" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="eclipse-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-3">
              <ShieldCheck className="w-4 h-4 text-[#FF8A3D]" />
              <span>Non-Negotiable Privacy Safeguards</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">
              Built for trust, never surveillance
            </h2>
            <ul className="space-y-2.5 text-sm text-[#DDC1B3] leading-relaxed">
              <li>· Institutions never see individual questionnaire responses, personal statements, or conversation histories.</li>
              <li>· Individual Well-being Reflection Indicators are never shared with employers, colleges, or administrators.</li>
              <li>· Individual well-being data is never used for student or employee evaluation.</li>
              <li>· Any future aggregate dashboard enforces minimum group sizes, consent, and strict anonymisation.</li>
            </ul>
          </div>
          <p className="text-xs text-[#94A3B8] border-t border-white/10 pt-4 mt-5">
            Institutional subscriptions provide emotional reflection and navigation—they do not include clinical diagnosis or medical treatment.
          </p>
        </section>
      </div>

      {/* Indicative Pricing Structure */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#FFB68D] mb-1">
              Primary Revenue · Institutional Subscription
            </p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Indicative Annual Pricing
            </h2>
          </div>
          <p className="text-xs text-[#D1A98E]">{disclaimer}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="eclipse-card rounded-3xl p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <h3 className="text-base font-semibold text-white">{tier.segment}</h3>
                <p className="text-2xl font-bold text-[#FFB68D] tabular-nums mt-2 mb-2">
                  {tier.indicativeAnnualPricing}
                </p>
                <p className="text-xs text-[#D1A98E] mb-4">{tier.audienceNote}</p>
                <ul className="space-y-2 text-xs text-[#e2e2ea]/85">
                  {tier.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#FF8A3D]" aria-hidden="true">·</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={scrollToEnquiry}
                className="eclipse-button-ghost min-h-[42px] w-full rounded-full text-xs font-semibold text-white cursor-pointer"
              >
                Discuss {tier.segment}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Potential future secondary offerings (not yet active): premium privacy-protected aggregate insight dashboards, institutional onboarding and configuration, custom enterprise integrations, and professional-support network integrations by agreement.
        </p>
      </section>

      {/* Illustrative Revenue Calculation */}
      <section className="rounded-3xl bg-[#0c0e13]/90 border border-white/[0.08] p-6 sm:p-8">
        <p className="text-xs font-medium text-[#FFB68D] mb-1">Hypothetical Unit Economics</p>
        <h2 className="text-xl font-bold text-white mb-4">
          How the institutional model can scale
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="rounded-2xl bg-[#111319] border border-white/[0.06] p-4">
            <p className="text-xs text-[#D1A98E]">Example Community</p>
            <p className="text-lg font-bold text-white tabular-nums mt-1">
              {illustrativeModel.eligibleUsers.toLocaleString('en-IN')} users × ₹{illustrativeModel.monthlyPerUserInr}/mo
            </p>
          </div>
          <div className="rounded-2xl bg-[#111319] border border-white/[0.06] p-4">
            <p className="text-xs text-[#D1A98E]">Illustrative Annual Contract</p>
            <p className="text-lg font-bold text-[#FFB68D] tabular-nums mt-1">
              {illustrativeModel.annualContractValueInr} / year
            </p>
          </div>
          <div className="rounded-2xl bg-[#111319] border border-white/[0.06] p-4">
            <p className="text-xs text-[#D1A98E]">10 Institutions (Illustrative)</p>
            <p className="text-lg font-bold text-white tabular-nums mt-1">
              {illustrativeModel.tenInstitutionsArrInr} ARR
            </p>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          {illustrativeModel.disclaimer}
        </p>
      </section>

      {/* Demo Enquiry Form */}
      <div ref={enquiryRef}>
        <InstitutionalEnquiry />
      </div>
    </div>
  );
};
