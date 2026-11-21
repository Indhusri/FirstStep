import React from 'react';
import { ArrowRight, Feather } from 'lucide-react';
import { LanguageMode } from '../types';
import { LiteraryEntry } from '../data/literaryCollection';

interface LivingWelcomeProps {
  entry: LiteraryEntry;
  languageMode: LanguageMode;
  onExploreAnthology: () => void;
}

export const LivingWelcome: React.FC<LivingWelcomeProps> = ({
  entry,
  languageMode,
  onExploreAnthology,
}) => {
  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';
  const isClassical = entry.kind === 'classical_excerpt';

  return (
    <section className="eclipse-card rounded-3xl p-7 sm:p-10 border border-[#FF8A3D]/30 shadow-[0_0_48px_-18px_rgba(255,138,61,0.24)] text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#FFB68D] tracking-wide">
          <Feather className="w-4 h-4 text-[#FF8A3D]" />
          <span>Words That Understand</span>
        </span>
        <button
          type="button"
          onClick={onExploreAnthology}
          className="eclipse-button-ghost min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Explore Anthology</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF8A3D]" />
        </button>
      </div>

      <div className="space-y-4">
        {showTamil && entry.originalTamilText && (
          <blockquote className="font-tamil text-xl sm:text-2xl text-white leading-[1.7] whitespace-pre-line">
            “{entry.originalTamilText}”
          </blockquote>
        )}

        {showEnglish && (
          <p className="text-base sm:text-lg text-[#FFB68D]/95 italic leading-relaxed">
            “{entry.englishTranslation}”
          </p>
        )}

        {languageMode === 'tamil' && entry.tamilExplanation && (
          <p className="font-tamil text-sm text-[#DDC1B3] leading-relaxed">
            {entry.tamilExplanation}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8] pt-1">
          <span className="text-white font-medium">
            {languageMode === 'tamil' && entry.authorTamil ? entry.authorTamil : entry.author}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {languageMode === 'tamil' && entry.literaryWorkTamil
              ? entry.literaryWorkTamil
              : entry.literaryWork}
            {entry.reference ? ` (${entry.reference})` : ''}
          </span>
        </div>

        {isClassical && (
          <div className="mt-5 pt-5 border-t border-white/[0.08]">
            <p className="text-sm text-[#DDC1B3] leading-relaxed">
              <span className="text-[#FFB68D] font-semibold">FirstStep reflection:</span> “
              {entry.firstStepReflection}”
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
