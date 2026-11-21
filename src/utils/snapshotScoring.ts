import {
  BilingualText,
  SnapshotAnswerValue,
  SnapshotDimensionKey,
  SnapshotDimensionResult,
  SnapshotQuestion,
  SnapshotScoreResult,
} from '../types';

export const SNAPSHOT_RESPONSE_OPTIONS: Array<{
  value: SnapshotAnswerValue;
  label: BilingualText;
}> = [
  { value: 0, label: { english: 'Never', tamil: 'ஒருபோதும் இல்லை' } },
  { value: 1, label: { english: 'Occasionally', tamil: 'அவ்வப்போது' } },
  { value: 2, label: { english: 'Often', tamil: 'அடிக்கடி' } },
  { value: 3, label: { english: 'Almost every day', tamil: 'கிட்டத்தட்ட தினமும்' } },
];

export const SNAPSHOT_QUESTIONS: SnapshotQuestion[] = [
  {
    id: 1,
    dimension: 'stress',
    dimensionLabel: { english: 'Stress', tamil: 'மன அழுத்தம்' },
    text: {
      english: 'Have you felt overwhelmed by your responsibilities?',
      tamil: 'உங்கள் பொறுப்புகளால் மிகுந்த அழுத்தத்தை உணர்ந்தீர்களா?',
    },
  },
  {
    id: 2,
    dimension: 'stress',
    dimensionLabel: { english: 'Stress', tamil: 'மன அழுத்தம்' },
    text: {
      english: 'Have you found it difficult to relax?',
      tamil: 'மனதை அமைதிப்படுத்தி ஓய்வெடுப்பது கடினமாக இருந்ததா?',
    },
  },
  {
    id: 3,
    dimension: 'emotional_balance',
    dimensionLabel: { english: 'Emotional Balance', tamil: 'உணர்ச்சி சமநிலை' },
    text: {
      english: 'Have worries made it difficult for you to feel settled?',
      tamil: 'கவலைகள் உங்களை நிம்மதியாக உணர விடாமல் செய்ததா?',
    },
  },
  {
    id: 4,
    dimension: 'emotional_balance',
    dimensionLabel: { english: 'Emotional Balance', tamil: 'உணர்ச்சி சமநிலை' },
    text: {
      english: 'Have difficult emotions affected your day?',
      tamil: 'கடினமான உணர்வுகள் உங்கள் நாளைப் பாதித்ததா?',
    },
  },
  {
    id: 5,
    dimension: 'daily_functioning',
    dimensionLabel: { english: 'Daily Functioning', tamil: 'அன்றாட செயல்பாடு' },
    text: {
      english: 'Have you struggled to concentrate on everyday tasks?',
      tamil: 'அன்றாடப் பணிகளில் கவனம் செலுத்த சிரமப்பட்டீர்களா?',
    },
  },
  {
    id: 6,
    dimension: 'daily_functioning',
    dimensionLabel: { english: 'Daily Functioning', tamil: 'அன்றாட செயல்பாடு' },
    text: {
      english: 'Have you found it difficult to maintain your usual routine?',
      tamil: 'உங்கள் வழக்கமான அன்றாட நடைமுறையைத் தொடர்வது கடினமாக இருந்ததா?',
    },
  },
  {
    id: 7,
    dimension: 'social_connection',
    dimensionLabel: { english: 'Social Connection', tamil: 'சமூக இணைப்பு' },
    text: {
      english: 'Have you felt isolated from people around you?',
      tamil: 'உங்களைச் சுற்றியுள்ளவர்களிடமிருந்து தனிமைப்பட்டதாக உணர்ந்தீர்களா?',
    },
  },
  {
    id: 8,
    dimension: 'social_connection',
    dimensionLabel: { english: 'Social Connection', tamil: 'சமூக இணைப்பு' },
    text: {
      english: 'Have you found it difficult to reach someone when you needed support?',
      tamil: 'ஆதரவு தேவைப்பட்டபோது யாரையாவது அணுகுவது கடினமாக இருந்ததா?',
    },
  },
];

