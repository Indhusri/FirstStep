import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ImmediateRelief } from '../types';
import { EclipseOrb } from './EclipseOrb';

interface BreathingTimerProps {
  relief: ImmediateRelief;
}

export const BreathingTimer: React.FC<BreathingTimerProps> = ({ relief }) => {
  const totalSeconds = Math.max(1, relief.duration_minutes || 2) * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds, relief.title]);

  useEffect(() => {
    if (!isRunning) return;
    if (remaining <= 0) {
      setIsRunning(false);
      return;
    }
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, remaining]);

  const elapsed = totalSeconds - remaining;
  const cyclePos = elapsed % 12; // 4s inhale, 4s hold, 4s exhale
  const breathingPhase: 'inhale' | 'hold' | 'exhale' | null = isRunning
    ? cyclePos < 4
      ? 'inhale'
      : cyclePos < 8
        ? 'hold'
        : 'exhale'
    : null;

  const phaseLabel =
    !isRunning
      ? remaining === 0
        ? 'Session Complete'
        : 'Ready When You Are'
      : relief.type === 'breathing'
        ? breathingPhase === 'inhale'
          ? 'Inhale Slowly'
          : breathingPhase === 'hold'
            ? 'Hold Gently'
            : 'Exhale Softly'
        : 'Stay Present';

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="eclipse-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
      <div className="flex flex-col items-center shrink-0">
        <EclipseOrb size="md" breathingPhase={breathingPhase} />
        <div className="mt-3 text-center">
          <p className="text-2xl font-semibold text-white tabular-nums tracking-tight">
            {formattedTime}
          </p>
          <p className="text-xs text-[#FFB68D] mt-1 font-medium">{phaseLabel}</p>
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-[#D1A98E] mb-2">
          <span className="capitalize">{relief.type}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{relief.duration_minutes} min guided relief</span>
        </div>

        <h3 className="text-xl font-semibold text-white tracking-tight mb-3">
          {relief.title}
        </h3>

        <p className="text-sm sm:text-[15px] text-[#e2e2ea]/85 leading-relaxed mb-6">
          {relief.instructions}
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <button
            type="button"
            onClick={() => {
              if (remaining === 0) {
                setRemaining(totalSeconds);
                setIsRunning(true);
              } else {
                setIsRunning((prev) => !prev);
              }
            }}
            className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Pause' : remaining === 0 ? 'Restart' : 'Start Exercise'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setRemaining(totalSeconds);
            }}
            className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium text-[#DDC1B3] inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
