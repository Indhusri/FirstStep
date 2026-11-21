import React from 'react';
import { Loader2, Sparkles, CheckCircle2, HeartHandshake, Compass } from 'lucide-react';
import { SnapshotGeminiReflection } from '../types';

interface GeminiReflectionProps {
  reflection: SnapshotGeminiReflection | null;
  isLoading: boolean;
}

export const GeminiReflection: React.FC<GeminiReflectionProps> = ({
  reflection,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className="eclipse-card rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF8A3D]" />
        <p className="text-sm font-medium text-white">
          Preparing your personalised reflection...
        </p>
        <p className="text-xs text-[#D1A98E]">
          Your indicator is already calculated deterministically; we are now tailoring supportive suggestions.
        </p>
      </section>
    );
  }

  if (!reflection) return null;

  return (
    <div className="space-y-6">
      {/* Personalised Summary */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
            <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
            <span>Personalised Reflection</span>
          </div>
          {reflection.source === 'fallback' && (
            <span className="text-xs text-[#D1A98E]">
              Deterministic summary · AI service temporarily unavailable
            </span>
          )}
        </div>

        <p className="text-[15px] sm:text-base text-[#e2e2ea]/95 leading-relaxed mb-5">
          {reflection.summary}
        </p>

        {reflection.dimension_insights.length > 0 && (
          <div className="border-t border-white/10 pt-5 space-y-2.5">
            <h3 className="text-xs font-semibold text-[#FFB68D]">
              Across Your Four Dimensions
            </h3>
            <ul className="space-y-2 text-sm text-[#DDC1B3] leading-relaxed">
              {reflection.dimension_insights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#FF8A3D] mt-1" aria-hidden="true">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Supportive Observations & Suggested Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="eclipse-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#FF8A3D]" />
            <span>Supportive Observations</span>
          </div>
          <ul className="space-y-3 text-sm text-[#e2e2ea]/90 leading-relaxed">
            {reflection.strengths_or_supportive_observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#F59E0B] mt-1" aria-hidden="true">·</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="eclipse-card rounded-3xl p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-4">
            <Compass className="w-4 h-4 text-[#FF8A3D]" />
            <span>Suggested Next Steps</span>
          </div>
          <ul className="space-y-3 text-sm text-[#e2e2ea]/90 leading-relaxed">
            {reflection.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#FF8A3D] font-semibold tabular-nums">
                  {idx + 1}.
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Professional Support Note */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-3">
          <HeartHandshake className="w-4 h-4 text-[#FF8A3D]" />
          <span>A Gentle Note on Professional Support</span>
        </div>
        <p className="text-sm sm:text-[15px] text-[#DDC1B3] leading-relaxed">
          {reflection.professional_support_note}
        </p>
      </section>
    </div>
  );
};
