import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const FIRSTSTEP_SYSTEM_PROMPT = `You are FirstStep, an intelligent, compassionate, and boundaried emotional well-being companion featuring "Healing Through Literature" (Bilingual English & Tamil).

CORE MISSION:
You bridge the gap between feeling overwhelmed and taking a positive next step. You prioritize "navigation before destination." You listen in everyday language, validate emotions without using medical jargon, and provide clear, grounded guidance enriched by bilingual literature and book suggestions.

BOUNDARIES & NON-CLINICAL RULESET (CRITICAL):
1. NEVER provide medical or psychiatric diagnoses (e.g., do NOT say "You have Clinical Depression" or "This is GAD").
2. NEVER prescribe medications, medical treatments, or formal clinical advice.
3. NEVER claim to be a therapist, doctor, or replacement for human professional care.
4. Always clarify that you are an AI companion designed to help untangle thoughts and point to right resources.

HEALING THROUGH LITERATURE & BIBLIOTHERAPY INSTRUCTIONS (GREEN & AMBER TIERS ONLY):
- Integrate short, comforting literary reflections including Tamil Sangam poetry (e.g., Akam themes of inner emotion or Puram themes of resilience), Tamil poetry, or reflective world literature.
- ALWAYS provide literary reflections in BOTH English and Tamil (with proper Tamil script) so the user can choose which phrasing speaks to them.
- ALWAYS include ONE curated book recommendation (bibliotherapy) that fits the user's emotional context (e.g., a quiet poetry collection, comforting essays, or reflective literature in English or Tamil). Explain briefly why the book brings comfort.

CONVERSATIONAL PHASES:
PHASE 1: LISTEN & MIRROR
- Validate the user's feelings immediately using warm, authentic language. Keep initial responses brief (2-4 sentences max).

PHASE 2: CLARIFY CONTEXT
- Ask 1-2 gentle follow-up questions to understand the context (e.g., work stress, academic burnout, loneliness, relationship ache).

PHASE 3: GUIDE (NEXT STEP CARD GENERATION)
- Generate structured guidance containing:
  1. Bilingual emotional snapshot.
  2. Literary/poetic reflection in English AND Tamil.
  3. Bibliotherapy book recommendation (Title in EN & TA, Author, and Why It Helps).
  4. Immediate 2-minute relief exercise.
  5. Actionable practical coping script.
  6. Counselor/Human referral link.

RISK EVALUATION & SAFETY OVERRIDE (STRICT):
Categorize risk levels as:
- GREEN: Normal stress, burnout, mild anxiety, general loneliness. Full literary/book features active.
- AMBER: High distress, persistent hopelessness. Full features active with STRONGER human care recommendations.
- RED: Explicit mentions of self-harm, suicidal thoughts, intent to end life, or severe crisis.

WHEN RED RISK IS DETECTED:
1. Immediately stop normal conversational guidance, self-care exercises, poetry reflections, and book recommendations.
2. SUPPRESS all literary quotes and book suggestions (do NOT offer poetry in crisis).
3. Respond with utmost warmth, calm, and clarity, surfacing emergency helplines (e.g., Tele-MANAS: 14416).`;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const NEXT_STEP_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    risk_level: {
      type: Type.STRING,
      enum: ['GREEN', 'AMBER', 'RED'],
    },
    empathetic_reflection: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        tamil: { type: Type.STRING },
      },
      required: ['english', 'tamil'],
    },
    emotional_snapshot: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING },
        tamil: { type: Type.STRING },
      },
      required: ['english', 'tamil'],
    },
    literary_reflection: {
      type: Type.OBJECT,
      description: 'Bilingual poetry or Sangam verse reflection. Omit or leave empty if RED.',
      properties: {
        english_phrase: { type: Type.STRING },
        tamil_phrase: { type: Type.STRING },
        source_or_tradition: { type: Type.STRING },
        meaning_context: { type: Type.STRING },
      },
      required: ['english_phrase', 'tamil_phrase', 'source_or_tradition', 'meaning_context'],
    },
    book_recommendation: {
      type: Type.OBJECT,
      description: 'Bibliotherapy recommendation. Omit or leave empty if RED.',
      properties: {
        title_english: { type: Type.STRING },
        title_tamil: { type: Type.STRING },
        author: { type: Type.STRING },
        language: { type: Type.STRING, enum: ['English', 'Tamil', 'Bilingual'] },
        why_it_helps: { type: Type.STRING },
      },
      required: ['title_english', 'title_tamil', 'author', 'why_it_helps'],
    },
    immediate_relief: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['breathing', 'grounding', 'journaling', 'stretching'] },
        duration_minutes: { type: Type.INTEGER },
        instructions: { type: Type.STRING },
      },
      required: ['title', 'type', 'duration_minutes', 'instructions'],
    },
    practical_step: {
      type: Type.OBJECT,
      properties: {
        action_title: { type: Type.STRING },
        coping_script_or_tip: { type: Type.STRING },
      },
      required: ['action_title', 'coping_script_or_tip'],
    },
    human_connection: {
      type: Type.OBJECT,
      properties: {
        recommend_human_care: { type: Type.BOOLEAN },
        cta_text: { type: Type.STRING },
      },
      required: ['recommend_human_care', 'cta_text'],
    },
    crisis_resources: {
      type: Type.OBJECT,
      properties: {
        is_active: { type: Type.BOOLEAN },
        helplines: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              contact: { type: Type.STRING },
              availability: { type: Type.STRING },
            },
            required: ['name', 'contact', 'availability'],
          },
        },
      },
      required: ['is_active', 'helplines'],
    },
  },
  required: [
    'risk_level',
    'empathetic_reflection',
    'emotional_snapshot',
    'immediate_relief',
    'practical_step',
    'human_connection',
  ],
};

