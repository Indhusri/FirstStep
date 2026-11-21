import React, { useEffect, useState } from 'react';
import { BookOpen, Feather, HeartHandshake, ArrowRight } from 'lucide-react';
import { SELF_HELP_CATEGORIES } from '../data/selfHelpResources';
import { LanguageMode } from '../types';

interface SelfHelpResourcesProps {
  languageMode: LanguageMode;
  initialCategoryId?: string;
  onStartConversation: () => void;
  onStartSnapshot: () => void;
}

export const SelfHelpResources: React.FC<SelfHelpResourcesProps> = ({
  languageMode,
  initialCategoryId,
  onStartConversation,
  onStartSnapshot,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategoryId || SELF_HELP_CATEGORIES[0].id,
  );

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  const activeCategory =
    SELF_HELP_CATEGORIES.find((c) => c.id === selectedCategoryId) || SELF_HELP_CATEGORIES[0];

  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] mb-2">
            FirstStep Resource Library · Self-Help & Bibliotherapy
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Self-Help Resource Library
          </h1>
          <p className="text-sm sm:text-base text-[#D1A98E] mt-2 max-w-2xl">
            Gentle everyday practices, Tamil Sangam literary reflections, and clear pathways to qualified human care.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartSnapshot}
            className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Take Free Snapshot
          </button>
          <button
            type="button"
            onClick={onStartConversation}
            className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Reflect with FirstStep</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Selector Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Self-help categories">
        {SELF_HELP_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/50'
                  : 'bg-[#111319] text-[#DDC1B3]/80 border border-white/[0.08] hover:text-white hover:border-white/20'
              }`}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Active Category Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-5">
          <section className="eclipse-card rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-2">
              {activeCategory.isProfessionalSupport ? (
                <HeartHandshake className="w-4 h-4 text-[#FF8A3D]" />
              ) : (
                <BookOpen className="w-4 h-4 text-[#FF8A3D]" />
              )}
              <span>
                {activeCategory.isProfessionalSupport
                  ? 'Qualified Human Care Guidance'
                  : 'General Self-Help Practice'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeCategory.title}
            </h2>
            {showTamil && (
              <p className="font-tamil text-sm text-[#FFB68D]/90 mt-1">
                {activeCategory.tamilTitle}
              </p>
            )}
            <p className="text-sm sm:text-[15px] text-[#DDC1B3] leading-relaxed mt-3 mb-6">
              {activeCategory.description}
            </p>

            <div className="space-y-4">
              {activeCategory.activities.map((act, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0c0e13]/80 border border-white/[0.07] p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white">{act.title}</h3>
                    <span className="text-xs text-[#FFB68D] whitespace-nowrap shrink-0">
                      {act.duration}
                    </span>
                  </div>
                  <p className="text-sm text-[#e2e2ea]/85 leading-relaxed">{act.guidance}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-5">
          {activeCategory.literaryNote && (
            <section className="eclipse-card rounded-3xl p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D] mb-3">
                <Feather className="w-4 h-4 text-[#FF8A3D]" />
                <span>Literary Reflection & Bibliotherapy</span>
              </div>
              <blockquote className="font-tamil text-base text-white leading-relaxed mb-3">
                “{activeCategory.literaryNote.tamilVerse}”
              </blockquote>
              <p className="text-sm text-[#FFB68D]/90 italic leading-relaxed mb-4">
                “{activeCategory.literaryNote.englishTranslation}”
              </p>
              <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-[#D1A98E]">
                <p className="text-white font-medium">{activeCategory.literaryNote.tradition}</p>
                <p>Suggested reading: {activeCategory.literaryNote.bookSuggestion}</p>
              </div>
            </section>
          )}

          <section className="rounded-3xl bg-[#0c0e13]/85 border border-white/[0.08] p-6 text-xs text-[#94A3B8] leading-relaxed space-y-2.5">
            <p className="text-[#DDC1B3] font-semibold">
              Distinction from Clinical Care
            </p>
            <p>
              Literary reflections, Sangam poetry, and general self-help exercises are designed for calm everyday reflection. They are not medical advice, psychotherapy, or a substitute for qualified mental-health professionals.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
