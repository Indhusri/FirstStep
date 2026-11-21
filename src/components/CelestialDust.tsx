import React from 'react';

interface StarParticle {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  driftDuration: number;
  twinkleDuration: number;
  delay: number;
}

// Well-distributed, sparse field of tiny golden particles visible across the entire dark canvas
const PARTICLES: StarParticle[] = [
  { id: 1, left: '4%', top: '8%', size: 2.5, color: '#FFD27D', driftDuration: 34, twinkleDuration: 6.5, delay: 0 },
  { id: 2, left: '11%', top: '18%', size: 2, color: '#FFB68D', driftDuration: 42, twinkleDuration: 8.2, delay: 1.4 },
  { id: 3, left: '19%', top: '6%', size: 3, color: '#F59E0B', driftDuration: 38, twinkleDuration: 7.4, delay: 3.1 },
  { id: 4, left: '27%', top: '15%', size: 2, color: '#FFE2A8', driftDuration: 46, twinkleDuration: 9.1, delay: 0.8 },
  { id: 5, left: '36%', top: '9%', size: 2.5, color: '#FFD27D', driftDuration: 36, twinkleDuration: 6.8, delay: 2.6 },
  { id: 6, left: '48%', top: '7%', size: 2, color: '#FFB68D', driftDuration: 40, twinkleDuration: 8.5, delay: 4.2 },
  { id: 7, left: '59%', top: '13%', size: 3, color: '#FFD27D', driftDuration: 35, twinkleDuration: 7.1, delay: 1.1 },
  { id: 8, left: '71%', top: '8%', size: 2.2, color: '#F59E0B', driftDuration: 44, twinkleDuration: 8.8, delay: 2.9 },
  { id: 9, left: '83%', top: '14%', size: 2.8, color: '#FFE2A8', driftDuration: 39, twinkleDuration: 6.9, delay: 4.7 },
  { id: 10, left: '93%', top: '9%', size: 2.2, color: '#FFB68D', driftDuration: 41, twinkleDuration: 7.7, delay: 0.5 },

  { id: 11, left: '6%', top: '31%', size: 2.8, color: '#F59E0B', driftDuration: 37, twinkleDuration: 7.5, delay: 2.2 },
  { id: 12, left: '15%', top: '38%', size: 2.2, color: '#FFD27D', driftDuration: 45, twinkleDuration: 8.9, delay: 3.8 },
  { id: 13, left: '24%', top: '29%', size: 2.5, color: '#FFE2A8', driftDuration: 39, twinkleDuration: 7.2, delay: 1.5 },
  { id: 14, left: '38%', top: '33%', size: 2, color: '#FFB68D', driftDuration: 47, twinkleDuration: 9.4, delay: 4.4 },
  { id: 15, left: '62%', top: '28%', size: 2.5, color: '#FFD27D', driftDuration: 36, twinkleDuration: 6.6, delay: 0.9 },
  { id: 16, left: '75%', top: '35%', size: 3, color: '#F59E0B', driftDuration: 43, twinkleDuration: 8.1, delay: 2.7 },
  { id: 17, left: '87%', top: '27%', size: 2.2, color: '#FFE2A8', driftDuration: 40, twinkleDuration: 7.8, delay: 5.1 },
  { id: 18, left: '95%', top: '39%', size: 2.6, color: '#FFD27D', driftDuration: 38, twinkleDuration: 7.0, delay: 1.8 },

  { id: 19, left: '3%', top: '53%', size: 2.2, color: '#FFE2A8', driftDuration: 44, twinkleDuration: 8.6, delay: 3.3 },
  { id: 20, left: '13%', top: '59%', size: 3, color: '#FFD27D', driftDuration: 35, twinkleDuration: 6.9, delay: 0.7 },
  { id: 21, left: '22%', top: '49%', size: 2, color: '#FFB68D', driftDuration: 46, twinkleDuration: 9.0, delay: 2.4 },
  { id: 22, left: '32%', top: '56%', size: 2.5, color: '#F59E0B', driftDuration: 41, twinkleDuration: 7.6, delay: 4.9 },
  { id: 23, left: '46%', top: '52%', size: 2.2, color: '#FFD27D', driftDuration: 38, twinkleDuration: 8.0, delay: 1.6 },
  { id: 24, left: '66%', top: '48%', size: 2.6, color: '#FFE2A8', driftDuration: 42, twinkleDuration: 7.3, delay: 3.5 },
  { id: 25, left: '79%', top: '55%', size: 2.2, color: '#FFB68D', driftDuration: 47, twinkleDuration: 8.7, delay: 0.3 },
  { id: 26, left: '90%', top: '51%', size: 3, color: '#FFD27D', driftDuration: 36, twinkleDuration: 6.7, delay: 2.1 },

  { id: 27, left: '7%', top: '74%', size: 2.6, color: '#FFD27D', driftDuration: 39, twinkleDuration: 7.4, delay: 4.1 },
  { id: 28, left: '17%', top: '81%', size: 2.2, color: '#F59E0B', driftDuration: 45, twinkleDuration: 8.8, delay: 1.2 },
  { id: 29, left: '29%', top: '71%', size: 2.8, color: '#FFE2A8', driftDuration: 37, twinkleDuration: 7.1, delay: 3.6 },
  { id: 30, left: '41%', top: '77%', size: 2, color: '#FFB68D', driftDuration: 48, twinkleDuration: 9.2, delay: 0.6 },
  { id: 31, left: '54%', top: '72%', size: 2.6, color: '#FFD27D', driftDuration: 40, twinkleDuration: 7.9, delay: 2.8 },
  { id: 32, left: '69%', top: '78%', size: 3, color: '#F59E0B', driftDuration: 36, twinkleDuration: 6.8, delay: 4.5 },
  { id: 33, left: '82%', top: '73%', size: 2.2, color: '#FFE2A8', driftDuration: 43, twinkleDuration: 8.3, delay: 1.9 },
  { id: 34, left: '94%', top: '76%', size: 2.5, color: '#FFD27D', driftDuration: 38, twinkleDuration: 7.2, delay: 3.2 },

  { id: 35, left: '9%', top: '92%', size: 2.4, color: '#FFE2A8', driftDuration: 42, twinkleDuration: 8.4, delay: 2.0 },
  { id: 36, left: '23%', top: '94%', size: 2.8, color: '#FFD27D', driftDuration: 37, twinkleDuration: 7.0, delay: 4.8 },
  { id: 37, left: '39%', top: '90%', size: 2.2, color: '#F59E0B', driftDuration: 44, twinkleDuration: 8.6, delay: 1.0 },
  { id: 38, left: '58%', top: '93%', size: 2.6, color: '#FFB68D', driftDuration: 39, twinkleDuration: 7.5, delay: 3.4 },
  { id: 39, left: '76%', top: '91%', size: 3, color: '#FFD27D', driftDuration: 36, twinkleDuration: 6.9, delay: 0.4 },
  { id: 40, left: '89%', top: '94%', size: 2.2, color: '#FFE2A8', driftDuration: 45, twinkleDuration: 8.9, delay: 2.5 },
];

export const CelestialDust: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="celestial-particle absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3.5}px ${p.color}, 0 0 ${p.size * 1.5}px #FF8A3D`,
            animation: `celestialDrift ${p.driftDuration}s ease-in-out ${p.delay}s infinite alternate, celestialTwinkle ${p.twinkleDuration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};
