import React from 'react';
import { Phone, ShieldAlert } from 'lucide-react';
import { LanguageMode, SafetyAssessment } from '../types';

interface SafetyWorkflowProps {
  assessment: SafetyAssessment;
  languageMode: LanguageMode;
  onContinueAnyway?: () => void;
}

export const SafetyWorkflow: React.FC<SafetyWorkflowProps> = ({
  assessment,
  languageMode,
  onContinueAnyway,
}) => {
  if (assessment.state === 'none') return null;

  const isImmediate = assessment.state === 'immediate_concern';
  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  return (
    <section
      role="alert"
      className="rounded-3xl bg-[#191215] border border-[#ffb4ab]/35 p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center gap-2.5 text-xs font-semibold text-[#ffb4ab]">
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>
          {isImmediate
            ? 'Immediate Support & Safety Check'
            : 'Supportive Safety Check'}
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight [text-wrap:balance]">
        {isImmediate
          ? 'Your safety comes first. Please consider reaching out right now.'
          : 'You do not have to carry heavy moments on your own.'}
      </h2>

      <div className="space-y-3">
        {showEnglish && (
          <p className="text-sm sm:text-base text-[#e2e2ea] leading-relaxed">
            {assessment.message.english}
          </p>
        )}
        {showTamil && (
          <p className="font-tamil text-sm sm:text-base text-[#ffdad6]/90 leading-relaxed">
            {assessment.message.tamil}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="rounded-2xl bg-[#0c0e13]/90 border border-[#ffb4ab]/25 p-4 flex flex-col justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Tele-MANAS (India National Helpline)
            </p>
            <p className="text-xs text-[#DDC1B3] mt-1">
              24/7 Free & Confidential · English, Tamil & regional languages
            </p>
          </div>
          <a
            href="tel:14416"
            className="min-h-[44px] px-4 py-2 rounded-full bg-[#93000a] hover:bg-[#b3141e] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="tabular-nums">Call 14416</span>
          </a>
        </div>

        <div className="rounded-2xl bg-[#0c0e13]/90 border border-white/10 p-4 flex flex-col justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Local Emergency or Trusted Person
            </p>
            <p className="text-xs text-[#DDC1B3] mt-1">
              If you are in immediate danger, contact your local emergency services or someone nearby right away.
            </p>
          </div>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="eclipse-button-ghost min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-white inline-flex items-center justify-center"
          >
            Find Local Verified Helplines
          </a>
        </div>
      </div>

      <p className="text-xs text-[#DDC1B3]/80 border-t border-white/10 pt-4 leading-relaxed">
        FirstStep is an automated self-reflection tool and does not provide live human monitoring or emergency clinical intervention. Safety guidance is always free and never requires sign-in or payment.
      </p>

      {!isImmediate && onContinueAnyway && (
        <div>
          <button
            type="button"
            onClick={onContinueAnyway}
            className="eclipse-button-ghost min-h-[40px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Continue viewing my reflection
          </button>
        </div>
      )}
    </section>
  );
};
