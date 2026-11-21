import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';
import {
  LanguageMode,
  SafetyAssessment,
  SnapshotGeminiReflection,
  SnapshotScoreResult,
} from '../types';
import { DimensionBreakdown } from './DimensionBreakdown';
import { GeminiReflection } from './GeminiReflection';
import { SafetyWorkflow } from './SafetyWorkflow';

interface SnapshotResultsProps {
  scoreResult: SnapshotScoreResult;
  safetyAssessment: SafetyAssessment;
  reflection: SnapshotGeminiReflection | null;
  isLoadingReflection: boolean;
  languageMode: LanguageMode;
  onExploreResources: () => void;
  onStartConversation: () => void;
  onFindProfessionalSupport: () => void;
  onRestart: () => void;
}

export const SnapshotResults: React.FC<SnapshotResultsProps> = ({
  scoreResult,
  safetyAssessment,
  reflection,
  isLoadingReflection,
  languageMode,
  onExploreResources,
  onStartConversation,
  onFindProfessionalSupport,
  onRestart,
}) => {
  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [acknowledgedCheckIn, setAcknowledgedCheckIn] = useState(false);

  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  // Circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = scoreResult.indicator / 10;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const hideOrdinaryReflection = safetyAssessment.state === 'immediate_concern';

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 sm:py-12 space-y-8">
      {/* Independent Safety Layer (always evaluated separately from indicator) */}
      {safetyAssessment.state !== 'none' &&
        (safetyAssessment.state === 'immediate_concern' || !acknowledgedCheckIn) && (
          <SafetyWorkflow
            assessment={safetyAssessment}
            languageMode={languageMode}
            onContinueAnyway={
              safetyAssessment.state === 'check_in'
                ? () => setAcknowledgedCheckIn(true)
                : undefined
            }
          />
        )}

      {/* A. Overall Well-being Reflection Indicator */}
      <section className="eclipse-card rounded-3xl p-7 sm:p-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              <linearGradient id="snapshotRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#92400E" />
                <stop offset="55%" stopColor="#FF8A3D" />
                <stop offset="100%" stopColor="#FFB68D" />
              </linearGradient>
            </defs>
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#snapshotRing)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold text-white tabular-nums tracking-tight">
              {scoreResult.indicator}
              <span className="text-lg text-[#D1A98E] font-medium">/10</span>
            </span>
            <span className="text-[11px] text-[#FFB68D] mt-0.5">Reflection Indicator</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-xs font-medium text-[#FFB68D] mb-2">
            FirstStep Well-being Snapshot · Past Two Weeks
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 [text-wrap:balance]">
            Your Well-being Reflection Indicator: {scoreResult.indicator}/10
          </h1>
          {showEnglish && (
            <p className="text-base text-[#DDC1B3] mb-1">
              {scoreResult.interpretation.english}.
            </p>
          )}
          {showTamil && (
            <p className="font-tamil text-sm sm:text-base text-[#FFB68D]/90 mb-4">
              {scoreResult.interpretation.tamil}
            </p>
          )}
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            A higher number reflects more frequently reported difficulties in this particular check-in—it is not a clinical diagnosis or measure of personal worth.
          </p>
        </div>
      </section>

      {/* B. Dimension Breakdown */}
      <DimensionBreakdown dimensions={scoreResult.dimensions} languageMode={languageMode} />

      {/* C, D, E, F. Gemini Reflection (suppressed only if immediate safety concern) */}
      {!hideOrdinaryReflection && (
        <GeminiReflection reflection={reflection} isLoading={isLoadingReflection} />
      )}

      {/* G. Three Functional Calls to Action */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-2">Choose Your Next Step</h2>
        <p className="text-sm text-[#D1A98E] mb-6">
          Move at your own pace. Every pathway below is free and open without sign-in.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={onExploreResources}
            className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3.5 text-white cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-[#FF8A3D] shrink-0" />
            <div>
              <span className="text-sm font-semibold block">Explore Self-Help Resources</span>
              <span className="text-xs text-[#D1A98E]">Breathing, journaling & Sangam poetry</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onStartConversation}
            className="eclipse-button-primary min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3.5 text-white cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-white shrink-0" />
            <div>
              <span className="text-sm font-semibold block">Start a FirstStep Conversation</span>
              <span className="text-xs text-white/85">Reflect in English or தமிழ்</span>
            </div>
          </button>

          <button
            type="button"
            onClick={onFindProfessionalSupport}
            className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3.5 text-white cursor-pointer"
          >
            <HeartHandshake className="w-5 h-5 text-[#FF8A3D] shrink-0" />
            <div>
              <span className="text-sm font-semibold block">Find Professional Support</span>
              <span className="text-xs text-[#D1A98E]">Guidance & verified helplines</span>
            </div>
          </button>
        </div>
      </section>

      {/* H. Expandable Calculation Explanation & Mandatory Disclaimer */}
      <section className="rounded-3xl bg-[#0c0e13]/80 border border-white/[0.07] p-6 space-y-4">
        <button
          type="button"
          onClick={() => setShowHowCalculated((prev) => !prev)}
          aria-expanded={showHowCalculated}
          className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-white cursor-pointer"
        >
          <span>How is this indicator calculated?</span>
          {showHowCalculated ? (
            <ChevronUp className="w-4 h-4 text-[#FFB68D] shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#FFB68D] shrink-0" />
          )}
        </button>

        {showHowCalculated && (
          <div className="text-xs sm:text-sm text-[#DDC1B3] leading-relaxed space-y-2 border-t border-white/[0.07] pt-4">
            <p>
              Each of the 8 self-reflection questions is scored deterministically from 0 (Never) to 3 (Almost every day), giving a total raw score from 0 to 24 (your total: <span className="text-white font-semibold tabular-nums">{scoreResult.totalScore}/24</span>).
            </p>
            <p>
              That total is mapped onto a 1–10 Well-being Reflection Indicator using the fixed formula <span className="font-mono text-[#FFB68D]">1 + round((S / 24) × 9)</span>. The AI reflection assistant never calculates or alters this number.
            </p>
            <p>
              Each of the four dimensions (Stress, Emotional Balance, Daily Functioning, and Social Connection) combines two questions for a maximum of 6 points.
            </p>
          </div>
        )}

        <p className="text-xs text-[#94A3B8] leading-relaxed border-t border-white/[0.07] pt-4">
          This is a self-reflection indicator based on your responses. It is not a clinical assessment or diagnosis and should not be used as a substitute for professional advice.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="eclipse-button-ghost min-h-[40px] px-4 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Snapshot</span>
          </button>
        </div>
      </section>
    </div>
  );
};
