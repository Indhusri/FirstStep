import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, Compass, Loader2, AlertCircle, Mic, MicOff, Menu, X } from 'lucide-react';
import {
  ChatMessage,
  LanguageMode,
  NextStepCard,
  OnboardingPreferences,
  PersonalJournalEntry,
  ReminderPreferences,
  SavedSnapshotHistoryItem,
  UserEntitlement,
  UserProfile,
} from './types';
import { EclipseOrb } from './components/EclipseOrb';
import { NextStepCardView } from './components/NextStepCardView';
import { JournalView } from './components/JournalView';
import { WellBeingSnapshot } from './components/WellBeingSnapshot';
import { SelfHelpResources } from './components/SelfHelpResources';
import { InstitutionalPage } from './components/InstitutionalPage';
import { PremiumPage } from './components/PremiumPage';
import { MyJourneyDashboard } from './components/MyJourneyDashboard';
import { DiscoveryFlow } from './components/DiscoveryFlow';
import { LivingWelcome } from './components/LivingWelcome';
import { LineThatFoundYouCard, WordsThatUnderstand } from './components/WordsThatUnderstand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  auth,
  loadUserPreferencesFromFirestore,
  syncUserProfileToFirestore,
} from './firebase';
import { CelestialDust } from './components/CelestialDust';
import { OnboardingFlow, OnboardingStage } from './components/OnboardingFlow';
import { OfflineIndicator, PWAInstallButton } from './components/PWAControls';
import {
  getApprovedLiteraryEntries,
  selectLivingWelcomeForVisit,
} from './data/literaryCollection';
import { postJson } from './utils/apiClient';

type ActiveView =
  | 'sanctuary'
  | 'discovery'
  | 'snapshot'
  | 'reflect'
  | 'next-step'
  | 'resources'
  | 'words'
  | 'journal'
  | 'journey'
  | 'premium'
  | 'institutions';

const STORAGE_KEY = 'firststep_saved_reflections_v1';