const DIMENSION_META: Record<SnapshotDimensionKey, { label: BilingualText; questionIds: [number, number] }> = {
  stress: {
    label: { english: 'Stress', tamil: 'மன அழுத்தம்' },
    questionIds: [1, 2],
  },
  emotional_balance: {
    label: { english: 'Emotional Balance', tamil: 'உணர்ச்சி சமநிலை' },
    questionIds: [3, 4],
  },
  daily_functioning: {
    label: { english: 'Daily Functioning', tamil: 'அன்றாட செயல்பாடு' },
    questionIds: [5, 6],
  },
  social_connection: {
    label: { english: 'Social Connection', tamil: 'சமூக இணைப்பு' },
    questionIds: [7, 8],
  },
};

export function getIndicatorInterpretation(indicator: number): BilingualText {
  if (indicator <= 3) {
    return {
      english: 'Lower reported difficulty in this check-in',
      tamil: 'இந்தச் சுய-பிரதிபலிப்பில் குறைந்த சிரமம் பதிவாகியுள்ளது',
    };
  }
  if (indicator <= 6) {
    return {
      english: 'Some areas may need attention',
      tamil: 'சில பகுதிகளில் கூடுதல் கவனம் தேவைப்படலாம்',
    };
  }
  if (indicator <= 8) {
    return {
      english: 'Consider additional support',
      tamil: 'கூடுதல் ஆதரவைப் பெறுவது உதவியாக இருக்கலாம்',
    };
  }
  return {
    english: 'Consider reaching out for support soon',
    tamil: 'விரைவில் நம்பகமான ஆதரவை அணுகுவதைக் கருத்தில் கொள்ளுங்கள்',
  };
}

export function validateSnapshotAnswers(
  answers: Record<number, number | undefined>,
): { valid: boolean; missingIds: number[]; error?: string } {
  const missingIds: number[] = [];
  for (const q of SNAPSHOT_QUESTIONS) {
    const val = answers[q.id];
    if (val === undefined || val === null) {
      missingIds.push(q.id);
    } else if (!Number.isInteger(val) || val < 0 || val > 3) {
      return {
        valid: false,
        missingIds: [q.id],
        error: `Invalid response value for question ${q.id}.`,
      };
    }
  }
  if (missingIds.length > 0) {
    return {
      valid: false,
      missingIds,
      error: 'Please answer all eight questions before viewing your snapshot.',
    };
  }
  return { valid: true, missingIds: [] };
}

export function calculateSnapshotScore(
  answers: Record<number, number>,
): SnapshotScoreResult {
  const validation = validateSnapshotAnswers(answers);
  if (!validation.valid) {
    throw new Error(validation.error || 'Incomplete snapshot responses.');
  }

  let totalScore = 0;
  for (const q of SNAPSHOT_QUESTIONS) {
    totalScore += answers[q.id];
  }

  // Deterministic formula: I = 1 + round((S / 24) * 9), strictly integer 1..10
  const indicator = Math.min(10, Math.max(1, 1 + Math.round((totalScore / 24) * 9)));

  const dimensionKeys: SnapshotDimensionKey[] = [
    'stress',
    'emotional_balance',
    'daily_functioning',
    'social_connection',
  ];

  const dimensions: SnapshotDimensionResult[] = dimensionKeys.map((key) => {
    const meta = DIMENSION_META[key];
    const score = answers[meta.questionIds[0]] + answers[meta.questionIds[1]];
    const percentage = Math.round((score / 6) * 100);
    return {
      key,
      label: meta.label,
      score,
      maxScore: 6,
      percentage,
    };
  });

  return {
    totalScore,
    maxTotalScore: 24,
    indicator,
    interpretation: getIndicatorInterpretation(indicator),
    dimensions,
  };
}
