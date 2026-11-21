import { BilingualText } from '../types';

export type SupportGuidanceState = 'GREEN' | 'AMBER' | 'RED' | 'CLARIFY';

export interface DiscoveryOption {
  id: string;
  label: BilingualText;
}

export interface DiscoveryQuestion {
  id: 'reason' | 'duration' | 'impact' | 'helpful';
  prompt: BilingualText;
  options: DiscoveryOption[];
}

export interface DiscoveryResponses {
  reason?: string;
  duration?: string;
  impact?: string;
  helpful?: string;
  ownWords?: string;
}

export interface SupportGuidanceResult {
  state: SupportGuidanceState;
  label: BilingualText;
  colorHex: string;
  rationale: string;
  suggestedActions: string[];
  disclaimer: string;
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: 'reason',
    prompt: {
      english: 'What made you open FirstStep today?',
      tamil: 'இன்று FirstStep-ஐத் திறக்க உங்களைத் தூண்டியது என்ன?',
    },
    options: [
      {
        id: 'different_unexplained',
        label: {
          english: "Something feels different, but I can't explain it.",
          tamil: 'ஏதோ வித்தியாசமாக உணர்கிறேன், ஆனால் அதை விளக்க முடியவில்லை.',
        },
      },
      {
        id: 'mind_overloaded',
        label: {
          english: 'My mind feels overloaded.',
          tamil: 'என் மனம் மிகுந்த சுமையுடன் உணர்கிறது.',
        },
      },
      {
        id: 'emotionally_disconnected',
        label: {
          english: 'I feel emotionally disconnected.',
          tamil: 'உணர்ச்சி ரீதியாகத் துண்டிக்கப்பட்டதாக உணர்கிறேன்.',
        },
      },
      {
        id: 'worried',
        label: {
          english: 'I am worried about something.',
          tamil: 'எதையோ குறித்துக் கவலைப்படுகிறேன்.',
        },
      },
      {
        id: 'not_myself',
        label: {
          english: "I don't feel like myself lately.",
          tamil: 'சமீபத்தில் நான் என்னைப் போல் உணரவில்லை.',
        },
      },
      {
        id: 'understand_myself',
        label: {
          english: 'I simply want to understand myself better.',
          tamil: 'என்னை இன்னும் நன்றாகப் புரிந்துகொள்ள விரும்புகிறேன்.',
        },
      },
      {
        id: 'something_else',
        label: {
          english: 'Something else.',
          tamil: 'வேறு ஏதாவது.',
        },
      },
    ],
  },
  {
    id: 'duration',
    prompt: {
      english: 'How long have you been feeling this way?',
      tamil: 'எவ்வளவு காலமாக நீங்கள் இவ்வாறு உணர்கிறீர்கள்?',
    },
    options: [
      { id: 'just_today', label: { english: 'Just today.', tamil: 'இன்று மட்டும்.' } },
      { id: 'few_days', label: { english: 'A few days.', tamil: 'சில நாட்களாக.' } },
      { id: 'few_weeks', label: { english: 'A few weeks.', tamil: 'சில வாரங்களாக.' } },
      { id: 'several_months', label: { english: 'Several months.', tamil: 'பல மாதங்களாக.' } },
      { id: 'not_sure', label: { english: "I'm not sure.", tamil: 'எனக்கு உறுதியாகத் தெரியவில்லை.' } },
    ],
  },
  {
    id: 'impact',
    prompt: {
      english: 'Has this been affecting your everyday life?',
      tamil: 'இது உங்கள் அன்றாட வாழ்க்கையைப் பாதிக்கிறதா?',
    },
    options: [
      { id: 'not_really', label: { english: 'Not really.', tamil: 'அதிகமாக இல்லை.' } },
      { id: 'a_little', label: { english: 'A little.', tamil: 'சிறிதளவு.' } },
      {
        id: 'making_difficult',
        label: { english: 'It is making things difficult.', tamil: 'இது விஷயங்களைக் கடினமாக்குகிறது.' },
      },
      {
        id: 'affecting_significantly',
        label: {
          english: 'It is affecting my daily activities significantly.',
          tamil: 'இது என் அன்றாடச் செயல்பாடுகளைக் கணிசமாகப் பாதிக்கிறது.',
        },
      },
      { id: 'not_sure', label: { english: "I'm not sure.", tamil: 'எனக்கு உறுதியாகத் தெரியவில்லை.' } },
    ],
  },
  {
    id: 'helpful',
    prompt: {
      english: 'What would feel most helpful right now?',
      tamil: 'இப்போது எது உங்களுக்கு மிகவும் உதவியாக இருக்கும்?',
    },
    options: [
      {
        id: 'understand_feelings',
        label: {
          english: 'Someone to help me understand my feelings.',
          tamil: 'என் உணர்வுகளைப் புரிந்துகொள்ள உதவும் ஒரு துணை.',
        },
      },
      {
        id: 'manage_stress',
        label: {
          english: 'Practical ways to manage everyday stress.',
          tamil: 'அன்றாட மன அழுத்தத்தைக் கையாள நடைமுறை வழிகள்.',
        },
      },
      {
        id: 'space_to_express',
        label: {
          english: 'A space to express myself.',
          tamil: 'என்னை வெளிப்படுத்த ஒரு அமைதியான இடம்.',
        },
      },
      {
        id: 'find_professional',
        label: {
          english: 'Help finding professional support.',
          tamil: 'தகுதிவாய்ந்த தொழில்முறை ஆதரவைக் கண்டறிய உதவி.',
        },
      },
      {
        id: 'not_sure_need',
        label: {
          english: "I'm not sure what I need.",
          tamil: 'எனக்கு என்ன தேவை என்று உறுதியாகத் தெரியவில்லை.',
        },
      },
    ],
  },
];

