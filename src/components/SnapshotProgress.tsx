import React from 'react';

interface SnapshotProgressProps {
  currentStep: number; // 1-based index (1..9 where 9 is optional reflection)
  totalSteps: number;
  label: string;
}

export const SnapshotProgress: React.FC<SnapshotProgressProps> = ({
  currentStep,
  totalSteps,
  label,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((currentStep / totalSteps) * 100)));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 text-xs text-[#D1A98E] mb-2">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[#FFB68D] font-semibold">
          {currentStep} / {totalSteps}
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#92400E] via-[#FF8A3D] to-[#FFB68D] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
