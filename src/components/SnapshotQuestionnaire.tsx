import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, MicOff, AlertCircle } from 'lucide-react';
import { LanguageMode, SnapshotAnswerValue } from '../types';
import {
  SNAPSHOT_QUESTIONS,
  SNAPSHOT_RESPONSE_OPTIONS,
} from '../utils/snapshotScoring';
import { SnapshotProgress } from './SnapshotProgress';

interface SnapshotQuestionnaireProps {
  languageMode: LanguageMode;
  answers: Record<number, SnapshotAnswerValue>;
  onSelectAnswer: (questionId: number, value: SnapshotAnswerValue) => void;
  personalStatement: string;
  onChangePersonalStatement: (value: string) => void;
  consentToAiProcessing: boolean;
  onChangeConsent: (value: boolean) => void;
  onComplete: () => void;
  onExit: () => void;
}

export const SnapshotQuestionnaire: React.FC<SnapshotQuestionnaireProps> = ({
  languageMode,
  answers,
  onSelectAnswer,
  personalStatement,
  onChangePersonalStatement,
  consentToAiProcessing,
  onChangeConsent,
  onComplete,
  onExit,
}) => {
  // 0..7 are the 8 questions; 8 is the optional personal reflection step
  const [stepIndex, setStepIndex] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef('');

  const showEnglish = languageMode === 'bilingual' || languageMode === 'english';
  const showTamil = languageMode === 'bilingual' || languageMode === 'tamil';

  const isOptionalStep = stepIndex === SNAPSHOT_QUESTIONS.length;
  const currentQuestion = !isOptionalStep ? SNAPSHOT_QUESTIONS[stepIndex] : null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoice();
      return;
    }
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setVoiceError('Voice input is not supported in this browser.');
      return;
    }

    setVoiceError(null);
    baseTextRef.current = personalStatement.trim();

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageMode === 'tamil' ? 'ta-IN' : 'en-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        const prefix = baseTextRef.current ? `${baseTextRef.current} ` : '';
        onChangePersonalStatement(`${prefix}${transcript.trimStart()}`);
      };
      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied.');
        }
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceError('Could not start voice input.');
      setIsListening(false);
    }
  };

  const handleNext = () => {
    setValidationError(null);
    if (!isOptionalStep && currentQuestion) {
      if (answers[currentQuestion.id] === undefined) {
        setValidationError('Please select one option to continue.');
        return;
      }
      setStepIndex((prev) => prev + 1);
      return;
    }
    stopVoice();
    onComplete();
  };

  const handleBack = () => {
    setValidationError(null);
    stopVoice();
    if (stepIndex === 0) {
      onExit();
    } else {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
      <div className="mb-8">
        <SnapshotProgress
          currentStep={stepIndex + 1}
          totalSteps={SNAPSHOT_QUESTIONS.length + 1}
          label={
            isOptionalStep
              ? 'Optional Personal Reflection'
              : `${currentQuestion?.dimensionLabel.english} · Over the past two weeks`
          }
        />
      </div>

      {!isOptionalStep && currentQuestion ? (
        <div className="eclipse-card rounded-3xl p-6 sm:p-9">
          <p className="text-xs font-medium text-[#FFB68D] mb-2">
            Over the past two weeks · Question {currentQuestion.id} of {SNAPSHOT_QUESTIONS.length}
          </p>

          {showEnglish && (
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2 [text-wrap:balance]">
              {currentQuestion.text.english}
            </h2>
          )}
          {showTamil && (
            <p className="font-tamil text-base sm:text-lg text-[#FFB68D]/90 leading-relaxed mb-6">
              {currentQuestion.text.tamil}
            </p>
          )}

          <div className="space-y-3 mt-6" role="radiogroup" aria-label={currentQuestion.text.english}>
            {SNAPSHOT_RESPONSE_OPTIONS.map((opt) => {
              const selected = currentAnswer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    onSelectAnswer(currentQuestion.id, opt.value);
                    setValidationError(null);
                  }}
                  className={`w-full min-h-[54px] px-5 py-3.5 rounded-2xl text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#FF8A3D]/20 border border-[#FF8A3D] text-white shadow-[0_0_20px_rgba(255,138,61,0.18)]'
                      : 'bg-[#0c0e13]/75 border border-white/[0.08] text-[#e2e2ea] hover:border-[#FF8A3D]/40 hover:bg-white/[0.03]'
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
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      selected ? 'border-[#FF8A3D] bg-[#FF8A3D]' : 'border-white/25'
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-[#040507]" />}
                  </span>
                </button>
              );
            })}
          </div>

          {validationError && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#ffb4ab]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{stepIndex === 0 ? 'Exit' : 'Back'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="eclipse-card rounded-3xl p-6 sm:p-9">
          <p className="text-xs font-medium text-[#FFB68D] mb-2">
            Optional Step · Completely Private
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
            Would you like to tell us anything else?
          </h2>
          {showTamil && (
            <p className="font-tamil text-sm text-[#FFB68D]/90 mb-4">
              வேறு ஏதாவது பகிர விரும்புகிறீர்களா? (விருப்பத்திற்குரியது)
            </p>
          )}
          <p className="text-sm text-[#D1A98E] leading-relaxed mb-5">
            You can skip this step completely. If you choose to write or speak a few lines, it is never stored by default and will only be used to tailor your reflection if you give consent below.
          </p>

          <div className="relative">
            <textarea
              rows={4}
              value={personalStatement}
              onChange={(e) => onChangePersonalStatement(e.target.value)}
              placeholder="Share anything you feel comfortable expressing…"
              aria-label="Optional personal reflection"
              className="eclipse-input w-full rounded-2xl p-4 pr-14 text-sm sm:text-[15px] text-white placeholder-[#94A3B8] resize-none"
            />
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={isListening ? 'Stop voice input' : 'Use voice input'}
              aria-pressed={isListening}
              title={isListening ? 'Stop listening' : 'Optional voice input'}
              className={`absolute bottom-3 right-3 min-h-[40px] min-w-[40px] rounded-full inline-flex items-center justify-center transition-colors cursor-pointer ${
                isListening
                  ? 'bg-[#FF8A3D]/25 text-[#FFB68D] border border-[#FF8A3D]'
                  : 'eclipse-button-ghost text-[#DDC1B3] hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {voiceError && (
            <p className="mt-2 text-xs text-[#ffb4ab]">{voiceError}</p>
          )}

          <label className="mt-5 flex items-start gap-3 text-xs text-[#DDC1B3] leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={consentToAiProcessing}
              onChange={(e) => onChangeConsent(e.target.checked)}
              className="mt-0.5 accent-[#FF8A3D] w-4 h-4 rounded cursor-pointer shrink-0"
            />
            <span>
              I understand that if I include an optional statement, it may be processed by the AI service to generate my personalised reflection. Raw personal statements are not stored by default.
            </span>
          </label>

          <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  stopVoice();
                  onChangePersonalStatement('');
                  onComplete();
                }}
                className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
              >
                Skip & View Snapshot
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View My Snapshot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[#94A3B8] leading-relaxed">
        These are proposed self-reflection questions for personal awareness, not a validated clinical or psychological assessment.
      </p>
    </div>
  );
};