const QUICK_PROMPTS = [
  {
    label: 'Feeling disconnected',
    text: "I feel so disconnected lately. Everyone is busy with work, and I feel like I'm floating in my own world.",
  },
  {
    label: 'Quiet burnout',
    text: 'I have been pushing through deadlines for weeks and now even small tasks feel heavy and exhausting.',
  },
  {
    label: 'Restless mind at night',
    text: 'My thoughts keep racing whenever the day slows down and I cannot seem to settle into calm.',
  },
];

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('sanctuary');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('bilingual');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<NextStepCard | null>(null);
  const [resourceCategoryId, setResourceCategoryId] = useState<string | undefined>(undefined);
  const [isListening, setIsListening] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stable per-visit Living Welcome & rotatable classical excerpt
  const [livingWelcomeEntry] = useState(() => selectLivingWelcomeForVisit());
  const [classicalPool] = useState(() => {
    const classical = getApprovedLiteraryEntries().filter((e) => e.kind === 'classical_excerpt');
    const distinct = classical.filter((e) => e.id !== livingWelcomeEntry.id);
    return distinct.length > 0 ? distinct : classical;
  });
  const [featuredLineIndex, setFeaturedLineIndex] = useState(() => {
    if (classicalPool.length <= 1) return 0;
    try {
      const lastFeaturedId = localStorage.getItem('firststep_last_featured_line_v1');
      const candidates = classicalPool
        .map((e, idx) => ({ id: e.id, idx }))
        .filter((item) => item.id !== lastFeaturedId);
      const picked = candidates[Math.floor(Math.random() * candidates.length)] || { idx: 0, id: classicalPool[0].id };
      localStorage.setItem('firststep_last_featured_line_v1', picked.id);
      return picked.idx;
    } catch {
      return Math.floor(Math.random() * classicalPool.length);
    }
  });
  const featuredLineEntry = classicalPool[featuredLineIndex] || livingWelcomeEntry;
  const [savedCards, setSavedCards] = useState<NextStepCard[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Authentication & Three-Stage Onboarding State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('firststep_auth_token_v1');
    } catch {
      return null;
    }
  });
  const [onboardingPreferences, setOnboardingPreferences] = useState<OnboardingPreferences>(() => {
    try {
      const raw = sessionStorage.getItem('firststep_guest_prefs_v1');
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore storage errors
    }
    return {
      selected_goals: [],
      preferred_support_methods: [],
      preferred_language: 'bilingual',
      preferred_interaction_mode: 'not_sure',
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    };
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const hasToken = Boolean(localStorage.getItem('firststep_auth_token_v1'));
      const guestCompleted = sessionStorage.getItem('firststep_guest_onboarding_done_v1') === 'true';
      return !hasToken && !guestCompleted;
    } catch {
      return true;
    }
  });
  const [onboardingInitialStage, setOnboardingInitialStage] = useState<OnboardingStage>('auth');

  // Individual Premium, Account, Journal & Journey State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entitlement, setEntitlement] = useState<UserEntitlement>({
    source: 'free',
    hasPremiumAccess: false,
    subscription: null,
    transactions: [],
  });
  const [journalEntries, setJournalEntries] = useState<PersonalJournalEntry[]>(() => {
    try {
      const raw = localStorage.getItem('firststep_personal_journal_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Manage everyday stress']);
  const [programmeProgress, setProgrammeProgress] = useState<Record<string, number>>({});
  const [snapshotHistory] = useState<SavedSnapshotHistoryItem[]>([]);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [reminders, setReminders] = useState<ReminderPreferences>({
    enabled: false,
    dailyReflection: true,
    weeklyCheckIn: true,
    journalReminder: false,
    programmeReminder: true,
    frequency: 'daily',
    preferredTime: '20:30',
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef<string>('');

  // Restore persistent Firebase Authentication session & Firestore preferences
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthToken(null);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const profile = await syncUserProfileToFirestore(firebaseUser);
        const prefs = await loadUserPreferencesFromFirestore(firebaseUser.uid);

        setAuthToken(idToken);
        setUser(profile);
        setOnboardingPreferences(prefs);
        setLanguageMode(prefs.preferred_language || 'bilingual');
        if (prefs.selected_goals.length > 0) {
          setSelectedGoals(prefs.selected_goals);
        }
        setShowOnboarding(!prefs.onboarding_completed);
      } catch {
        // Keep current UI responsive if offline
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (payload: {
    token: string;
    user: UserProfile;
    entitlement: UserEntitlement;
    preferences: OnboardingPreferences;
  }) => {
    setAuthToken(payload.token);
    setUser(payload.user);
    setEntitlement(payload.entitlement);
    setOnboardingPreferences(payload.preferences);
    if (payload.preferences.preferred_language) {
      setLanguageMode(payload.preferences.preferred_language);
    }
    if (payload.preferences.selected_goals.length > 0) {
      setSelectedGoals(payload.preferences.selected_goals);
    }
  };

  const handleCompleteOnboarding = (prefs: OnboardingPreferences, isGuest: boolean) => {
    setOnboardingPreferences(prefs);
    setLanguageMode(prefs.preferred_language);
    if (prefs.selected_goals.length > 0) {
      setSelectedGoals(prefs.selected_goals);
    }
    if (isGuest) {
      try {
        sessionStorage.setItem('firststep_guest_prefs_v1', JSON.stringify(prefs));
        sessionStorage.setItem('firststep_guest_onboarding_done_v1', 'true');
      } catch {
        // Ignore storage errors
      }
    }
    setShowOnboarding(false);
    setActiveView('sanctuary');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    setUser(null);
    setEntitlement({
      source: 'free',
      hasPremiumAccess: false,
      subscription: null,
      transactions: [],
    });
    try {
      localStorage.removeItem('firststep_auth_token_v1');
      sessionStorage.removeItem('firststep_guest_onboarding_done_v1');
    } catch {
      // Ignore
    }
    setOnboardingInitialStage('auth');
    setShowOnboarding(true);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCards));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedCards]);

  useEffect(() => {
    try {
      localStorage.setItem('firststep_personal_journal_v1', JSON.stringify(journalEntries));
    } catch {
      // Ignore storage quota errors
    }
  }, [journalEntries]);

  useEffect(() => {
    if (activeView === 'reflect') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, activeView]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore stop errors on unmount
        }
      }
    };
  }, []);

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
      return;
    }

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setErrorBanner('Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    setErrorBanner(null);
    baseInputRef.current = inputText.trim();

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageMode === 'tamil' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        const prefix = baseInputRef.current ? `${baseInputRef.current} ` : '';
        setInputText(`${prefix}${transcript.trimStart()}`);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorBanner('Microphone access was denied. Please allow microphone permission to use voice input.');
        } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
          setErrorBanner('Voice recognition encountered an issue. Please try again.');
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
      setErrorBanner('Could not start voice input. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const handleStartNewReflection = () => {
    setMessages([]);
    setCurrentCard(null);
    setErrorBanner(null);
    setInputText('');
    setActiveView('reflect');
  };

  const sendMessage = async (textOverride?: string) => {
    if (isListening) {
      stopVoiceInput();
    }
    const trimmed = (textOverride ?? inputText).trim();
    if (!trimmed || isSending) return;

    setErrorBanner(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setActiveView('reflect');
    setIsSending(true);

    try {
      const data = await postJson<{ reply?: string; isCrisis?: boolean }>(
        '/api/chat',
        {
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          languageMode,
        },
        { timeoutMs: 45000 },
      );

      if (typeof data?.reply !== 'string' || !data.reply.trim()) {
        throw new Error('FirstStep returned an empty response. Please try again.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisis: Boolean(data.isCrisis),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateNextStep = async () => {
    if (messages.length === 0 || isGeneratingCard) return;
    setErrorBanner(null);
    setIsGeneratingCard(true);

    try {
      const data = await postJson<{ card?: NextStepCard }>(
        '/api/next-step',
        {
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          languageMode,
        },
        { timeoutMs: 55000 },
      );

      if (
        !data?.card ||
        !data.card.empathetic_reflection?.english ||
        !data.card.emotional_snapshot?.english
      ) {
        throw new Error(
          'FirstStep received an incomplete Next Step Card. Please try generating it again.',
        );
      }

      const cardWithMeta: NextStepCard = {
        ...data.card,
        id: `card-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setCurrentCard(cardWithMeta);
      setActiveView('next-step');
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Unable to generate your Next Step Card right now. Please try again.',
      );
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleSaveCard = (card: NextStepCard) => {
    if (!card.id || card.risk_level === 'RED') return;
    setSavedCards((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev;
      return [card, ...prev];
    });
  };

  const handleDeleteCard = (id: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
  };

  const isCurrentCardSaved = Boolean(
    currentCard?.id && savedCards.some((c) => c.id === currentCard.id),
  );

  if (showOnboarding) {
    return (
      <div className="relative min-h-screen bg-[#090A0E] text-white overflow-x-hidden">
        <CelestialDust />
        <OnboardingFlow
          initialStage={onboardingInitialStage}
          initialPreferences={onboardingPreferences}
          user={user}
          authToken={authToken}
          onAuthSuccess={handleAuthSuccess}
          onCompleteOnboarding={handleCompleteOnboarding}
          onContinueAsGuest={(prefs) => handleCompleteOnboarding(prefs, true)}
        />
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#040507] text-[#e2e2ea] flex flex-col overflow-x-hidden">
      <CelestialDust />
      <OfflineIndicator />
      {/* Refined Full-Width 3-Zone Top Navigation Bar with Collapsible Menu */}
      <header className="sticky top-0 z-40 w-full bg-[#040507]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 h-16 lg:h-[72px] flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveView('sanctuary');
              setMobileMenuOpen(false);
            }}
            className="text-lg lg:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            FirstStep
          </button>

          {/* Zone 2: Spacious horizontal navigation on wide desktop */}
          <nav className="hidden xl:flex items-center gap-6 2xl:gap-7 text-[13.5px] font-medium text-[#DDC1B3]/80">
            <button
              type="button"
              onClick={() => setActiveView('sanctuary')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'sanctuary' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Sanctuary
            </button>
            <button
              type="button"
              onClick={() => setActiveView('discovery')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'discovery' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Discovery
            </button>
            <button
              type="button"
              onClick={() => setActiveView('snapshot')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'snapshot' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Snapshot
            </button>
            <button
              type="button"
              onClick={() => setActiveView('reflect')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'reflect' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Reflect
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentCard) {
                  setActiveView('next-step');
                } else {
                  setResourceCategoryId(undefined);
                  setActiveView('resources');
                }
              }}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'next-step' || activeView === 'resources'
                  ? 'text-white'
                  : 'hover:text-white'
              }`}
            >
              Next Step
            </button>
            <button
              type="button"
              onClick={() => setActiveView('journal')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'journal' ? 'text-white' : 'hover:text-white'
              }`}
            >
              Journal
            </button>
            <button
              type="button"
              onClick={() => setActiveView('journey')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'journey' ? 'text-white' : 'hover:text-white'
              }`}
            >
              My Journey
            </button>
            <button
              type="button"
              onClick={() => setActiveView('premium')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'premium' ? 'text-[#FFB68D]' : 'text-[#FFB68D]/85 hover:text-[#FFB68D]'
              }`}
            >
              {entitlement.hasPremiumAccess ? 'Membership' : 'Premium'}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('institutions')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'institutions' ? 'text-white' : 'hover:text-white'
              }`}
            >
              For Institutions
            </button>
          </nav>

          {/* Zone 3: Primary action, account controls & collapsible menu button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => {
                setOnboardingInitialStage(user ? 'personalise' : 'auth');
                setShowOnboarding(true);
              }}
              className="hidden sm:inline-flex items-center min-h-[38px] px-3.5 py-1.5 rounded-full border border-white/12 bg-white/[0.03] text-xs font-medium text-white/80 hover:text-white hover:bg-white/[0.07] transition cursor-pointer whitespace-nowrap"
            >
              {user ? 'Preferences' : 'Sign In'}
            </button>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center min-h-[38px] px-2.5 py-1.5 rounded-full text-xs text-white/55 hover:text-white transition cursor-pointer whitespace-nowrap"
              >
                Sign Out
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleStartNewReflection();
              }}
              className="eclipse-button-primary min-h-[40px] px-4 sm:px-5 py-2 rounded-full text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              New Reflection
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="xl:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/12 bg-white/[0.04] text-white/85 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Navigation Drawer for Tablet & Mobile */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-white/[0.06] bg-[#08090D]/95 backdrop-blur-xl px-4 py-4">
            <nav className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {[
                { id: 'sanctuary' as const, label: 'Sanctuary' },
                { id: 'discovery' as const, label: 'Discovery' },
                { id: 'snapshot' as const, label: 'Snapshot' },
                { id: 'reflect' as const, label: 'Reflect' },
                { id: 'resources' as const, label: 'Next Step' },
                { id: 'journal' as const, label: 'Journal' },
                { id: 'journey' as const, label: 'My Journey' },
                { id: 'premium' as const, label: entitlement.hasPremiumAccess ? 'Membership' : 'Premium' },
                { id: 'institutions' as const, label: 'For Institutions' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'resources' && currentCard) {
                      setActiveView('next-step');
                    } else {
                      if (item.id === 'resources') setResourceCategoryId(undefined);
                      setActiveView(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-medium transition ${
                    activeView === item.id
                      ? 'bg-[#FF8A3D]/15 text-[#FFB68D] border border-[#FF8A3D]/30'
                      : 'text-[#DDC1B3]/85 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="sm:hidden mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOnboardingInitialStage(user ? 'personalise' : 'auth');
                  setShowOnboarding(true);
                }}
                className="flex-1 min-h-[42px] rounded-full border border-white/12 bg-white/[0.04] text-xs font-medium text-white/85"
              >
                {user ? 'Preferences' : 'Sign In'}
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="min-h-[42px] px-4 rounded-full border border-white/10 text-xs text-white/65"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pb-24 md:pb-16">
        {/* VIEW 1: SANCTUARY WELCOME */}
        {activeView === 'sanctuary' && (
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12 lg:py-16">
            {/* FULL-WIDTH WEB HERO ON DESKTOP, CENTERED MOBILE APP HERO ON MOBILE */}
            <section className="relative w-full grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-10 lg:gap-12 pt-2 pb-12 sm:pt-4 sm:pb-16 lg:py-12">
              {/* Left Column on Desktop (Text, Language Selector, Primary CTA) */}
              <div className="lg:col-span-7 text-center lg:text-left">
                {/* 1. Bilingual Emotional Companion Label */}
                <p className="text-xs sm:text-[13px] font-medium text-[#FFB68D] tracking-[0.06em] uppercase mb-4">
                  Bilingual Emotional Companion · English &amp; தமிழ்
                </p>

                {/* 2. Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[64px] font-bold text-white tracking-[-0.025em] leading-[1.08] eclipse-title-glow mb-6 max-w-3xl mx-auto lg:mx-0 [text-wrap:balance]">
                  Untangle heavy thoughts with calm clarity.
                </h1>

                {/* 3. Supporting Description */}
                <p className="text-[15px] sm:text-lg lg:text-[19px] text-[#DDC1B3]/90 leading-[1.7] max-w-2xl mx-auto lg:mx-0 mb-8 lg:mb-10">
                  Share what is on your mind in everyday language. FirstStep listens without clinical jargon, reflects your emotions alongside Tamil Sangam poetry and bibliotherapy, and offers one grounded next step.
                </p>

                {/* 4. Cohesive Action Area: Language Selector + Primary CTA */}
                <div className="flex flex-col items-center lg:items-start gap-5">
                  <div
                    role="group"
                    aria-label="Language preference"
                    className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1 p-1 rounded-full bg-[#111319]/90 border border-white/10 max-w-full"
                  >
                    {(['bilingual', 'english', 'tamil'] as LanguageMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLanguageMode(mode)}
                        className={`min-h-[40px] px-3.5 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          languageMode === mode
                            ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/40'
                            : 'text-[#94A3B8] hover:text-white border border-transparent'
                        }`}
                      >
                        {mode === 'bilingual'
                          ? 'Bilingual (EN · தமிழ்)'
                          : mode === 'english'
                            ? 'English'
                            : 'தமிழ்'}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveView('reflect')}
                      className="min-h-[50px] px-9 sm:px-10 py-3.5 rounded-full text-sm sm:text-[15px] font-semibold text-white inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer transition hover:brightness-110 active:scale-[0.99]"
                      style={{
                        background: 'linear-gradient(135deg, #E86F2C 0%, #C9531B 100%)',
                        border: '1px solid rgba(255, 198, 140, 0.45)',
                        boxShadow: '0 8px 24px rgba(232, 111, 44, 0.28)',
                      }}
                    >
                      <span>Begin Reflection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {savedCards.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveView('journal')}
                        className="eclipse-button-ghost min-h-[50px] px-6 py-3 rounded-full text-sm font-medium text-[#DDC1B3] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Open Journal ({savedCards.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column on Desktop (Signature Glowing Eclipse Orb + Permanent Tamil Brand Line) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <EclipseOrb size="hero" />
                <div className="mt-6 sm:mt-7 text-center space-y-1.5">
                  {(languageMode === 'bilingual' || languageMode === 'tamil') && (
                    <p className="font-tamil text-lg sm:text-xl lg:text-[22px] font-medium text-[#FFB68D] tracking-wide">
                      மனதின் மொழி புரியும் இடம்
                    </p>
                  )}
                  {(languageMode === 'bilingual' || languageMode === 'english') && (
                    <p
                      className={
                        languageMode === 'english'
                          ? 'text-sm sm:text-base lg:text-lg font-medium text-[#FFB68D]/95 tracking-wide'
                          : 'text-xs sm:text-sm text-[#D1A98E]/90 tracking-wide'
                      }
                    >
                      Where the language of the heart is understood.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* FEATURED LITERARY SECTION IMMEDIATELY BELOW HERO */}
            <div className="mt-2">
              <LivingWelcome
                entry={livingWelcomeEntry}
                languageMode={languageMode}
                onExploreAnthology={() => setActiveView('words')}
              />
            </div>

            {/* EXISTING FAMILIAR-FEELING PROMPTS */}
            <section className="mt-10 text-center">
              <p className="text-xs text-[#94A3B8] mb-3.5">Or start from a familiar feeling:</p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {QUICK_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendMessage(item.text)}
                    className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-[#e2e2ea] hover:text-white cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Prominent Discovery & Well-being Snapshot Full-Width 2-Column Grid on Desktop */}
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="eclipse-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-medium text-[#FFB68D] mb-2">
                    FirstStep Discovery &amp; Support Guidance · Free · No Sign-In Required
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2.5">
                    Not sure what you&apos;re going through?
                  </h2>
                  <p className="text-sm sm:text-base text-[#DDC1B3]/90 leading-relaxed">
                    You don&apos;t need to have the right words. Let&apos;s take a moment to understand what you might be experiencing.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView('discovery')}
                    className="eclipse-button-primary min-h-[48px] px-7 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Begin Discovery</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>

              <section className="eclipse-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-medium text-[#FFB68D] mb-2">
                    Self-Reflection Check-In · English &amp; தமிழ்
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2.5">
                    Your Well-being Snapshot
                  </h2>
                  <p className="text-sm sm:text-base text-[#DDC1B3]/90 leading-relaxed mb-3">
                    Not sure where to begin? Start with a few simple questions about how you have been feeling. Receive a personalised reflection and suggestions for your next step.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Takes approximately 3–5 minutes · Free · No sign-in required
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView('snapshot')}
                    className="eclipse-button-primary min-h-[48px] px-7 py-3 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <span>Start Free Snapshot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>

            {/* A Line That Found You — Curated Tamil Literary Excerpt */}
            <LineThatFoundYouCard
              entry={featuredLineEntry}
              languageMode={languageMode}
              onReadMore={() => setActiveView('words')}
              onNextLine={() => {
                const nextIdx = (featuredLineIndex + 1) % classicalPool.length;
                setFeaturedLineIndex(nextIdx);
                try {
                  localStorage.setItem('firststep_last_featured_line_v1', classicalPool[nextIdx].id);
                } catch {
                  // ignore
                }
              }}
            />

            {/* Quiet Non-Clinical Boundary Footer Note */}
            <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
              <p>
                FirstStep is an AI emotional companion — not a medical, clinical, or emergency therapy service.
              </p>
              <div className="flex flex-wrap items-center gap-5 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('premium')}
                  className="text-[#DDC1B3] hover:text-white transition-colors cursor-pointer"
                >
                  FirstStep Premium
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('institutions')}
                  className="text-[#DDC1B3] hover:text-white transition-colors cursor-pointer"
                >
                  For Institutions
                </button>
                <a
                  href="tel:14416"
                  className="text-[#FFB68D] hover:underline whitespace-nowrap shrink-0"
                >
                  Crisis Support: Tele-MANAS 14416
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1A: FIRSTSTEP DISCOVERY & SUPPORT GUIDANCE */}
        {activeView === 'discovery' && (
          <DiscoveryFlow
            languageMode={languageMode}
            onStartReflection={() => setActiveView('reflect')}
            onTakeSnapshot={() => setActiveView('snapshot')}
            onExploreResources={() => {
              setResourceCategoryId(undefined);
              setActiveView('resources');
            }}
            onFindProfessionalSupport={() => {
              setResourceCategoryId('professional-support');
              setActiveView('resources');
            }}
            onOpenJournal={() => setActiveView('journal')}
            onOpenJourney={() => setActiveView('journey')}
            onExit={() => setActiveView('sanctuary')}
          />
        )}

        {/* VIEW 1B: WELL-BEING SNAPSHOT */}
        {activeView === 'snapshot' && (
          <WellBeingSnapshot
            languageMode={languageMode}
            onChangeLanguage={setLanguageMode}
            onExploreResources={() => {
              setResourceCategoryId(undefined);
              setActiveView('resources');
            }}
            onStartConversation={() => setActiveView('reflect')}
            onFindProfessionalSupport={() => {
              setResourceCategoryId('professional-support');
              setActiveView('resources');
            }}
            onExitToSanctuary={() => setActiveView('sanctuary')}
          />
        )}

        {/* VIEW 3B: SELF-HELP RESOURCE LIBRARY */}
        {activeView === 'resources' && (
          <SelfHelpResources
            languageMode={languageMode}
            initialCategoryId={resourceCategoryId}
            onStartConversation={() => setActiveView('reflect')}
            onStartSnapshot={() => setActiveView('snapshot')}
          />
        )}

        {/* VIEW 3C: WORDS THAT UNDERSTAND ANTHOLOGY */}
        {activeView === 'words' && (
          <WordsThatUnderstand
            languageMode={languageMode}
            onStartReflection={() => setActiveView('reflect')}
            onBeginDiscovery={() => setActiveView('discovery')}
          />
        )}

        {/* VIEW 5: FOR INSTITUTIONS */}
        {activeView === 'institutions' && (
          <InstitutionalPage onTrySnapshot={() => setActiveView('snapshot')} />
        )}

        {/* VIEW 2: CONVERSATIONAL REFLECTION (PHASES 1 & 2) */}
        {activeView === 'reflect' && (
          <div className="max-w-3xl mx-auto px-5 py-8 sm:py-10 flex flex-col min-h-[calc(100vh-8rem)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-[#FFB68D] font-medium">
                  Phase 1 & 2 · Listen & Clarify
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                  What is weighing on you today?
                </h1>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleGenerateNextStep}
                  disabled={isGeneratingCard || isSending}
                  className="eclipse-button-primary min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingCard ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Compass className="w-4 h-4" />
                  )}
                  <span>
                    {isGeneratingCard ? 'Crafting Next Step...' : 'Generate Next Step Card'}
                  </span>
                </button>
              )}
            </div>

            {errorBanner && (
              <div
                role="alert"
                className="mb-5 rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/35 px-4 py-3 text-sm text-[#ffdad6] flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#ffb4ab]" />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Chat Feed */}
            <div className="flex-1 space-y-5 mb-6">
              {messages.length === 0 ? (
                <div className="eclipse-card rounded-3xl p-8 text-center my-6">
                  <EclipseOrb size="sm" className="mx-auto mb-5" />
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Take a slow breath. Speak freely.
                  </h2>
                  <p className="text-sm text-[#D1A98E] max-w-md mx-auto leading-relaxed mb-6">
                    You can write in English, Tamil, or both. When you are ready, tap “Generate Next Step Card” for bilingual Sangam poetry, a curated book, and a 2-minute relief exercise.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {QUICK_PROMPTS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => sendMessage(item.text)}
                        className="eclipse-button-ghost min-h-[40px] px-4 py-2 rounded-full text-xs font-medium text-[#e2e2ea] cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-3xl px-5 py-4 ${
                        msg.role === 'user'
                          ? 'bg-[#1d2025] border border-white/10 text-white'
                          : msg.isCrisis
                            ? 'bg-[#191215] border border-[#ffb4ab]/40 text-[#ffdad6]'
                            : 'eclipse-card text-[#e2e2ea]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[#D1A98E] mb-1.5">
                        <span className="font-medium">
                          {msg.role === 'user' ? 'You' : 'FirstStep'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{msg.timestamp}</span>
                      </div>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {isSending && (
                <div className="flex justify-start">
                  <div className="eclipse-card rounded-3xl px-5 py-4 inline-flex items-center gap-3 text-sm text-[#DDC1B3]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF8A3D]" />
                    <span>Listening thoughtfully...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Composer Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="sticky bottom-16 md:bottom-4 z-20"
            >
              <div className="flex items-center gap-2.5 p-2 rounded-full bg-[#0c0e13]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening... speak naturally in English or தமிழ்'
                      : 'Share what is on your mind in English or தமிழ்...'
                  }
                  aria-label="Share your reflection"
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm sm:text-[15px] text-white placeholder-[#94A3B8] focus:outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isSending}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={isListening}
                  title={isListening ? 'Stop listening' : 'Speak your reflection'}
                  className={`min-h-[44px] min-w-[44px] rounded-full inline-flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 cursor-pointer ${
                    isListening
                      ? 'bg-[#FF8A3D]/25 text-[#FFB68D] border border-[#FF8A3D]/70 shadow-[0_0_16px_rgba(255,138,61,0.35)]'
                      : 'eclipse-button-ghost text-[#DDC1B3] hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  aria-label="Send message"
                  className="eclipse-button-primary min-h-[44px] min-w-[44px] px-5 rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 3: NEXT STEP CARD (PHASE 3) */}
        {activeView === 'next-step' && currentCard && (
          <NextStepCardView
            card={currentCard}
            languageMode={languageMode}
            onChangeLanguage={setLanguageMode}
            onSaveCard={handleSaveCard}
            isSaved={isCurrentCardSaved}
            onBackToChat={() => setActiveView('reflect')}
            onStartNew={handleStartNewReflection}
          />
        )}

        {/* VIEW 4: SAVED REFLECTIONS & PERSONAL JOURNAL */}
        {activeView === 'journal' && (
          <JournalView
            savedCards={savedCards}
            journalEntries={journalEntries}
            hasPremiumAccess={entitlement.hasPremiumAccess}
            onAddJournalEntry={(entry) => {
              const now = new Date().toISOString();
              setJournalEntries((prev) => [
                { ...entry, id: `jrn-${Date.now()}`, createdAt: now, updatedAt: now },
                ...prev,
              ]);
            }}
            onUpdateJournalEntry={(id, entry) => {
              setJournalEntries((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, ...entry, updatedAt: new Date().toISOString() } : item,
                ),
              );
            }}
            onDeleteJournalEntry={(id) => {
              setJournalEntries((prev) => prev.filter((item) => item.id !== id));
            }}
            onOpenCard={(card) => {
              setCurrentCard(card);
              setActiveView('next-step');
            }}
            onDeleteCard={handleDeleteCard}
            onStartNew={handleStartNewReflection}
            onExplorePremium={() => setActiveView('premium')}
          />
        )}

        {/* VIEW 6: MY JOURNEY DASHBOARD */}
        {activeView === 'journey' && (
          <MyJourneyDashboard
            user={user}
            entitlement={entitlement}
            selectedGoals={selectedGoals}
            onToggleGoal={(goal) =>
              setSelectedGoals((prev) =>
                prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
              )
            }
            programmeProgress={programmeProgress}
            onAdvanceProgrammeDay={(progId, nextDay) =>
              setProgrammeProgress((prev) => ({ ...prev, [progId]: nextDay }))
            }
            snapshotHistory={snapshotHistory}
            trackingEnabled={trackingEnabled}
            onToggleTracking={setTrackingEnabled}
            reminders={reminders}
            onUpdateReminders={setReminders}
            reflectionCount={savedCards.length}
            journalCount={journalEntries.length}
            onContinueReflection={() => setActiveView('reflect')}
            onOpenJournal={() => setActiveView('journal')}
            onTakeSnapshot={() => setActiveView('snapshot')}
            onExplorePremium={() => setActiveView('premium')}
          />
        )}

        {/* VIEW 7: INDIVIDUAL PREMIUM & SUBSCRIPTION MANAGEMENT */}
        {activeView === 'premium' && (
          <PremiumPage
            user={user}
            entitlement={entitlement}
            onAuthSuccess={(u, ent) => {
              setUser(u);
              setEntitlement(ent);
            }}
            onEntitlementUpdate={setEntitlement}
            onOpenJourney={() => setActiveView('journey')}
          />
        )}
      </main>

      {/* Mobile Bottom Tab Bar (Thumb-Zone Ergonomics) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-t border-white/[0.08] h-14 grid grid-cols-5 items-center px-1"
      >
        {(
          [
            { id: 'sanctuary', label: 'Sanctuary' },
            { id: 'snapshot', label: 'Snapshot' },
            { id: 'reflect', label: 'Reflect' },
            { id: 'resources', label: 'Resources' },
            { id: 'journal', label: 'Journal' },
          ] as Array<{ id: ActiveView; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id)}
            className={`min-h-[44px] flex items-center justify-center text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeView === tab.id ? 'text-[#FFB68D]' : 'text-[#94A3B8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