// Contextual multi-phrase immediate safety patterns (never a single isolated keyword)
const IMMEDIATE_SAFETY_PHRASES = [
  /\b(want to|going to|thinking about|plan to)\s+(end my life|kill myself|hurt myself|harm myself|die tonight)\b/i,
  /\b(i\s+am\s+not\s+safe|cannot\s+keep\s+myself\s+safe|going\s+to\s+hurt\s+(myself|someone))\b/i,
  /\b(end\s+everything\s+tonight|take\s+my\s+own\s+life|suicidal\s+(thoughts|intent|plan))\b/i,
  /(என்னை நானே காயப்படுத்த|தற்கொலை செய்து|உயிரை மாய்த்து)/i,
];

export const SUPPORT_GUIDANCE_DISCLAIMER =
  'FirstStep Support Guidance is intended to help you explore appropriate support options. It is not a diagnosis, clinical assessment or prediction of risk.';

/**
 * FirstStep Support Guidance Engine (Deterministic & Independent).
 * Operates completely independently of Gemini and the Snapshot numerical score.
 */
export function evaluateSupportGuidance(responses: DiscoveryResponses): SupportGuidanceResult {
  const ownWords = (responses.ownWords || '').trim();

  // Rule 1: Immediate safety concerns always take top priority
  if (ownWords && IMMEDIATE_SAFETY_PHRASES.some((rx) => rx.test(ownWords))) {
    return {
      state: 'RED',
      label: {
        english: 'RED – Immediate safety support',
        tamil: 'சிவப்பு – உடனடி பாதுகாப்பு ஆதரவு',
      },
      colorHex: '#B83A42',
      rationale:
        'Based on what you shared, your immediate safety comes first. Ordinary self-help activities are paused so you can connect directly with trusted human or emergency support.',
      suggestedActions: [
        'Contact a trusted person who can be physically present with you right now.',
        'Call Tele-MANAS (14416) or your local emergency services immediately.',
      ],
      disclaimer: SUPPORT_GUIDANCE_DISCLAIMER,
    };
  }

  // Rule 2: AMBER – Persistent duration, meaningful daily disruption, or explicit request for professional support
  const isPersistent =
    responses.duration === 'few_weeks' || responses.duration === 'several_months';
  const hasMeaningfulImpact =
    responses.impact === 'making_difficult' || responses.impact === 'affecting_significantly';
  const requestedProfessional = responses.helpful === 'find_professional';

  if (isPersistent || hasMeaningfulImpact || requestedProfessional) {
    const reasons: string[] = [];
    if (isPersistent) reasons.push('these feelings have been present for a longer stretch');
    if (hasMeaningfulImpact) reasons.push('they have been affecting your everyday activities');
    if (requestedProfessional) reasons.push('you expressed interest in finding professional support');

    return {
      state: 'AMBER',
      label: {
        english: 'AMBER – Additional support recommended',
        tamil: 'அம்பர் – கூடுதல் ஆதரவு பரிந்துரைக்கப்படுகிறது',
      },
      colorHex: '#C18A28',
      rationale: `We suggested additional support because ${reasons.join(' and ')}. Exploring human or professional support alongside gentle reflection can help lighten what you are carrying.`,
      suggestedActions: [
        'Explore qualified professional-support pathways at your own pace.',
        'Reach out to a trusted friend, family member, or campus/workplace counselor.',
        'Continue with a guided FirstStep reflection or structured self-help programme.',
      ],
      disclaimer: SUPPORT_GUIDANCE_DISCLAIMER,
    };
  }

  // Rule 5: Insufficient or overly uncertain responses must NOT be forced into a reassuring GREEN
  const answeredCount = [
    responses.reason,
    responses.duration,
    responses.impact,
    responses.helpful,
  ].filter(Boolean).length;

  const uncertainCount = [
    responses.duration === 'not_sure',
    responses.impact === 'not_sure',
    responses.helpful === 'not_sure_need',
  ].filter(Boolean).length;

  if (answeredCount < 2 || (uncertainCount >= 2 && !ownWords)) {
    return {
      state: 'CLARIFY',
      label: {
        english: 'Clarification & Open Support Options',
        tamil: 'தெளிவுபடுத்தல் மற்றும் திறந்த ஆதரவு வழிகள்',
      },
      colorHex: '#C18A28',
      rationale:
        'You skipped several questions or felt unsure about how to describe things—and that is completely okay. Rather than rushing to a label, here are calm ways to explore further at your own pace.',
      suggestedActions: [
        'Start a gentle, open-ended FirstStep Reflection conversation.',
        'Try the free 8-question Well-being Snapshot if you want a structured check-in.',
        'Browse Self-Help Resources or Professional Support pathways whenever you wish.',
      ],
      disclaimer: SUPPORT_GUIDANCE_DISCLAIMER,
    };
  }

  // Rule 3: GREEN – Routine self-reflection or everyday well-being support
  return {
    state: 'GREEN',
    label: {
      english: 'GREEN – Self-guided support',
      tamil: 'பச்சை – சுய-வழிகாட்டப்பட்ட ஆதரவு',
    },
    colorHex: '#247A50',
    rationale:
      'Based on your responses, everyday self-guided reflection and grounding practices may be a helpful starting point right now. You can also explore human or professional support anytime.',
    suggestedActions: [
      'Try a short grounding or breathing exercise from the Self-Help Library.',
      'Begin a guided FirstStep Reflection or jot down a few lines in your Journal.',
      'Explore a self-guided FirstStep Pathway or take the free Well-being Snapshot.',
    ],
    disclaimer: SUPPORT_GUIDANCE_DISCLAIMER,
  };
}
