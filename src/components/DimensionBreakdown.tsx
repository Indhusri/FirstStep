import React from 'react';
import { LanguageMode, SnapshotDimensionResult } from '../types';

interface DimensionBreakdownProps {
  dimensions: SnapshotDimensionResult[];
  languageMode: LanguageMode;
}

export const DimensionBreakdown: React.FC<DimensionBreakdownProps> = ({
  dimensions,
  languageMode,
}) => {
  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  return (
    <section className="eclipse-card rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-medium text-[#FFB68D] mb-1">Past Two Weeks</p>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Dimension Breakdown
        </h2>
        <p className="text-xs text-[#D1A98E] mt-1">
          Each area reflects two self-reflection questions scored from 0 to 6. Higher percentages reflect more frequent reported difficulty.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {dimensions.map((dim) => (
          <div
            key={dim.key}
            className="rounded-2xl bg-[#0c0e13]/75 border border-white/[0.06] p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                {showEnglish && (
                  <h3 className="text-sm font-semibold text-white">{dim.label.english}</h3>
                )}
                {showTamil && (
                  <p className="font-tamil text-xs text-[#FFB68D]/90 mt-0.5">
                    {dim.label.tamil}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white tabular-nums">
                  {dim.score}/{dim.maxScore}
                </p>
                <p className="text-[11px] text-[#D1A98E] tabular-nums">{dim.percentage}%</p>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#92400E] via-[#E87228] to-[#FFB68D] transition-all duration-500"
                style={{ width: `${Math.max(4, dim.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