const CHAT_CRISIS_PATTERNS = [
  /\b(want to|going to|thinking about|plan to)\s+(end my life|kill myself|hurt myself|harm myself|die tonight)\b/i,
  /\b(end\s+everything\s+tonight|take\s+my\s+own\s+life|suicidal\s+(thoughts|intent|plan)|self[- ]?harm)\b/i,
  /(என்னை நானே காயப்படுத்த|தற்கொலை|உயிரை மாய்த்து|வாழ விரும்பவில்லை)/i,
];

// Health check endpoint (does not expose secrets)
app.get('/api/health', (_req, res) => {
  return res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Phase 1 & 2 Conversational Listening Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, languageMode = 'bilingual' } = req.body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      languageMode?: 'bilingual' | 'english' | 'tamil';
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const sanitizedMessages = messages
      .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content.trim() }],
      }));

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: 'At least one non-empty message is required.' });
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')?.content || '';
    const userDisclosedCrisis = CHAT_CRISIS_PATTERNS.some((rx) => rx.test(latestUserMessage));

    const ai = getAIClient();

    const languageInstruction =
      languageMode === 'tamil'
        ? 'Respond primarily in warm, natural Tamil (using Tamil script).'
        : languageMode === 'english'
          ? 'Respond in warm, natural English.'
          : 'Respond in warm, natural English and include a gentle 1-sentence Tamil reflection or phrase (in Tamil script) when appropriate.';

    const chatSystemInstruction = `${FIRSTSTEP_SYSTEM_PROMPT}

CURRENT CONVERSATION MODE (PHASE 1 & 2 — LISTEN & CLARIFY):
- Keep replies concise (2–4 sentences max), warm, non-clinical, and grounded.
- Preserve context from earlier turns in the conversation.
- ${languageInstruction}
- If the user expresses self-harm, suicidal intent, or immediate danger (RED risk), immediately respond with calm warmth, omit all poetry/books/exercises, and surface Tele-MANAS (14416) and local emergency support.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: sanitizedMessages,
      config: {
        systemInstruction: chatSystemInstruction,
      },
    });

    let reply =
      response.text?.trim() ||
      'I am here with you. Take a slow breath and share whatever feels right.';

    const lowerReply = reply.toLowerCase();
    const replyFlagsCrisis =
      lowerReply.includes('14416') ||
      lowerReply.includes('tele-manas') ||
      lowerReply.includes('helpline') ||
      lowerReply.includes('emergency');

    const isCrisis = userDisclosedCrisis || replyFlagsCrisis;

    if (userDisclosedCrisis && !lowerReply.includes('14416')) {
      reply = `${reply}\n\nIf you are in immediate distress, please reach out to Tele-MANAS (14416 / 1-800-891-4416 — free, 24/7 confidential support in English & Tamil) or contact a trusted person or local emergency service right away.`;
    }

    return res.json({ reply, isCrisis });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    const rawMsg = error instanceof Error ? error.message : 'Failed to generate response.';
    const message =
      rawMsg.includes('API_KEY') ||
      rawMsg.includes('GEMINI_API_KEY') ||
      rawMsg.includes('403') ||
      rawMsg.includes('401')
        ? 'Gemini API key is missing or invalid. Please check your GEMINI_API_KEY in Settings > Secrets.'
        : rawMsg;
    return res.status(500).json({ error: message });
  }
});

// Phase 3 Structured Next Step Card Endpoint
app.post('/api/next-step', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as {
      messages?: Array<{ role?: string; content?: string }>;
      singleInput?: string;
      languageMode?: 'bilingual' | 'english' | 'tamil';
    };

    const { messages, singleInput, languageMode = 'bilingual' } = body;

    const sanitizedMessages = Array.isArray(messages)
      ? messages
          .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
          .slice(-24)
          .map((m) => ({
            role: m.role === 'assistant' ? 'FirstStep' : 'User',
            content: m.content!.trim().slice(0, 2000),
          }))
      : [];

    const contextText =
      (typeof singleInput === 'string' && singleInput.trim().slice(0, 4000)) ||
      (sanitizedMessages.length > 0
        ? sanitizedMessages.map((m) => `${m.role}: ${m.content}`).join('\n')
        : '');

    if (!contextText) {
      return res.status(400).json({
        error: 'Please share at least one message before generating your Next Step Card.',
      });
    }

    const userDisclosedCrisis = CHAT_CRISIS_PATTERNS.some((rx) => rx.test(contextText));

    const ai = getAIClient();

    const languageGuidance =
      languageMode === 'tamil'
        ? 'Keep both English and Tamil fields complete and natural, with special care and richness in the Tamil script phrasing.'
        : languageMode === 'english'
          ? 'Keep both English and Tamil fields complete and natural, with clear, grounded English phrasing.'
          : 'Provide balanced, heartfelt bilingual phrasing in both English and proper Tamil script.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Analyze the following user reflection/conversation and generate a structured Phase 3 Next Step Card JSON following all FirstStep rules. ${languageGuidance}\n\n${contextText}`,
      config: {
        systemInstruction: FIRSTSTEP_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: NEXT_STEP_RESPONSE_SCHEMA,
      },
    });

    const rawText = (response.text ?? '')
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!rawText) {
      console.error('Error in /api/next-step: Empty response text from Gemini');
      return res.status(502).json({
        error: 'FirstStep could not complete your Next Step Card right now. Please try again.',
      });
    }

    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Error in /api/next-step: Failed to parse Gemini JSON output:', {
        parseErr,
        preview: rawText.slice(0, 200),
      });
      return res.status(502).json({
        error: 'FirstStep received an incomplete reflection format. Please try generating your Next Step Card again.',
      });
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.empathetic_reflection?.english ||
      !parsed.emotional_snapshot?.english ||
      !parsed.immediate_relief?.title ||
      !parsed.practical_step?.action_title
    ) {
      console.error('Error in /api/next-step: Gemini JSON missing required card fields');
      return res.status(502).json({
        error: 'FirstStep could not assemble all parts of your Next Step Card. Please try again.',
      });
    }

    // Enforce strict RED risk safety override on the server
    if (parsed.risk_level === 'RED' || userDisclosedCrisis) {
      parsed.risk_level = 'RED';
      delete parsed.literary_reflection;
      delete parsed.book_recommendation;
      const existingHelplines = Array.isArray(parsed.crisis_resources?.helplines)
        ? parsed.crisis_resources.helplines
        : [];
      const hasTeleManas = existingHelplines.some(
        (h: { contact?: string; name?: string }) =>
          String(h.contact).includes('14416') || String(h.name).toLowerCase().includes('tele-manas'),
      );
      parsed.crisis_resources = {
        is_active: true,
        helplines: hasTeleManas
          ? existingHelplines
          : [
              {
                name: 'Tele-MANAS (National Mental Health Helpline, India)',
                contact: '14416 / 1-800-891-4416',
                availability: '24/7 Free & Confidential (English, Tamil & regional languages)',
              },
              {
                name: 'Sneha Suicide Prevention Centre (Chennai)',
                contact: '+91 44 2464 0050',
                availability: '24/7 Confidential Support',
              },
              {
                name: 'International Crisis Support (Find A Helpline)',
                contact: 'findahelpline.com',
                availability: '24/7 Global Directory',
              },
              ...existingHelplines,
            ],
      };
    } else {
      parsed.crisis_resources = {
        is_active: false,
        helplines: Array.isArray(parsed.crisis_resources?.helplines)
          ? parsed.crisis_resources.helplines
          : [],
      };
    }

    return res.json({ card: parsed });
  } catch (error) {
    console.error('Error in /api/next-step:', error);
    const rawMsg = error instanceof Error ? error.message : 'Failed to generate Next Step Card.';
    const lowerMsg = rawMsg.toLowerCase();

    if (
      rawMsg.includes('API_KEY') ||
      rawMsg.includes('GEMINI_API_KEY') ||
      rawMsg.includes('403') ||
      rawMsg.includes('401')
    ) {
      return res.status(503).json({
        error:
          'FirstStep AI service is not configured correctly on the server. Please verify GEMINI_API_KEY in server environment settings.',
      });
    }

    if (rawMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('resource_exhausted')) {
      return res.status(429).json({
        error: 'FirstStep is experiencing high demand right now. Please wait a moment and try again.',
      });
    }

    if (lowerMsg.includes('timeout') || lowerMsg.includes('deadline') || lowerMsg.includes('aborted')) {
      return res.status(504).json({
        error: 'Generating your Next Step Card took too long. Please try again.',
      });
    }

    return res.status(500).json({
      error: 'Unable to generate your Next Step Card right now. Please try again shortly.',
    });
  }
});

