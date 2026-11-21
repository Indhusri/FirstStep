import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  Copy,
  HeartHandshake,
  Phone,
  ArrowLeft,
  Feather,
  Compass,
} from 'lucide-react';
import { LanguageMode, NextStepCard } from '../types';
import { BreathingTimer } from './BreathingTimer';

interface NextStepCardViewProps {
  card: NextStepCard;
  languageMode: LanguageMode;
  onChangeLanguage: (mode: LanguageMode) => void;
  onSaveCard: (card: NextStepCard) => void;
  isSaved: boolean;
  onBackToChat: () => void;
  onStartNew: () => void;
}

export const NextStepCardView: React.FC<NextStepCardViewProps> = ({
  card,
  languageMode,
  onChangeLanguage,
  onSaveCard,
  isSaved,
  onBackToChat,
  onStartNew,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(card.practical_step.coping_script_or_tip);
      setCopiedScript(true);
      window.setTimeout(() => setCopiedScript(false), 2200);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  // STRICT RED RISK SAFETY OVERRIDE VIEW
  if (card.risk_level === 'RED') {
    const helplines = card.crisis_resources?.helplines || [
      {
        name: 'Tele-MANAS (National Mental Health Helpline, India)',
        contact: '14416 / 1-800-891-4416',
        availability: '24/7 Free & Confidential (English, Tamil & regional languages)',
      },
    ];

    return (
      <div className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        <div className="rounded-3xl bg-[#191215] border border-[#ffb4ab]/35 p-7 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb4ab] tracking-wide mb-4">
            <Phone className="w-4 h-4" />
            <span>Immediate Human Support Available</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4 [text-wrap:balance]">
            You do not have to carry this alone right now.
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-base text-[#e2e2ea] leading-relaxed">
              {card.empathetic_reflection.english}
            </p>
            <p className="font-tamil text-base text-[#ffdad6]/90 leading-relaxed">
              {card.empathetic_reflection.tamil}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-sm font-semibold text-[#ffb4ab] tracking-wide">
              Reach Out Now — Free & Confidential
            </h2>
            {helplines.map((line, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0c0e13]/90 border border-[#ffb4ab]/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-base font-semibold text-white">{line.name}</p>
                  <p className="text-xs text-[#DDC1B3] mt-1">{line.availability}</p>
                </div>
                <a
                  href={
                    line.contact.includes('http') || line.contact.includes('.com')
                      ? line.contact.startsWith('http')
                        ? line.contact
                        : `https://${line.contact}`
                      : `tel:${line.contact.replace(/[^+\d]/g, '')}`
                  }
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#93000a] hover:bg-[#b3141e] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="tabular-nums">{line.contact}</span>
                </a>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#DDC1B3]/80 leading-relaxed border-t border-white/10 pt-5 mb-6">
            FirstStep is an AI companion and cannot provide emergency medical or crisis intervention. Please contact a trained human counselor, a trusted person nearby, or your local emergency service immediately.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartNew}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-white cursor-pointer"
            >
              Return to Sanctuary
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 sm:py-12 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToChat}
          className="min-h-[44px] px-4 py-2 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reflection</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Language Segmented Control */}
          <div
            role="group"
            aria-label="Reading language"
            className="inline-flex items-center p-1 rounded-full bg-[#111319] border border-white/10"
          >
            {(['bilingual', 'english', 'tamil'] as LanguageMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeLanguage(mode)}
                className={`min-h-[36px] px-3.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  languageMode === mode
                    ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/40'
                    : 'text-[#94A3B8] hover:text-white border border-transparent'
                }`}
              >
                {mode === 'bilingual' ? 'EN · தமிழ்' : mode === 'english' ? 'English' : 'தமிழ்'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSaveCard(card)}
            disabled={isSaved}
            className={`min-h-[44px] px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#191c21] text-[#FFB68D] border border-[#FF8A3D]/30 cursor-default'
                : 'eclipse-button-ghost text-white'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to Journal' : 'Save Reflection'}</span>
          </button>
        </div>
      </div>

      {/* Emotional Snapshot Hero Card */}
      <section className="eclipse-card rounded-3xl p-7 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#D1A98E] mb-4">
          <span>Phase 3 · Your Next Step Card</span>
          <span aria-hidden="true">·</span>
          <span>
            {card.risk_level === 'AMBER'
              ? 'Elevated Support Recommended'
              : 'Grounded Guidance'}
          </span>
        </div>

        {showEnglish && (
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3 [text-wrap:balance]">
            {card.emotional_snapshot.english}
          </h1>
        )}

        {showTamil && (
          <p className="font-tamil text-lg sm:text-xl text-[#FFB68D] leading-relaxed mb-6">
            {card.emotional_snapshot.tamil}
          </p>
        )}

        <div className="border-t border-white/10 pt-6 space-y-3">
          {showEnglish && (
            <p className="text-[15px] sm:text-base text-[#e2e2ea]/90 leading-relaxed">
              {card.empathetic_reflection.english}
            </p>
          )}
          {showTamil && (
            <p className="font-tamil text-sm sm:text-[15px] text-[#DDC1B3] leading-relaxed">
              {card.empathetic_reflection.tamil}
            </p>
          )}
        </div>
      </section>

      {/* Healing Through Literature & Bibliotherapy Grid */}
      {(card.literary_reflection || card.book_recommendation) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {card.literary_reflection && (
            <section className="eclipse-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-4">
                  <Feather className="w-4 h-4 text-[#FF8A3D]" />
                  <span>Healing Through Literature</span>
                </div>

                <div className="space-y-4 mb-6">
                  {showTamil && (
                    <blockquote className="font-tamil text-lg text-white leading-relaxed">
                      “{card.literary_reflection.tamil_phrase}”
                    </blockquote>
                  )}
                  {showEnglish && (
                    <blockquote className="text-base text-[#FFB68D]/95 italic leading-relaxed">
                      “{card.literary_reflection.english_phrase}”
                    </blockquote>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs font-semibold text-white">
                  {card.literary_reflection.source_or_tradition}
                </p>
                <p className="text-sm text-[#D1A98E] leading-relaxed">
                  {card.literary_reflection.meaning_context}
                </p>
              </div>
            </section>
          )}

          {card.book_recommendation && (
            <section className="eclipse-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-4">
                  <BookOpen className="w-4 h-4 text-[#FF8A3D]" />
                  <span>Bibliotherapy Recommendation</span>
                </div>

                {showEnglish && (
                  <h2 className="text-xl font-bold text-white tracking-tight mb-1">
                    {card.book_recommendation.title_english}
                  </h2>
                )}
                {showTamil && (
                  <p className="font-tamil text-base text-[#FFB68D] mb-3">
                    {card.book_recommendation.title_tamil}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-[#D1A98E] mb-5">
                  <span>By {card.book_recommendation.author}</span>
                  {card.book_recommendation.language && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{card.book_recommendation.language}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-semibold text-white mb-1.5">Why this book helps</p>
                <p className="text-sm text-[#e2e2ea]/85 leading-relaxed">
                  {card.book_recommendation.why_it_helps}
                </p>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Immediate Relief Interactive Timer */}
      <section>
        <BreathingTimer relief={card.immediate_relief} />
      </section>

      {/* Practical Step & Human Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="eclipse-card rounded-3xl p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-3">
              <Compass className="w-4 h-4 text-[#FF8A3D]" />
              <span>Practical Next Step</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
              {card.practical_step.action_title}
            </h3>
            <p className="text-sm sm:text-[15px] text-[#e2e2ea]/85 leading-relaxed mb-6">
              {card.practical_step.coping_script_or_tip}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={handleCopyScript}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              {copiedScript ? <Check className="w-4 h-4 text-[#FFB68D]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'Copied to Clipboard' : 'Copy Coping Script'}</span>
            </button>
          </div>
        </section>

        <section
          className={`rounded-3xl p-7 flex flex-col justify-between ${
            card.risk_level === 'AMBER'
              ? 'bg-[#1f1612] border border-[#FF8A3D]/45'
              : 'eclipse-card'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-3">
              <HeartHandshake className="w-4 h-4 text-[#FF8A3D]" />
              <span>Human Connection</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">
              {card.risk_level === 'AMBER'
                ? 'Speaking with a human counselor can help lighten this weight'
                : 'When you are ready for human support'}
            </h3>
            <p className="text-sm sm:text-[15px] text-[#DDC1B3] leading-relaxed mb-6">
              {card.human_connection.cta_text}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:14416"
              className="eclipse-button-primary min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Phone className="w-4 h-4" />
              <span>Tele-MANAS · 14416</span>
            </a>
            <button
              type="button"
              onClick={onStartNew}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
