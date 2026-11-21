import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Compass,
  Lock,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { GUIDED_PROGRAMMES, GuidedProgramme } from '../data/guidedProgrammes';
import { PREMIUM_CONFIG } from '../data/premiumConfig';
import {
  ReminderPreferences,
  SavedSnapshotHistoryItem,
  UserEntitlement,
  UserProfile,
} from '../types';

interface MyJourneyDashboardProps {
  user: UserProfile | null;
  entitlement: UserEntitlement;
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  programmeProgress: Record<string, number>;
  onAdvanceProgrammeDay: (programmeId: string, nextDay: number) => void;
  snapshotHistory: SavedSnapshotHistoryItem[];
  trackingEnabled: boolean;
  onToggleTracking: (enabled: boolean) => void;
  reminders: ReminderPreferences;
  onUpdateReminders: (prefs: ReminderPreferences) => void;
  reflectionCount: number;
  journalCount: number;
  onContinueReflection: () => void;
  onOpenJournal: () => void;
  onTakeSnapshot: () => void;
  onExplorePremium: () => void;
}

export const MyJourneyDashboard: React.FC<MyJourneyDashboardProps> = ({
  user,
  entitlement,
  selectedGoals,
  onToggleGoal,
  programmeProgress,
  onAdvanceProgrammeDay,
  snapshotHistory,
  trackingEnabled,
  onToggleTracking,
  reminders,
  onUpdateReminders,
  reflectionCount,
  journalCount,
  onContinueReflection,
  onOpenJournal,
  onTakeSnapshot,
  onExplorePremium,
}) => {
  const [activeProgramme, setActiveProgramme] = useState<GuidedProgramme>(GUIDED_PROGRAMMES[0]);

  const hasPremium = entitlement.hasPremiumAccess;
  const completedProgrammesCount = GUIDED_PROGRAMMES.filter(
    (p) => (programmeProgress[p.id] || 0) >= p.days.length,
  ).length;

  const activeProgCompletedDays = programmeProgress[activeProgramme.id] || 0;
  const currentDayIndex = Math.min(activeProgCompletedDays, activeProgramme.days.length - 1);
  const currentDayContent = activeProgramme.days[currentDayIndex];

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-10">
      {/* Welcome Area */}
      <section className="eclipse-card rounded-3xl p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] mb-1.5">
            {entitlement.source === 'institutional_sponsored'
              ? 'My Journey · Institution-Sponsored Access'
              : hasPremium
                ? 'My Journey · FirstStep Premium'
                : 'My Journey · Free Preview'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {user?.displayName ? `Welcome back, ${user.displayName}.` : 'Welcome back.'}
          </h1>
          <p className="text-sm text-[#D1A98E] mt-2 max-w-xl">
            Your calm space for personal reflection goals, self-guided well-being programmes, and optional personal insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onContinueReflection}
            className="eclipse-button-primary min-h-[44px] px-5 py-2.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Continue Reflection</span>
          </button>
          <button
            type="button"
            onClick={onOpenJournal}
            className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open My Journal</span>
          </button>
          <button
            type="button"
            onClick={onTakeSnapshot}
            className="eclipse-button-ghost min-h-[44px] px-5 py-2.5 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white cursor-pointer"
          >
            Weekly Check-in
          </button>
        </div>
      </section>

      {!hasPremium && (
        <section className="rounded-3xl bg-[#191c21] border border-[#FF8A3D]/35 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFB68D]" />
              <span>Previewing My Journey on FirstStep Free</span>
            </p>
            <p className="text-xs text-[#D1A98E] leading-relaxed">
              You can explore the 7-Day Stress Awareness preview below. Upgrade to FirstStep Premium (or enter an institutional code) to unlock all 6 guided programmes, personal insights, and advanced reminders.
            </p>
          </div>
          <button
            type="button"
            onClick={onExplorePremium}
            className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Explore Premium
          </button>
        </section>
      )}

      {/* Personal Well-being Goals */}
      <section className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#FFB68D]">Personal Well-being Journey</p>
            <h2 className="text-xl font-bold text-white mt-0.5">Your Reflection Goals</h2>
          </div>
          <span className="text-xs text-[#94A3B8]">Self-reflection focus · Not a treatment plan</span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PREMIUM_CONFIG.personalGoals.map((goal) => {
            const active = selectedGoals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => onToggleGoal(goal)}
                className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/60'
                    : 'bg-[#0c0e13]/80 text-[#DDC1B3] border border-white/10 hover:border-white/25'
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </section>

      {/* Guided Well-being Programmes */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#FFB68D]">Guided Well-being Programmes</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Self-Guided Journeys
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Educational self-guided activities — not clinically validated treatment programmes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3">
            {GUIDED_PROGRAMMES.map((prog) => {
              const locked = !hasPremium && !prog.isFreePreview;
              const doneDays = programmeProgress[prog.id] || 0;
              const isSelected = activeProgramme.id === prog.id;

              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => !locked && setActiveProgramme(prog)}
                  className={`w-full text-left rounded-2xl p-4 transition-all flex items-center justify-between gap-3 ${
                    locked
                      ? 'bg-[#0c0e13]/60 border border-white/[0.05] opacity-65 cursor-not-allowed'
                      : isSelected
                        ? 'bg-[#191c21] border border-[#FF8A3D]/60 cursor-pointer'
                        : 'eclipse-card hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{prog.title}</p>
                    <p className="text-xs text-[#D1A98E] mt-0.5 tabular-nums">
                      {prog.category} · {doneDays}/{prog.days.length} steps completed
                    </p>
                  </div>
                  {locked ? (
                    <Lock className="w-4 h-4 text-[#94A3B8] shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#FFB68D] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 eclipse-card rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#FFB68D]">
                Day {currentDayContent.day} of {activeProgramme.durationDays}
              </span>
              <span className="text-xs text-[#D1A98E] tabular-nums">
                {activeProgCompletedDays}/{activeProgramme.days.length} completed
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{activeProgramme.title}</h3>
              <p className="text-sm text-[#D1A98E] mt-1 leading-relaxed">
                {activeProgramme.introduction}
              </p>
            </div>

            <div className="rounded-2xl bg-[#0c0e13]/85 border border-white/[0.07] p-5 space-y-3">
              <p className="text-sm font-semibold text-white">
                Day {currentDayContent.day}: {currentDayContent.title}
              </p>
              <p className="text-sm text-[#e2e2ea]/90 leading-relaxed">
                {currentDayContent.activity}
              </p>
              <p className="text-xs text-[#FFB68D] pt-2 border-t border-white/[0.06]">
                Reflection question: {currentDayContent.reflectionQuestion}
              </p>
              <p className="text-xs text-[#DDC1B3]">
                Practical exercise: {currentDayContent.practicalExercise}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {activeProgCompletedDays >= activeProgramme.days.length ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#FFB68D]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Available preview steps completed</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onAdvanceProgrammeDay(activeProgramme.id, activeProgCompletedDays + 1)
                  }
                  className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                >
                  Mark Day {currentDayContent.day} Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Personal Insights & Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Feature 5: Advanced Personal Insights */}
        <section className="eclipse-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
              <TrendingUp className="w-4 h-4 text-[#FF8A3D]" />
              <span>Personal Insights</span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#D1A98E] cursor-pointer">
              <input
                type="checkbox"
                checked={trackingEnabled}
                onChange={(e) => onToggleTracking(e.target.checked)}
                className="accent-[#FF8A3D]"
              />
              <span>History tracking</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#0c0e13]/80 border border-white/[0.06] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{reflectionCount}</p>
              <p className="text-[11px] text-[#D1A98E] mt-1">Reflections</p>
            </div>
            <div className="rounded-2xl bg-[#0c0e13]/80 border border-white/[0.06] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{journalCount}</p>
              <p className="text-[11px] text-[#D1A98E] mt-1">Journal Entries</p>
            </div>
            <div className="rounded-2xl bg-[#0c0e13]/80 border border-white/[0.06] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">
                {completedProgrammesCount}
              </p>
              <p className="text-[11px] text-[#D1A98E] mt-1">Programmes</p>
            </div>
          </div>

          {trackingEnabled && snapshotHistory.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white">Saved Check-in Timeline</p>
              {snapshotHistory.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-xs bg-[#0c0e13]/75 rounded-xl px-4 py-2.5 border border-white/[0.05]"
                >
                  <span className="text-[#DDC1B3]">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-white font-semibold tabular-nums">
                    Indicator {item.indicator}/10
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {trackingEnabled
                ? 'Complete a Well-being Snapshot to see your optional self-reflection check-in timeline here.'
                : 'Personal history tracking is currently paused.'}
            </p>
          )}

          <p className="text-[11px] text-[#94A3B8] border-t border-white/[0.06] pt-3">
            Personal insights summarise your own activity—they are not a clinical progress report and do not indicate recovery or deterioration.
          </p>
        </section>

        {/* Feature 7: Personal Reminders */}
        <section className="eclipse-card rounded-3xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#FFB68D]">
              <Bell className="w-4 h-4 text-[#FF8A3D]" />
              <span>Personal Reminders</span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-white font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={reminders.enabled}
                onChange={(e) =>
                  onUpdateReminders({ ...reminders, enabled: e.target.checked })
                }
                className="accent-[#FF8A3D]"
              />
              <span>{reminders.enabled ? 'Enabled' : 'All Off'}</span>
            </label>
          </div>

          <div className={`space-y-3 ${!reminders.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {(
              [
                { key: 'dailyReflection', label: 'Daily reflection reminder' },
                { key: 'weeklyCheckIn', label: 'Weekly check-in reminder' },
                { key: 'journalReminder', label: 'Journal reminder' },
                { key: 'programmeReminder', label: 'Programme activity reminder' },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-3 text-sm text-[#e2e2ea] cursor-pointer"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  checked={reminders[item.key]}
                  onChange={(e) =>
                    onUpdateReminders({ ...reminders, [item.key]: e.target.checked })
                  }
                  className="accent-[#FF8A3D] w-4 h-4"
                />
              </label>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-[#D1A98E] mb-1">Frequency</label>
                <select
                  value={reminders.frequency}
                  onChange={(e) =>
                    onUpdateReminders({
                      ...reminders,
                      frequency: e.target.value as ReminderPreferences['frequency'],
                    })
                  }
                  className="eclipse-input w-full rounded-xl px-3 py-2 text-xs text-white bg-[#0a0d13]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#D1A98E] mb-1">Preferred Time</label>
                <input
                  type="time"
                  value={reminders.preferredTime}
                  onChange={(e) =>
                    onUpdateReminders({ ...reminders, preferredTime: e.target.value })
                  }
                  className="eclipse-input w-full rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#94A3B8] border-t border-white/[0.06] pt-3">
            Reminders are strictly opt-in and never include sensitive emotional content in notification previews.
          </p>
        </section>
      </div>
    </div>
  );
};
