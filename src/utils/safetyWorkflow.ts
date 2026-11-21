import { SafetyAssessment } from '../types';

const IMMEDIATE_DANGER_PATTERNS = [
  /\b(kill myself|end my life|suicide|suicidal|want to die|end everything|take my own life|hurt myself|self[- ]?harm|cut myself|overdose)\b/i,
  /(தற்கொலை|வாழ விரும்பவில்லை|என்னை நானே காயப்படுத்த|உயிரை மாய்த்து)/i,
];

const ELEVATED_CONCERN_PATTERNS = [
  /\b(hopeless|can'?t go on|no reason to live|nobody cares if i'?m gone|wish i wasn'?t here|disappear forever)\b/i,
  /(நம்பிக்கையே இல்லை|வாழ்க்கை அர்த்தமற்றது|யாருக்கும் கவலை இல்லை)/i,
];

/**
 * Independent, deterministic safety layer.
 * Operates completely separately from the numerical Well-being Reflection Indicator
 * and does not rely exclusively on Gemini.
 */
export function evaluateSafetyWorkflow(personalStatement?: string): SafetyAssessment {
  const text = (personalStatement || '').trim();
  if (!text) {
    return {
      state: 'none',
      triggeredByRule: false,
      message: { english: '', tamil: '' },
    };
  }

  const hasImmediateDanger = IMMEDIATE_DANGER_PATTERNS.some((rx) => rx.test(text));
  if (hasImmediateDanger) {
    return {
      state: 'immediate_concern',
      triggeredByRule: true,
      message: {
        english:
          'What you shared sounds very heavy, and your safety matters right now. You do not have to carry this alone. Please consider reaching out to a trusted person nearby or contacting a free, confidential support line or your local emergency service immediately.',
        tamil:
          'நீங்கள் பகிர்ந்தது மிகவும் கனமாகத் தெரிகிறது; உங்கள் பாதுகாப்பு இப்போது மிக முக்கியம். இதை நீங்கள் தனியாகச் சுமக்க வேண்டியதில்லை. அருகிலுள்ள நம்பகமான ஒருவரை அல்லது இலவச, ரகசிய உதவி எண்ணையோ அவசர சேவையையோ உடனடியாகத் தொடர்பு கொள்ளுங்கள்.',
      },
    };
  }

  const hasElevatedConcern = ELEVATED_CONCERN_PATTERNS.some((rx) => rx.test(text));
  if (hasElevatedConcern) {
    return {
      state: 'check_in',
      triggeredByRule: true,
      message: {
        english:
          'It sounds like things have felt deeply exhausting lately. Before continuing with ordinary reflection, please remember that human support is available whenever you need someone to listen directly.',
        tamil:
          'சமீபத்தில் விஷயங்கள் மிகவும் சோர்வூட்டுவதாக இருந்ததாகத் தெரிகிறது. சாதாரண பிரதிபலிப்பைத் தொடரும் முன், உங்களுக்குத் தேவைப்படும்போது நேரடியாகக் கேட்க மனித ஆதரவு எப்போதும் உள்ளது என்பதை நினைவில் கொள்ளுங்கள்.',
      },
    };
  }

  return {
    state: 'none',
    triggeredByRule: false,
    message: { english: '', tamil: '' },
  };
}
