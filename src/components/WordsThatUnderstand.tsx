import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Feather, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { LanguageMode } from '../types';
import {
  ALL_LITERARY_THEMES,
  CONTEXTUAL_DISCOVERY_PROMPTS,
  getApprovedLiteraryEntries,
  LiteraryEntry,
  LiteraryTheme,
} from '../data/literaryCollection';

interface LineThatFoundYouCardProps {
  entry: LiteraryEntry;
  languageMode: LanguageMode;
  onReadMore: () => void;
  onNextLine?: () => void;
}

export const LineThatFoundYouCard: React.FC<LineThatFoundYouCardProps> = ({
  entry,
  languageMode,
  onReadMore,
  onNextLine,
}) => {
  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  return (
    <section className="mt-6 eclipse-card rounded-3xl p-7 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
          <Feather className="w-4 h-4 text-[#FF8A3D]" />
          <span>A Line That Found You · Words That Understand</span>
        </div>
        <div className="flex items-center gap-2.5">
          {onNextLine && (
            <button
              type="button"
              onClick={onNextLine}
              className="eclipse-button-ghost min-h-[40px] px-4 py-1.5 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FFB68D]" />
              <span>Another Line</span>
            </button>
          )}
          <button
            type="button"
            onClick={onReadMore}
            className="eclipse-button-ghost min-h-[40px] px-4 py-1.5 rounded-full text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF8A3D]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          {showTamil && entry.originalTamilText && (
            <blockquote className="font-tamil text-xl sm:text-2xl text-white leading-relaxed whitespace-pre-line">
              {entry.originalTamilText}
            </blockquote>
          )}
          {showEnglish && (
            <p className="text-sm sm:text-base text-[#FFB68D]/95 italic leading-relaxed">
              “{entry.englishTranslation}”
            </p>
          )}
          <p className="text-xs text-[#D1A98E]">
            <span className="text-white font-medium">{entry.author}</span>
            {entry.authorTamil ? ` (${entry.authorTamil})` : ''} · {entry.literaryWork}
            {entry.reference ? ` · ${entry.reference}` : ''}
          </p>
        </div>

        <div className="lg:col-span-5 rounded-2xl bg-[#0c0e13]/80 border border-white/[0.07] p-5 space-y-2.5">
          <p className="text-[11px] font-semibold text-[#FFB68D]">
            Original FirstStep Reflection (Inspired by the Verse)
          </p>
          <p className="text-sm text-[#e2e2ea]/90 leading-relaxed">
            “{entry.firstStepReflection}”
          </p>
          <p className="text-[11px] text-[#94A3B8] pt-2 border-t border-white/[0.06]">
            {entry.translationAttribution}
          </p>
        </div>
      </div>
    </section>
  );
};

interface WordsThatUnderstandProps {
  languageMode: LanguageMode;
  onStartReflection: () => void;
  onBeginDiscovery: () => void;
}

