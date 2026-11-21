import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  HeartHandshake,
  Loader2,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { LanguageMode } from '../types';
import {
  DISCOVERY_QUESTIONS,
  DiscoveryResponses,
  evaluateSupportGuidance,
  SupportGuidanceResult,
} from '../utils/supportGuidanceEngine';
import { SnapshotProgress } from './SnapshotProgress';
import { postJson } from '../utils/apiClient';

interface DiscoveryFlowProps {
  languageMode: LanguageMode;
  onStartReflection: () => void;
  onTakeSnapshot: () => void;
  onExploreResources: () => void;
  onFindProfessionalSupport: () => void;
  onOpenJournal: () => void;
  onOpenJourney: () => void;
  onExit: () => void;
}

interface DiscoveryGeminiResponse {
  empathetic_summary: string;
  pathway_explanation: string;
  suggested_next_steps: string[];
  source: 'gemini' | 'fallback';
}

export const DiscoveryFlow: React.FC<DiscoveryFlowProps> = ({
  languageMode,
  onStartReflection,
  onTakeSnapshot,
  onExploreResources,
  onFindProfessionalSupport,
  onOpenJournal,
  onOpenJourney,
  onExit,
}) => {
  // 0..3 = 4 discovery questions, 4 = optional own words, 5 = results
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<DiscoveryResponses>({});
  const [consentToAi, setConsentToAi] = useState(true);
  const [guidance, setGuidance] = useState<SupportGuidanceResult | null>(null);
  const [aiReflection, setAiReflection] = useState<DiscoveryGeminiResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  const handleFinish = async (finalResponses: DiscoveryResponses) => {
    const computed = evaluateSupportGuidance(finalResponses);
    setGuidance(computed);
    setStep(5);

    if (computed.state === 'RED') {
      setAiReflection(null);
      setIsLoadingAi(false);
      return;
    }

    setIsLoadingAi(true);
    try {
      const data = await postJson<{ guidanceReflection?: DiscoveryGeminiResponse }>(
        '/api/discovery-guidance',
        {
          responses: {
            ...finalResponses,
            ownWords: consentToAi ? finalResponses.ownWords : '',
          },
          fixedGuidanceState: computed.state,
          rationale: computed.rationale,
          languageMode,
        },
      );
      if (data?.guidanceReflection) {
        setAiReflection(data.guidanceReflection);
      }
    } catch {
      setAiReflection({
        empathetic_summary:
          'Thank you for taking a quiet moment to explore what has been on your mind. Even when feelings are hard to put into words, pausing to notice them is a meaningful first step.',
        pathway_explanation: computed.rationale,
        suggested_next_steps: computed.suggestedActions,
        source: 'fallback',
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleRestart = () => {
    setResponses({});
    setGuidance(null);
    setAiReflection(null);
    setStep(0);
  };

  // RESULTS PAGE
  if (step === 5 && guidance) {
    const isRed = guidance.state === 'RED';
    const isAmber = guidance.state === 'AMBER';
    const isGreen = guidance.state === 'GREEN';

    return (
      <div className="max-w-4xl mx-auto px-5 py-8 sm:py-12 space-y-8">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] mb-1">
            FirstStep Discovery & Support Guidance
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            FirstStep Discovery
          </h1>
        </div>

        {/* Guidance State Banner (Color + Written Label + Icon) */}
        <section
          role={isRed ? 'alert' : undefined}
          className="rounded-3xl p-7 sm:p-9 border space-y-5"
          style={{
            backgroundColor: isRed ? '#1b1113' : 'rgba(13, 16, 23, 0.82)',
            borderColor: `${guidance.colorHex}88`,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{ backgroundColor: guidance.colorHex }}
              aria-hidden="true"
            >
              {isRed ? (
                <ShieldAlert className="w-5 h-5" />
              ) : isGreen ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isAmber ? (
                <Compass className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {guidance.label.english}
              </h2>
              {showTamil && (
                <p className="font-tamil text-sm text-[#FFB68D]/90">{guidance.label.tamil}</p>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#e2e2ea]/95 leading-relaxed">
            {guidance.rationale}
          </p>

          {/* RED: Immediate Safety Guidance takes full precedence */}
          {isRed && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#0c0e13]/90 border border-[#B83A42]/50 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Tele-MANAS (24/7 Free National Helpline, India)
                    </p>
                    <p className="text-xs text-[#DDC1B3] mt-1">
                      Free & confidential support in English, Tamil & regional languages
                    </p>
                  </div>
                  <a
                    href="tel:14416"
                    className="min-h-[44px] px-5 py-2.5 rounded-full text-white text-xs font-semibold inline-flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#B83A42' }}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="tabular-nums">Call 14416</span>
                  </a>
                </div>

                <div className="rounded-2xl bg-[#0c0e13]/90 border border-white/10 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Local Emergency or Trusted Person Nearby
                    </p>
                    <p className="text-xs text-[#DDC1B3] mt-1">
                      Please reach someone who can be physically with you or contact local emergency services immediately.
                    </p>
                  </div>
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold text-white inline-flex items-center justify-center"
                  >
                    Find Verified Local Helplines
                  </a>
                </div>
              </div>
              <p className="text-xs text-[#DDC1B3]/80 leading-relaxed">
                FirstStep does not provide live human monitoring or emergency intervention. Safety guidance is always free and never requires sign-in or payment.
              </p>
            </div>
          )}
        </section>

        {/* Ordinary Reflection & Pathways (Paused when RED) */}
        {!isRed && (
          <>
            {isLoadingAi ? (
              <section className="eclipse-card rounded-3xl p-8 flex items-center justify-center gap-3 text-sm text-[#DDC1B3]">
                <Loader2 className="w-5 h-5 animate-spin text-[#FF8A3D]" />
                <span>Preparing your personalised guidance summary...</span>
              </section>
            ) : (
              aiReflection && (
                <section className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">Empathetic Summary</h3>
                    {aiReflection.source === 'fallback' && (
                      <span className="text-xs text-[#D1A98E]">Deterministic fallback</span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-[#e2e2ea]/90 leading-relaxed">
                    {aiReflection.empathetic_summary}
                  </p>
                  <p className="text-sm text-[#DDC1B3] leading-relaxed">
                    {aiReflection.pathway_explanation}
                  </p>
                  <div className="border-t border-white/[0.08] pt-4">
                    <p className="text-xs font-semibold text-[#FFB68D] mb-2.5">
                      Suggested Next Steps
                    </p>
                    <ul className="space-y-2 text-sm text-[#e2e2ea]/90">
                      {aiReflection.suggested_next_steps.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-[#FF8A3D] font-semibold tabular-nums">
                            {idx + 1}.
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )
            )}

            {/* Connected FirstStep Pathways */}
            <section className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-5">
              <h3 className="text-lg font-semibold text-white">Continue With FirstStep</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={onStartReflection}
                  className="eclipse-button-primary min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">FirstStep Reflection</span>
                    <span className="text-xs text-white/85">Talk through your thoughts</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onTakeSnapshot}
                  className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-[#FF8A3D] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">Well-being Snapshot</span>
                    <span className="text-xs text-[#D1A98E]">Free 8-question check-in</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onExploreResources}
                  className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-[#FF8A3D] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">Self-Help Resources</span>
                    <span className="text-xs text-[#D1A98E]">Breathing & Sangam poetry</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onFindProfessionalSupport}
                  className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <HeartHandshake className="w-5 h-5 text-[#FF8A3D] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">Professional Support</span>
                    <span className="text-xs text-[#D1A98E]">Human care & helplines</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onOpenJournal}
                  className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-[#FFB68D] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">Personal Journal</span>
                    <span className="text-xs text-[#D1A98E]">Write private notes</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onOpenJourney}
                  className="eclipse-button-ghost min-h-[52px] p-4 rounded-2xl text-left flex items-center gap-3 text-white cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-[#FFB68D] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold block">FirstStep Pathways</span>
                    <span className="text-xs text-[#D1A98E]">Guided programmes & goals</span>
                  </div>
                </button>
              </div>
            </section>
          </>
        )}

        {/* Mandatory Disclaimer & Restart */}
        <section className="rounded-3xl bg-[#0c0e13]/85 border border-white/[0.07] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
            {guidance.disclaimer}
          </p>
          <button
            type="button"
            onClick={handleRestart}
            className="eclipse-button-ghost min-h-[40px] px-4 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </section>
      </div>
    );
  }

  // QUESTIONNAIRE STEPS (0..3) & OPTIONAL OPEN TEXT (4)
  const isOwnWordsStep = step === DISCOVERY_QUESTIONS.length;
  const currentQ = !isOwnWordsStep ? DISCOVERY_QUESTIONS[step] : null;
  const currentValue = currentQ ? responses[currentQ.id] : undefined;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
      <div className="mb-8">
        <SnapshotProgress
          currentStep={step + 1}
          totalSteps={DISCOVERY_QUESTIONS.length + 1}
          label={
            isOwnWordsStep
              ? 'Optional · In Your Own Words'
              : `FirstStep Discovery · Question ${step + 1} of ${DISCOVERY_QUESTIONS.length}`
          }
        />
      </div>

      {!isOwnWordsStep && currentQ ? (
        <div className="eclipse-card rounded-3xl p-6 sm:p-9">
          {showEnglish && (
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2 [text-wrap:balance]">
              {currentQ.prompt.english}
            </h1>
          )}
          {showTamil && (
            <p className="font-tamil text-base text-[#FFB68D]/90 leading-relaxed mb-6">
              {currentQ.prompt.tamil}
            </p>
          )}

          <div className="space-y-2.5 mt-5">
            {currentQ.options.map((opt) => {
              const selected = currentValue === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...responses, [currentQ.id]: opt.id };
                    setResponses(updated);
                  }}
                  className={`w-full min-h-[50px] px-5 py-3 rounded-2xl text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#FF8A3D]/20 border border-[#FF8A3D] text-white'
                      : 'bg-[#0c0e13]/75 border border-white/[0.08] text-[#e2e2ea] hover:border-[#FF8A3D]/40'
                  }`}
                >
                  <div>
                    {showEnglish && (
                      <span className="text-sm sm:text-[15px] font-medium block">
                        {opt.label.english}
                      </span>
                    )}
                    {showTamil && (
                      <span className="font-tamil text-xs text-[#DDC1B3] block mt-0.5">
                        {opt.label.tamil}
                      </span>
                    )}
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border shrink-0 ${
                      selected ? 'border-[#FF8A3D] bg-[#FF8A3D]' : 'border-white/25'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 0 ? onExit() : setStep((s) => s - 1))}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2 rounded-full text-sm font-medium text-[#DDC1B3] inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 0 ? 'Exit' : 'Back'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="min-h-[44px] px-4 py-2 rounded-full text-xs font-medium text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="eclipse-card rounded-3xl p-6 sm:p-9 space-y-5">
          <div>
            <p className="text-xs font-medium text-[#FFB68D] mb-2">Optional · Guest Privacy</p>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Would you like to explain anything in your own words?
            </h1>
            {showTamil && (
              <p className="font-tamil text-sm text-[#FFB68D]/90 mt-1">
                உங்கள் சொந்த வார்த்தைகளில் ஏதாவது விளக்க விரும்புகிறீர்களா?
              </p>
            )}
          </div>

          <textarea
            rows={4}
            value={responses.ownWords || ''}
            onChange={(e) => setResponses((prev) => ({ ...prev, ownWords: e.target.value }))}
            placeholder="Share only what feels comfortable — or leave this blank..."
            className="eclipse-input w-full rounded-2xl p-4 text-sm text-white placeholder-[#94A3B8] resize-none"
          />

          <label className="flex items-start gap-3 text-xs text-[#DDC1B3] leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={consentToAi}
              onChange={(e) => setConsentToAi(e.target.checked)}
              className="mt-0.5 accent-[#FF8A3D] w-4 h-4 shrink-0"
            />
            <span>
              I consent to my optional statement being processed by the AI reflection assistant to summarise my support pathway. Raw personal statements are not stored by default and are never shared with institutions.
            </span>
          </label>

          <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2 rounded-full text-sm font-medium text-[#DDC1B3] inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFinish({ ...responses, ownWords: '' })}
                className="eclipse-button-ghost min-h-[44px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] cursor-pointer"
              >
                Skip & View Guidance
              </button>
              <button
                type="button"
                onClick={() => handleFinish(responses)}
                className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View Support Guidance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
