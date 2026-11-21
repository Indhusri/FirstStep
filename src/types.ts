export type RiskLevel = 'GREEN' | 'AMBER' | 'RED';

export type LanguageMode = 'bilingual' | 'english' | 'tamil';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCrisis?: boolean;
}

export interface BilingualText {
  english: string;
  tamil: string;
}

export interface LiteraryReflection {
  english_phrase: string;
  tamil_phrase: string;
  source_or_tradition: string;
  meaning_context: string;
}

export interface BookRecommendation {
  title_english: string;
  title_tamil: string;
  author: string;
  language?: 'English' | 'Tamil' | 'Bilingual';
  why_it_helps: string;
}

export interface ImmediateRelief {
  title: string;
  type: 'breathing' | 'grounding' | 'journaling' | 'stretching';
  duration_minutes: number;
  instructions: string;
}

export interface PracticalStep {
  action_title: string;
  coping_script_or_tip: string;
}

export interface HumanConnection {
  recommend_human_care: boolean;
  cta_text: string;
}

export interface CrisisHelpline {
  name: string;
  contact: string;
  availability: string;
}

export interface CrisisResources {
  is_active: boolean;
  helplines: CrisisHelpline[];
}

export interface NextStepCard {
  id?: string;
  createdAt?: string;
  promptSummary?: string;
  risk_level: RiskLevel;
  empathetic_reflection: BilingualText;
  emotional_snapshot: BilingualText;
  literary_reflection?: LiteraryReflection;
  book_recommendation?: BookRecommendation;
  immediate_relief: ImmediateRelief;
  practical_step: PracticalStep;
  human_connection: HumanConnection;
  crisis_resources?: CrisisResources;
}

// Well-being Snapshot Types
export type SnapshotDimensionKey =
  | 'stress'
  | 'emotional_balance'
  | 'daily_functioning'
  | 'social_connection';

export type SnapshotAnswerValue = 0 | 1 | 2 | 3;

export interface SnapshotQuestion {
  id: number;
  dimension: SnapshotDimensionKey;
  dimensionLabel: BilingualText;
  text: BilingualText;
}

export interface SnapshotDimensionResult {
  key: SnapshotDimensionKey;
  label: BilingualText;
  score: number; // 0 to 6
  maxScore: 6;
  percentage: number; // 0 to 100
}

export interface SnapshotScoreResult {
  totalScore: number; // 0 to 24
  maxTotalScore: 24;
  indicator: number; // 1 to 10
  interpretation: BilingualText;
  dimensions: SnapshotDimensionResult[];
}

export type SafetyCheckState = 'none' | 'check_in' | 'immediate_concern';

export interface SafetyAssessment {
  state: SafetyCheckState;
  triggeredByRule: boolean;
  message: BilingualText;
}

export interface SnapshotGeminiReflection {
  summary: string;
  dimension_insights: string[];
  strengths_or_supportive_observations: string[];
  recommendations: string[];
  professional_support_note: string;
  safety_state: 'none' | 'supportive_check' | 'urgent_guidance';
  source: 'gemini' | 'fallback';
}

// Individual Premium & Entitlement Types
export type EntitlementSource = 'free' | 'individual_premium' | 'institutional_sponsored';
export type BillingPeriod = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'none';

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  institutionName?: string;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: 'premium_monthly' | 'premium_annual' | 'institutional';
  billingPeriod: BillingPeriod | 'institutional';
  status: SubscriptionStatus;
  provider: 'razorpay_demo' | 'razorpay' | 'institutional';
  amountInr: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  amountInr: number;
  currency: 'INR';
  status: 'paid' | 'failed' | 'cancelled' | 'pending';
  mode: 'demonstration' | 'live';
  createdAt: string;
  planLabel: string;
}

export interface UserEntitlement {
  source: EntitlementSource;
  hasPremiumAccess: boolean;
  subscription: SubscriptionRecord | null;
  transactions: PaymentTransaction[];
}

export type JournalCategory =
  | 'My thoughts'
  | 'What I am grateful for'
  | 'What challenged me today'
  | 'Things I want to understand'
  | 'Personal achievements'
  | 'Reflections for tomorrow';

export interface PersonalJournalEntry {
  id: string;
  title: string;
  content: string;
  category: JournalCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedSnapshotHistoryItem {
  id: string;
  date: string;
  indicator: number;
  interpretation: string;
  contextNote?: string;
}

export interface ReminderPreferences {
  enabled: boolean;
  dailyReflection: boolean;
  weeklyCheckIn: boolean;
  journalReminder: boolean;
  programmeReminder: boolean;
  frequency: 'daily' | 'weekdays' | 'weekly';
  preferredTime: string;
}

export type InteractionModePreference = 'typing' | 'voice' | 'both' | 'not_sure';

export interface OnboardingPreferences {
  user_id?: string;
  selected_goals: string[];
  preferred_support_methods: string[];
  preferred_language: LanguageMode;
  preferred_interaction_mode: InteractionModePreference;
  onboarding_completed: boolean;
  updated_at: string;
}

export interface AuthProviderStatus {
  google: { configured: boolean; note: string };
  facebook: { configured: boolean; note: string };
  instagram: { configured: boolean; supported: boolean; note: string };
}