export const WordsThatUnderstand: React.FC<WordsThatUnderstandProps> = ({
  languageMode,
  onStartReflection,
  onBeginDiscovery,
}) => {
  const approvedEntries = useMemo(() => getApprovedLiteraryEntries(), []);
  const [selectedTheme, setSelectedTheme] = useState<LiteraryTheme | 'All'>('All');
  const [selectedPromptLabel, setSelectedPromptLabel] = useState<string | null>(null);
  const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);

  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  const filteredEntries = useMemo(() => {
    if (selectedPromptLabel) {
      const prompt = CONTEXTUAL_DISCOVERY_PROMPTS.find((p) => p.label === selectedPromptLabel);
      if (prompt) {
        return approvedEntries.filter((entry) =>
          entry.themes.some((t) => prompt.themes.includes(t)),
        );
      }
    }
    if (selectedTheme === 'All') return approvedEntries;
    return approvedEntries.filter((entry) => entry.themes.includes(selectedTheme));
  }, [approvedEntries, selectedTheme, selectedPromptLabel]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] mb-2">
            FirstStep Digital Anthology · Classical Tamil & Contemporary Reflections
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight eclipse-title-glow">
            Words That Understand
          </h1>
          <p className="text-sm sm:text-base text-[#DDC1B3] mt-2 max-w-2xl">
            Sometimes, someone has already found the words for what we are feeling. Explore verified classical Tamil literature and original FirstStep reflections at your own pace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBeginDiscovery}
            className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Begin Discovery
          </button>
          <button
            type="button"
            onClick={onStartReflection}
            className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
          >
            Reflect with FirstStep
          </button>
        </div>
      </div>

      {/* Voluntary Contextual Literary Discovery */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-7 space-y-4">
        <div>
          <p className="text-xs font-medium text-[#FFB68D]">Voluntary Theme Discovery</p>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Choose what resonates with you right now
          </h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CONTEXTUAL_DISCOVERY_PROMPTS.map((prompt) => {
            const active = selectedPromptLabel === prompt.label;
            return (
              <button
                key={prompt.label}
                type="button"
                onClick={() => {
                  setSelectedTheme('All');
                  setSelectedPromptLabel(active ? null : prompt.label);
                }}
                className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#FF8A3D]/25 text-[#FFB68D] border border-[#FF8A3D]/60'
                    : 'bg-[#0c0e13]/80 text-[#e2e2ea] border border-white/10 hover:border-white/25'
                }`}
              >
                {languageMode === 'tamil' ? prompt.tamilLabel : prompt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Theme Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelectedPromptLabel(null);
            setSelectedTheme('All');
          }}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            selectedTheme === 'All' && !selectedPromptLabel
              ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/50'
              : 'bg-[#111319] text-[#94A3B8] border border-white/[0.08] hover:text-white'
          }`}
        >
          All Themes ({approvedEntries.length})
        </button>
        {ALL_LITERARY_THEMES.map((theme) => {
          const active = selectedTheme === theme && !selectedPromptLabel;
          return (
            <button
              key={theme}
              type="button"
              onClick={() => {
                setSelectedPromptLabel(null);
                setSelectedTheme(theme);
              }}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/50'
                  : 'bg-[#111319] text-[#94A3B8] border border-white/[0.08] hover:text-white'
              }`}
            >
              {theme}
            </button>
          );
        })}
      </div>

      {/* Literary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEntries.map((entry) => {
          const metaOpen = expandedMetaId === entry.id;
          return (
            <article
              key={entry.id}
              className="eclipse-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#D1A98E]">
                  <span className="inline-flex items-center gap-1.5 text-[#FFB68D] font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-[#FF8A3D]" />
                    <span>{entry.literaryWork}</span>
                  </span>
                  <span>{entry.contentType}</span>
                </div>

                {showTamil && entry.originalTamilText && (
                  <blockquote className="font-tamil text-lg text-white leading-relaxed whitespace-pre-line">
                    {entry.originalTamilText}
                  </blockquote>
                )}

                {showEnglish && (
                  <p className="text-sm sm:text-[15px] text-[#FFB68D]/95 italic leading-relaxed">
                    “{entry.englishTranslation}”
                  </p>
                )}

                <p className="text-xs text-[#DDC1B3]">
                  <span className="text-white font-semibold">{entry.author}</span>
                  {entry.authorTamil ? ` · ${entry.authorTamil}` : ''}
                  {entry.reference ? ` · ${entry.reference}` : ''}
                </p>

                <div className="rounded-2xl bg-[#0c0e13]/75 border border-white/[0.06] p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#FFB68D]">
                    Original FirstStep Reflection
                  </p>
                  <p className="text-xs sm:text-sm text-[#e2e2ea]/90 leading-relaxed">
                    “{entry.firstStepReflection}”
                  </p>
                </div>
              </div>

              <div className="border-t border-white/[0.07] pt-3.5 space-y-2.5">
                <p className="text-[11px] text-[#94A3B8]">{entry.themes.join(' · ')}</p>

                <button
                  type="button"
                  onClick={() => setExpandedMetaId(metaOpen ? null : entry.id)}
                  className="text-[11px] text-[#D1A98E] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Source, Translation & Licensing</span>
                  {metaOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {metaOpen && (
                  <div className="text-[11px] text-[#94A3B8] space-y-1 pt-1 leading-relaxed">
                    <p>Source: {entry.sourceReference}</p>
                    <p>Translation: {entry.translationAttribution}</p>
                    <p>Licensing: {entry.copyrightStatus}</p>
                    <p>Review status: {entry.reviewStatus}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Responsible Use Footer Note */}
      <section className="rounded-3xl bg-[#0c0e13]/85 border border-white/[0.07] p-6 text-xs text-[#94A3B8] leading-relaxed">
        Literature can comfort, inspire, and help us reflect—but it is never a substitute for qualified mental-health support or emergency care. Classical verses are presented for gentle reflection, never to minimise difficult feelings.
      </section>
    </div>
  );
};
