import React from 'react';

interface EclipseOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  breathingPhase?: 'inhale' | 'hold' | 'exhale' | null;
  className?: string;
}

export const EclipseOrb: React.FC<EclipseOrbProps> = ({
  size = 'lg',
  breathingPhase = null,
  className = '',
}) => {
  const dimensions =
    size === 'sm'
      ? 'w-20 h-20'
      : size === 'md'
        ? 'w-40 h-40'
        : size === 'hero'
          ? 'w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80'
          : 'w-56 h-56 sm:w-64 sm:h-64';

  const scaleClass =
    breathingPhase === 'inhale'
      ? 'scale-110'
      : breathingPhase === 'hold'
        ? 'scale-110'
        : breathingPhase === 'exhale'
          ? 'scale-95'
          : 'scale-100';

  return (
    <div
      className={`relative flex items-center justify-center select-none ${dimensions} ${className}`}
      aria-hidden="true"
    >
      {/* Diffuse ambient copper aura */}
      <div
        className={`absolute -inset-10 sm:-inset-12 rounded-full eclipse-aura transition-transform duration-[4000ms] ease-in-out motion-reduce:transition-none ${scaleClass}`}
      />

      {/* Concentric orbital tracks & neural nodes */}
      <svg
        viewBox="0 0 260 260"
        className={`relative z-10 w-full h-full transition-transform duration-[4000ms] ease-in-out motion-reduce:transition-none ${scaleClass}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="eclipseGlow" cx="50%" cy="32%" r="58%">
            <stop offset="0%" stopColor="#FFB68D" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FF8A3D" stopOpacity="0.65" />
            <stop offset="78%" stopColor="#92400E" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#040507" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rimStroke" x1="130" y1="36" x2="130" y2="224" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFB68D" stopOpacity="0.85" />
            <stop offset="38%" stopColor="#FF8A3D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#92400E" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Outer concentric orbital rings */}
        <circle cx="130" cy="130" r="120" stroke="rgba(255, 138, 61, 0.12)" strokeWidth="1" />
        <circle cx="130" cy="130" r="98" stroke="rgba(245, 158, 11, 0.16)" strokeWidth="1" strokeDasharray="3 6" />

        {/* Subtle neural constellation connectors */}
        <line x1="42" y1="78" x2="78" y2="54" stroke="rgba(245, 158, 11, 0.22)" strokeWidth="0.9" />
        <line x1="184" y1="54" x2="218" y2="82" stroke="rgba(245, 158, 11, 0.22)" strokeWidth="0.9" />
        <line x1="218" y1="178" x2="188" y2="206" stroke="rgba(245, 158, 11, 0.16)" strokeWidth="0.9" />

        {/* Bioluminescent neural junction nodes */}
        <circle cx="42" cy="78" r="2.6" fill="#F59E0B" />
        <circle cx="78" cy="54" r="2" fill="#FFB68D" />
        <circle cx="184" cy="54" r="2" fill="#FFB68D" />
        <circle cx="218" cy="82" r="2.6" fill="#F59E0B" />
        <circle cx="218" cy="178" r="2" fill="#FF8A3D" fillOpacity="0.7" />
        <circle cx="188" cy="206" r="1.8" fill="#F59E0B" fillOpacity="0.6" />

        {/* Radiant solar corona behind lunar disc */}
        <circle cx="130" cy="126" r="76" fill="url(#eclipseGlow)" />

        {/* Pitch-black lunar eclipse disc */}
        <circle cx="130" cy="133" r="68" fill="#040507" stroke="url(#rimStroke)" strokeWidth="1.5" />

        {/* Crisp top crescent highlight */}
        <path
          d="M 76 92 A 68 68 0 0 1 184 92"
          stroke="#FFD4B8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.88"
        />
      </svg>
    </div>
  );
};