const SNAPSHOT_SYSTEM_PROMPT = `You are FirstStep's empathetic emotional well-being reflection assistant. Your role is to help users understand their self-reported experiences and explore appropriate next steps.

You are not a therapist, psychologist, psychiatrist or diagnostic system.

Do not diagnose mental-health conditions, prescribe treatment, infer a disorder, or claim clinical certainty.

Never calculate, modify or override the Well-being Reflection Indicator. The indicator and dimension scores are calculated independently by the application.

Generate supportive, balanced and non-judgmental reflections using only the information supplied.

Do not invent facts about the user, their history or their circumstances.

Provide practical, low-risk self-help suggestions and explain when professional support may be useful.

Do not imply that using FirstStep replaces professional or emergency support.

If a safety concern is detected, follow the application's separate safety protocol rather than continuing ordinary reflection.`;

const SNAPSHOT_REFLECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    dimension_insights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    strengths_or_supportive_observations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    professional_support_note: { type: Type.STRING },
    safety_state: {
      type: Type.STRING,
      enum: ['none', 'supportive_check', 'urgent_guidance'],
    },
  },
  required: [
    'summary',
    'dimension_insights',
    'strengths_or_supportive_observations',
    'recommendations',
    'professional_support_note',
    'safety_state',
  ],
};

