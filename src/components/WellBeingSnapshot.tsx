import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import {
  LanguageMode,
  SafetyAssessment,
  SnapshotAnswerValue,
  SnapshotGeminiReflection,
  SnapshotScoreResult,
} from '../types';
import { calculateSnapshotScore, validateSnapshotAnswers } from '../utils/snapshotScoring';
import { evaluateSafetyWorkflow } from '../utils/safetyWorkflow';
import { EclipseOrb } from './EclipseOrb';
import { SnapshotQuestionnaire } from './SnapshotQuestionnaire';
import { SnapshotResults } from './SnapshotResults';
import { postJson } from '../utils/apiClient';

interface WellBeingSnapshotProps {
  languageMode: LanguageMode;
  onChangeLanguage: (mode: LanguageMode) => void;
  onExploreResources: () => void;
  onStartConversation: () => void;
  onFindProfessionalSupport: () => void;
  onExitToSanctuary: () => void;
}

type SnapshotStage = 'intro' | 'questionnaire' | 'results';

export const WellBeingSnapshot: React.FC<WellBeingSnapshotProps> = ({
  languageMode,
  onChangeLanguage,
  onExploreResources,
  onStartConversation,
  onFindProfessionalSupport,
  onExitToSanctuary,
}) => {
  const [stage, setStage] = useState<SnapshotStage>('intro');
  const [answers, setAnswers] = useState<Record<number, SnapshotAnswerValue>>({});
  const [personalStatement, setPersonalStatement] = useState('');
  const [consentToAiProcessing, setConsentToAiProcessing] = useState(true);
  const [scoreResult, setScoreResult] = useState<SnapshotScoreResult | null>(null);
  const [safetyAssessment, setSafetyAssessment] = useState<SafetyAssessment>({
    state: 'none',
    triggeredByRule: false,
    message: { english: '', tamil: '' },
  });
  const [reflection, setReflection] = useState<SnapshotGeminiReflection | null>(null);
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);

  const handleSelectAnswer = (questionId: number, value: SnapshotAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRestart = () => {
    setAnswers({});
    setPersonalStatement('');
    setScoreResult(null);
    setReflection(null);
    setSafetyAssessment({
      state: 'none',
      triggeredByRule: false,
      message: { english: '', tamil: '' },
    });
    setStage('intro');
  };

  const handleCompleteQuestionnaire = async () => {
    const validation = validateSnapshotAnswers(answers);
    if (!validation.valid) return;

    const computed = calculateSnapshotScore(answers);
    const safety = evaluateSafetyWorkflow(personalStatement);

    setScoreResult(computed);
    setSafetyAssessment(safety);
    setStage('results');

    // If immediate danger is detected by independent safety layer, do not run ordinary reflection
    if (safety.state === 'immediate_concern') {
      setReflection(null);
      setIsLoadingReflection(false);
      return;
    }

    setIsLoadingReflection(true);
    try {
      const data = await postJson<{ reflection?: SnapshotGeminiReflection }>(
        '/api/snapshot-reflection',
        {
          answers,
          indicator: computed.indicator,
          interpretation: computed.interpretation.english,
          dimensions: computed.dimensions.map((d) => ({
            key: d.key,
            label: d.label.english,
            score: d.score,
            maxScore: d.maxScore,
            percentage: d.percentage,
          })),
          personalStatement: consentToAiProcessing ? personalStatement : '',
          consentToAiProcessing,
          languageMode,
        },
      );
      if (data?.reflection) {
        setReflection(data.reflection);
      }
    } catch {
      // Honest deterministic client fallback if network fails
      setReflection({
        summary: `Your Well-being Reflection Indicator for the past two weeks is ${computed.indicator}/10 (${computed.interpretation.english}). We could not reach the AI reflection service right now, so this summary is based directly on your structured responses.`,
        dimension_insights: computed.dimensions.map(
          (d) => `${d.label.english}: ${d.score}/${d.maxScore} (${d.percentage}%) reported difficulty.`,
        ),
        strengths_or_supportive_observations: [
          'Taking a few minutes to pause and check in with yourself is a meaningful step.',
        ],
        recommendations: [
          'Try a 2-minute breathing or grounding exercise from the Self-Help Resource Library.',
          'Start a gentle FirstStep reflection conversation whenever you want to untangle specific thoughts.',
        ],
        professional_support_note:
          'If these feelings persist, speaking with a qualified mental-health professional can offer personalised support.',
        safety_state: 'none',
        source: 'fallback',
      });
    } finally {
      setIsLoadingReflection(false);
    }
  };

  if (stage === 'questionnaire') {
    return (
      <SnapshotQuestionnaire
        languageMode={languageMode}
        answers={answers}
        onSelectAnswer={handleSelectAnswer}
        personalStatement={personalStatement}
        onChangePersonalStatement={setPersonalStatement}
        consentToAiProcessing={consentToAiProcessing}
        onChangeConsent={setConsentToAiProcessing}
        onComplete={handleCompleteQuestionnaire}
        onExit={onExitToSanctuary}
      />
    );
  }

  if (stage === 'results' && scoreResult) {
    return (
      <SnapshotResults
        scoreResult={scoreResult}
        safetyAssessment={safetyAssessment}
        reflection={reflection}
        isLoadingReflection={isLoadingReflection}
        languageMode={languageMode}
        onExploreResources={onExploreResources}
        onStartConversation={onStartConversation}
        onFindProfessionalSupport={onFindProfessionalSupport}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
      <div className="eclipse-card rounded-3xl p-7 sm:p-11 text-center">
        <EclipseOrb size="sm" className="mx-auto mb-6" />

        <p className="text-xs font-medium text-[#FFB68D] mb-2">
          Free Self-Reflection Check-In · 8 Questions · 3–5 Minutes
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight eclipse-title-glow mb-3 [text-wrap:balance]">
          FirstStep Well-being Snapshot
        </h1>

        <p className="text-base sm:text-lg text-[#DDC1B3] max-w-xl mx-auto leading-relaxed mb-6">
          Take a moment to understand how you have been feeling lately.
        </p>

        {/* Language Toggle */}
        <div className="flex justify-center mb-8">
          <div
            role="group"
            aria-label="Snapshot language"
            className="inline-flex items-center p-1 rounded-full bg-[#111319] border border-white/10"
          >
            {(['bilingual', 'english', 'tamil'] as LanguageMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onChangeLanguage(mode)}
                className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  languageMode === mode
                    ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/40'
                    : 'text-[#94A3B8] hover:text-white border border-transparent'
                }`}
              >
                {mode === 'bilingual' ? 'EN · தமிழ்' : mode === 'english' ? 'English' : 'தமிழ்'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => setStage('questionnaire')}
            className="eclipse-button-primary min-h-[48px] px-8 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>Start Free Snapshot</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onStartConversation}
            className="eclipse-button-ghost min-h-[48px] px-6 py-3 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Start a Conversation Instead
          </button>
        </div>

        <div className="border-t border-white/[0.08] pt-6 text-left max-w-xl mx-auto space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#FFB68D] shrink-0 mt-0.5" />
            <p>
              <span className="text-[#DDC1B3] font-medium">Private by default:</span> No account or payment required. Your responses and optional personal statement are not stored by default and are never shared with institutions.
            </p>
          </div>
          <p>
            This is a self-reflection check-in covering the past two weeks—not a clinical assessment or mental-health diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