function buildDeterministicFallback(
  indicator: number,
  interpretation: string,
  dimensions: Array<{ label: string; score: number; maxScore: number; percentage: number }>,
) {
  const highest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const lowest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return {
    summary: `Your Well-being Reflection Indicator for the past two weeks is ${indicator}/10 (${interpretation}). AI-personalised reflection is currently unavailable, so this summary is generated directly from your structured responses.`,
    dimension_insights: dimensions.map(
      (d) => `${d.label}: ${d.score}/${d.maxScore} (${d.percentage}%) reported difficulty over the past two weeks.`,
    ),
    strengths_or_supportive_observations: [
      `Taking a few minutes to check in with yourself is a constructive first step.`,
      lowest
        ? `${lowest.label} showed lower reported difficulty (${lowest.score}/${lowest.maxScore}) compared with other areas in this check-in.`
        : 'You completed all eight reflection questions honestly.',
    ],
    recommendations: [
      highest
        ? `Consider starting with one small, gentle step focused on ${highest.label.toLowerCase()}.`
        : 'Take a two-minute breathing or grounding pause today.',
      'Explore the FirstStep Self-Help Resource Library for short breathing, journaling, and routine ideas.',
      'If these patterns continue to feel heavy, consider speaking with a trusted person or a qualified professional.',
    ],
    professional_support_note:
      'Speaking with a qualified mental-health professional or counselor can offer personalised human support whenever you feel ready. FirstStep is a self-reflection tool and does not replace professional care.',
    safety_state: 'none' as const,
    source: 'fallback' as const,
  };
}

// Well-being Snapshot Gemini Personalisation Endpoint
app.post('/api/snapshot-reflection', async (req, res) => {
  const {
    answers,
    indicator,
    interpretation,
    dimensions,
    personalStatement,
    consentToAiProcessing,
    languageMode = 'bilingual',
  } = req.body as {
    answers: Record<string, number>;
    indicator: number;
    interpretation: string;
    dimensions: Array<{ key: string; label: string; score: number; maxScore: number; percentage: number }>;
    personalStatement?: string;
    consentToAiProcessing?: boolean;
    languageMode?: 'bilingual' | 'english' | 'tamil';
  };

  if (!answers || typeof indicator !== 'number' || !Array.isArray(dimensions) || dimensions.length !== 4) {
    return res.status(400).json({ error: 'Valid structured snapshot results are required.' });
  }

  const fallback = buildDeterministicFallback(indicator, interpretation, dimensions);

  try {
    const ai = getAIClient();
    const safeStatement =
      consentToAiProcessing && typeof personalStatement === 'string' && personalStatement.trim()
        ? personalStatement.trim().slice(0, 1500)
        : null;

    const languageNote =
      languageMode === 'tamil'
        ? 'Write your reflection primarily in clear, warm Tamil.'
        : languageMode === 'english'
          ? 'Write your reflection in clear, warm English.'
          : 'Write your reflection in clear, warm English (you may include a brief Tamil phrase where natural).';

    const promptPayload = {
      assessment_period: 'Past two weeks',
      deterministic_indicator: `${indicator}/10`,
      interpretation_band: interpretation,
      dimensions: dimensions.map((d) => ({
        name: d.label,
        score: `${d.score}/${d.maxScore}`,
        percentage: `${d.percentage}%`,
      })),
      optional_personal_statement: safeStatement || 'Not provided',
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a structured, empathetic reflection based strictly on the following self-reflection check-in data. Do NOT recalculate or change the indicator (${indicator}/10). ${languageNote}\n\nData:\n${JSON.stringify(promptPayload, null, 2)}`,
      config: {
        systemInstruction: SNAPSHOT_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: SNAPSHOT_REFLECTION_SCHEMA,
      },
    });

    const raw = (response.text ?? '').trim();
    const parsed = JSON.parse(raw);

    if (
      typeof parsed.summary !== 'string' ||
      !Array.isArray(parsed.dimension_insights) ||
      !Array.isArray(parsed.strengths_or_supportive_observations) ||
      !Array.isArray(parsed.recommendations) ||
      typeof parsed.professional_support_note !== 'string'
    ) {
      return res.json({ reflection: fallback });
    }

    return res.json({
      reflection: {
        ...parsed,
        source: 'gemini' as const,
      },
    });
  } catch (error) {
    console.error('Error in /api/snapshot-reflection (returning deterministic fallback):', error);
    return res.json({ reflection: fallback });
  }
});

// Institutional Enquiry Demonstration Endpoint
app.post('/api/institutional-enquiry', (req, res) => {
  const { institutionName, segment, contactName, role, estimatedUsers } = req.body as {
    institutionName?: string;
    segment?: string;
    contactName?: string;
    role?: string;
    estimatedUsers?: string;
  };

  if (!institutionName?.trim() || !contactName?.trim() || !segment?.trim()) {
    return res.status(400).json({
      error: 'Please provide your institution name, institutional segment, and contact name.',
    });
  }

  return res.json({
    received: true,
    mode: 'prototype_preview',
    summary: {
      institutionName: institutionName.trim(),
      segment: segment.trim(),
      contactName: contactName.trim(),
      role: role?.trim() || '',
      estimatedUsers: estimatedUsers?.trim() || '',
    },
    message:
      'Your institutional demo enquiry has been validated in this prototype preview. No external email or CRM integration is connected yet.',
  });
});

// --- Individual Premium, Auth, Entitlements & Payment Abstraction (Server-Side) ---

interface ServerUser {
  id: string;
  email: string;
  displayName?: string;
  institutionName?: string;
  createdAt: string;
}

interface ServerSubscription {
  id: string;
  userId: string;
  planId: 'premium_monthly' | 'premium_annual' | 'institutional';
  billingPeriod: 'monthly' | 'annual' | 'institutional';
  status: 'active' | 'cancelled' | 'expired' | 'none';
  provider: 'razorpay_demo' | 'razorpay' | 'institutional';
  amountInr: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

interface ServerTransaction {
  id: string;
  orderId: string;
  userId: string;
  amountInr: number;
  currency: 'INR';
  status: 'paid' | 'failed' | 'cancelled' | 'pending';
  mode: 'demonstration' | 'live';
  createdAt: string;
  planLabel: string;
}

const adminConfigState = {
  monthlyPriceInr: 199,
  annualPriceInr: 1499,
  freeJournalLimit: 5,
};

interface ServerUserCredentials {
  passwordHash: string;
  passwordSalt: string;
}

interface ServerUserPreferences {
  user_id: string;
  selected_goals: string[];
  preferred_support_methods: string[];
  preferred_language: 'bilingual' | 'english' | 'tamil';
  preferred_interaction_mode: 'typing' | 'voice' | 'both' | 'not_sure';
  onboarding_completed: boolean;
  updated_at: string;
}

const usersByEmail = new Map<string, ServerUser>();
const usersById = new Map<string, ServerUser>();
const credentialsByUserId = new Map<string, ServerUserCredentials>();
const sessionsByToken = new Map<string, { userId: string; createdAt: number }>();
const passwordResetTokens = new Map<string, { userId: string; expiresAt: number }>();
const preferencesByUserId = new Map<string, ServerUserPreferences>();
const subscriptionsByUserId = new Map<string, ServerSubscription>();
const transactionsByUserId = new Map<string, ServerTransaction[]>();
const processedOrderIds = new Set<string>();
const pendingOrders = new Map<
  string,
  { userId: string; billingPeriod: 'monthly' | 'annual'; amountInr: number; planLabel: string }
>();

function hashPassword(password: string, salt?: string) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash: derived, salt: actualSalt };
}

function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  const derived = crypto.scryptSync(password, storedSalt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

function createSessionToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessionsByToken.set(token, { userId, createdAt: Date.now() });
  return token;
}

function getAuthenticatedUser(req: express.Request): ServerUser | null {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const session = sessionsByToken.get(token);
  if (!session) return null;
  return usersById.get(session.userId) || null;
}

function getOrCreateDefaultPreferences(userId: string): ServerUserPreferences {
  const existing = preferencesByUserId.get(userId);
  if (existing) return existing;
  const defaults: ServerUserPreferences = {
    user_id: userId,
    selected_goals: [],
    preferred_support_methods: [],
    preferred_language: 'bilingual',
    preferred_interaction_mode: 'not_sure',
    onboarding_completed: false,
    updated_at: new Date().toISOString(),
  };
  preferencesByUserId.set(userId, defaults);
  return defaults;
}

function computeEntitlement(userId: string) {
  const user = usersById.get(userId);
  const sub = subscriptionsByUserId.get(userId) || null;
  const txns = transactionsByUserId.get(userId) || [];

  if (sub && sub.status === 'active') {
    const isExpired = new Date(sub.currentPeriodEnd).getTime() < Date.now();
    if (isExpired) {
      sub.status = 'expired';
    } else if (sub.provider === 'institutional') {
      return {
        source: 'institutional_sponsored' as const,
        hasPremiumAccess: true,
        subscription: sub,
        transactions: txns,
      };
    } else {
      return {
        source: 'individual_premium' as const,
        hasPremiumAccess: true,
        subscription: sub,
        transactions: txns,
      };
    }
  }

  if (user?.institutionName) {
    return {
      source: 'free' as const,
      hasPremiumAccess: false,
      subscription: sub,
      transactions: txns,
    };
  }

  return {
    source: 'free' as const,
    hasPremiumAccess: false,
    subscription: sub,
    transactions: txns,
  };
}

// Account Sign-In / Creation (supports optional institutional access code e.g. CAMPUS-DEMO)
app.post('/api/auth/session', (req, res) => {
  const { email, displayName, institutionCode } = req.body as {
    email?: string;
    displayName?: string;
    institutionCode?: string;
  };

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  let user = usersByEmail.get(normalizedEmail);
  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: normalizedEmail,
      displayName: displayName?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(normalizedEmail, user);
    usersById.set(user.id, user);
  } else if (displayName?.trim()) {
    user.displayName = displayName.trim();
  }

  // Optional institutional access code demonstration (never double-charges institutional users)
  if (institutionCode?.trim().toUpperCase() === 'CAMPUS-DEMO') {
    user.institutionName = 'Demo Partner University';
    const now = new Date();
    const end = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    subscriptionsByUserId.set(user.id, {
      id: `sub_inst_${user.id}`,
      userId: user.id,
      planId: 'institutional',
      billingPeriod: 'institutional',
      status: 'active',
      provider: 'institutional',
      amountInr: 0,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: end.toISOString(),
    });
  }

  return res.json({
    user,
    entitlement: computeEntitlement(user.id),
  });
});

// OAuth Provider Configuration Status (honest reporting — never simulates social auth)
app.get('/api/auth/providers', (_req, res) => {
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const facebookConfigured = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

  return res.json({
    providers: {
      google: {
        configured: googleConfigured,
        note: googleConfigured
          ? 'Google OAuth is configured.'
          : 'Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server environment.',
      },
      facebook: {
        configured: facebookConfigured,
        note: facebookConfigured
          ? 'Facebook OAuth is configured.'
          : 'Facebook OAuth requires FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in server environment.',
      },
      instagram: {
        configured: false,
        supported: false,
        note: 'Instagram login is not currently supported as an identity provider.',
      },
    },
  });
});

// Secure Account Registration (scrypt hashed password, never plain-text)
app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, password, confirmPassword, acceptedTerms } = req.body as {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: boolean;
  };

  const trimmedName = (fullName || '').trim();
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  if (!acceptedTerms) {
    return res.status(400).json({ error: 'Please accept the Terms and Privacy Policy to continue.' });
  }
  if (usersByEmail.has(normalizedEmail) && credentialsByUserId.has(usersByEmail.get(normalizedEmail)!.id)) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
  }

  let user = usersByEmail.get(normalizedEmail);
  if (!user) {
    user = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: normalizedEmail,
      displayName: trimmedName,
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(normalizedEmail, user);
    usersById.set(user.id, user);
  } else {
    user.displayName = trimmedName;
  }

  const { hash, salt } = hashPassword(password);
  credentialsByUserId.set(user.id, { passwordHash: hash, passwordSalt: salt });

  const token = createSessionToken(user.id);
  const preferences = getOrCreateDefaultPreferences(user.id);

  return res.status(201).json({
    token,
    user,
    entitlement: computeEntitlement(user.id),
    preferences,
  });
});

// Secure Sign-In
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Please enter your password.' });
  }

  const user = usersByEmail.get(normalizedEmail);
  const creds = user ? credentialsByUserId.get(user.id) : undefined;
  if (!user || !creds || !verifyPassword(password, creds.passwordHash, creds.passwordSalt)) {
    return res.status(401).json({ error: 'Invalid email address or password. Please try again.' });
  }

  const token = createSessionToken(user.id);
  const preferences = getOrCreateDefaultPreferences(user.id);

  return res.json({
    token,
    user,
    entitlement: computeEntitlement(user.id),
    preferences,
  });
});

// Restore Active Session
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'No active session.' });
  }
  return res.json({
    user,
    entitlement: computeEntitlement(user.id),
    preferences: getOrCreateDefaultPreferences(user.id),
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    sessionsByToken.delete(authHeader.slice(7).trim());
  }
  return res.json({ ok: true });
});

// Forgot Password (generates time-limited reset token)
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body as { email?: string };
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const user = usersByEmail.get(normalizedEmail);
  let demoResetCode: string | undefined;
  if (user) {
    const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase();
    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    demoResetCode = resetToken;
  }

  return res.json({
    ok: true,
    message:
      'If an account exists for that email, a password reset code has been generated. (SMTP email delivery is not configured in this environment, so you may use the verification code below to test resetting your password.)',
    demoResetCode,
  });
});

// Complete Password Reset
app.post('/api/auth/reset-password', (req, res) => {
  const { resetCode, newPassword } = req.body as { resetCode?: string; newPassword?: string };
  const code = (resetCode || '').trim().toUpperCase();
  if (!code || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Enter a valid reset code and a new password of at least 8 characters.' });
  }

  const record = passwordResetTokens.get(code);
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'This reset code is invalid or has expired.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  credentialsByUserId.set(record.userId, { passwordHash: hash, passwordSalt: salt });
  passwordResetTokens.delete(code);

  return res.json({ ok: true, message: 'Your password has been updated. You can now sign in.' });
});

// User Onboarding Preferences (Protected)
app.get('/api/preferences', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  return res.json({ preferences: getOrCreateDefaultPreferences(user.id) });
});

app.put('/api/preferences', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const body = req.body as Partial<ServerUserPreferences>;
  const current = getOrCreateDefaultPreferences(user.id);
  const updated: ServerUserPreferences = {
    user_id: user.id,
    selected_goals: Array.isArray(body.selected_goals) ? body.selected_goals.slice(0, 12) : current.selected_goals,
    preferred_support_methods: Array.isArray(body.preferred_support_methods)
      ? body.preferred_support_methods.slice(0, 10)
      : current.preferred_support_methods,
    preferred_language:
      body.preferred_language === 'english' ||
      body.preferred_language === 'tamil' ||
      body.preferred_language === 'bilingual'
        ? body.preferred_language
        : current.preferred_language,
    preferred_interaction_mode:
      body.preferred_interaction_mode === 'typing' ||
      body.preferred_interaction_mode === 'voice' ||
      body.preferred_interaction_mode === 'both' ||
      body.preferred_interaction_mode === 'not_sure'
        ? body.preferred_interaction_mode
        : current.preferred_interaction_mode,
    onboarding_completed:
      typeof body.onboarding_completed === 'boolean' ? body.onboarding_completed : current.onboarding_completed,
    updated_at: new Date().toISOString(),
  };

  preferencesByUserId.set(user.id, updated);
  return res.json({ preferences: updated });
});

app.get('/api/entitlements/:userId', (req, res) => {
  const { userId } = req.params;
  if (!usersById.has(userId)) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  return res.json({ entitlement: computeEntitlement(userId) });
});

// Razorpay-ready Payment Order Creation (with clearly labelled demonstration mode)
app.post('/api/payments/create-order', (req, res) => {
  const { userId, billingPeriod } = req.body as {
    userId?: string;
    billingPeriod?: 'monthly' | 'annual';
  };

  if (!userId || !usersById.has(userId)) {
    return res.status(401).json({ error: 'Please sign in before starting checkout.' });
  }
  if (billingPeriod !== 'monthly' && billingPeriod !== 'annual') {
    return res.status(400).json({ error: 'Invalid billing period.' });
  }

  const currentEntitlement = computeEntitlement(userId);
  if (currentEntitlement.hasPremiumAccess) {
    return res.status(409).json({
      error:
        currentEntitlement.source === 'institutional_sponsored'
          ? 'You already have active Institution-sponsored access and do not need to pay twice.'
          : 'You already have an active Premium subscription.',
    });
  }

  const amountInr =
    billingPeriod === 'annual' ? adminConfigState.annualPriceInr : adminConfigState.monthlyPriceInr;
  const planLabel = billingPeriod === 'annual' ? 'Premium Annual' : 'Premium Monthly';
  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const hasLiveRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  pendingOrders.set(orderId, { userId, billingPeriod, amountInr, planLabel });

  return res.json({
    orderId,
    amountInr,
    currency: 'INR',
    planLabel,
    provider: hasLiveRazorpay ? 'razorpay' : 'razorpay_demo',
    mode: hasLiveRazorpay ? 'live' : 'demonstration',
    notice: hasLiveRazorpay
      ? 'Live Razorpay checkout ready.'
      : 'Demonstration mode: Razorpay live credentials are not configured. No real payment will be charged.',
  });
});

// Server-Side Payment Verification & Idempotent Subscription Activation
app.post('/api/payments/verify', (req, res) => {
  const { orderId, outcome } = req.body as {
    orderId?: string;
    outcome?: 'paid' | 'failed' | 'cancelled';
  };

  if (!orderId || !pendingOrders.has(orderId)) {
    return res.status(400).json({ error: 'Invalid or expired payment order.' });
  }

  const order = pendingOrders.get(orderId)!;

  // Idempotency: prevent duplicate subscription activation for the same order
  if (processedOrderIds.has(orderId)) {
    return res.json({
      verified: true,
      duplicatePrevented: true,
      entitlement: computeEntitlement(order.userId),
    });
  }

  const finalStatus = outcome === 'paid' || outcome === 'failed' || outcome === 'cancelled' ? outcome : 'failed';
  processedOrderIds.add(orderId);

  const txn: ServerTransaction = {
    id: `txn_${Date.now()}`,
    orderId,
    userId: order.userId,
    amountInr: order.amountInr,
    currency: 'INR',
    status: finalStatus,
    mode: 'demonstration',
    createdAt: new Date().toISOString(),
    planLabel: order.planLabel,
  };

  const existingTxns = transactionsByUserId.get(order.userId) || [];
  transactionsByUserId.set(order.userId, [txn, ...existingTxns]);

  if (finalStatus !== 'paid') {
    return res.json({
      verified: false,
      status: finalStatus,
      entitlement: computeEntitlement(order.userId),
    });
  }

  const now = new Date();
  const days = order.billingPeriod === 'annual' ? 365 : 30;
  const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  subscriptionsByUserId.set(order.userId, {
    id: `sub_${Date.now()}`,
    userId: order.userId,
    planId: order.billingPeriod === 'annual' ? 'premium_annual' : 'premium_monthly',
    billingPeriod: order.billingPeriod,
    status: 'active',
    provider: 'razorpay_demo',
    amountInr: order.amountInr,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
  });

  return res.json({
    verified: true,
    status: 'paid',
    entitlement: computeEntitlement(order.userId),
  });
});

// Straightforward Subscription Cancellation
app.post('/api/subscriptions/cancel', (req, res) => {
  const { userId } = req.body as { userId?: string };
  if (!userId || !usersById.has(userId)) {
    return res.status(401).json({ error: 'Account not found.' });
  }
  const sub = subscriptionsByUserId.get(userId);
  if (!sub || sub.provider === 'institutional') {
    return res.status(400).json({ error: 'No active individual subscription to cancel.' });
  }

  sub.status = 'cancelled';
  subscriptionsByUserId.set(userId, sub);

  return res.json({
    cancelled: true,
    entitlement: computeEntitlement(userId),
  });
});

// Role-Protected Admin Configuration Endpoint
app.get('/api/admin/config', (_req, res) => {
  return res.json({ config: adminConfigState });
});

app.post('/api/admin/config', (req, res) => {
  const adminToken = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_CONFIG_TOKEN;
  if (!expectedToken || adminToken !== expectedToken) {
    return res.status(403).json({ error: 'Authorised administrator credentials required.' });
  }

  const { monthlyPriceInr, annualPriceInr, freeJournalLimit } = req.body as Partial<typeof adminConfigState>;
  if (typeof monthlyPriceInr === 'number' && monthlyPriceInr > 0) {
    adminConfigState.monthlyPriceInr = monthlyPriceInr;
  }
  if (typeof annualPriceInr === 'number' && annualPriceInr > 0) {
    adminConfigState.annualPriceInr = annualPriceInr;
  }
  if (typeof freeJournalLimit === 'number' && freeJournalLimit >= 1) {
    adminConfigState.freeJournalLimit = freeJournalLimit;
  }

  return res.json({ config: adminConfigState });
});

// Discovery & Support Guidance Gemini Reflection Endpoint (classification is fixed input, never overridden)
const DISCOVERY_REFLECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    empathetic_summary: { type: Type.STRING },
    pathway_explanation: { type: Type.STRING },
    suggested_next_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['empathetic_summary', 'pathway_explanation', 'suggested_next_steps'],
};

app.post('/api/discovery-guidance', async (req, res) => {
  const { responses, fixedGuidanceState, rationale, languageMode = 'bilingual' } = req.body as {
    responses?: Record<string, string | undefined>;
    fixedGuidanceState?: 'GREEN' | 'AMBER' | 'CLARIFY' | 'RED';
    rationale?: string;
    languageMode?: 'bilingual' | 'english' | 'tamil';
  };

  if (fixedGuidanceState === 'RED') {
    return res.json({
      guidanceReflection: {
        empathetic_summary:
          'Your immediate safety comes first. Ordinary self-help guidance is paused so you can connect directly with trusted human or emergency support.',
        pathway_explanation: rationale || 'Immediate safety support is prioritised.',
        suggested_next_steps: [
          'Reach out to a trusted person who can be physically with you right now.',
          'Call Tele-MANAS (14416) or your local emergency service immediately.',
        ],
        source: 'fallback',
      },
    });
  }

  const fallback = {
    empathetic_summary:
      'Thank you for taking a quiet moment to explore what you have been experiencing. Even when feelings are hard to describe, pausing to check in is a gentle, constructive step.',
    pathway_explanation:
      rationale ||
      'This pathway was suggested based on your discovery responses to help you explore practical next steps at your own pace.',
    suggested_next_steps: [
      'Continue with a calm FirstStep Reflection conversation in English or Tamil.',
      'Try the free 8-question Well-being Snapshot or browse the Self-Help Resource Library.',
      'Explore qualified professional support pathways whenever additional human guidance feels helpful.',
    ],
    source: 'fallback' as const,
  };

  try {
    const ai = getAIClient();
    const langHint =
      languageMode === 'tamil'
        ? 'Write primarily in warm, clear Tamil.'
        : languageMode === 'english'
          ? 'Write in warm, clear English.'
          : 'Write in warm, clear English (you may include a brief, natural Tamil phrase if helpful).';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `A user completed FirstStep Discovery. The independent Support Guidance Engine assigned the FIXED state: "${fixedGuidanceState}". Do NOT change, override, or reclassify this state. Do NOT diagnose, prescribe, or claim clinical certainty. ${langHint}\n\nDiscovery Responses:\n${JSON.stringify(responses || {}, null, 2)}\n\nEngine Rationale: ${rationale || ''}`,
      config: {
        systemInstruction:
          'You are FirstStep Discovery assistant. Summarise the user responses empathetically, explain the fixed support pathway in simple non-clinical language, and offer 2-3 practical next steps. Never diagnose, never prescribe, never override the fixed guidance state, and never claim GREEN means someone is healthy or risk-free.',
        responseMimeType: 'application/json',
        responseSchema: DISCOVERY_REFLECTION_SCHEMA,
      },
    });

    const parsed = JSON.parse((response.text ?? '').trim());
    if (
      typeof parsed.empathetic_summary !== 'string' ||
      typeof parsed.pathway_explanation !== 'string' ||
      !Array.isArray(parsed.suggested_next_steps)
    ) {
      return res.json({ guidanceReflection: fallback });
    }

    return res.json({
      guidanceReflection: {
        ...parsed,
        source: 'gemini' as const,
      },
    });
  } catch (error) {
    console.error('Error in /api/discovery-guidance (returning fallback):', error);
    return res.json({ guidanceReflection: fallback });
  }
});

// Ensure unknown /api/* requests always return JSON 404 (never HTML SPA fallback)
app.all('/api/*', (_req, res) => {
  return res.status(404).json({ error: 'API endpoint not found.' });
});

// Express JSON error middleware so malformed payloads or server errors on /api/* never return HTML
app.use(
  (
    err: { status?: number; type?: string; message?: string },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (res.headersSent) {
      return next(err);
    }
    if (req.path.startsWith('/api/')) {
      if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON request payload.' });
      }
      if (err?.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Request payload is too large.' });
      }
      const status = typeof err?.status === 'number' && err.status >= 400 ? err.status : 500;
      console.error(`Unhandled API error on ${req.method} ${req.path}:`, err);
      return res.status(status).json({
        error: status >= 500 ? 'Internal server error. Please try again.' : err?.message || 'Request failed.',
      });
    }
    return next(err);
  },
);

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FirstStep server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
