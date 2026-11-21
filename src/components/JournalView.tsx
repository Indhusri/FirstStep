import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Trash2,
  ArrowRight,
  Plus,
  Search,
  Download,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { PREMIUM_CONFIG } from '../data/premiumConfig';
import { JournalCategory, NextStepCard, PersonalJournalEntry } from '../types';

const JOURNAL_CATEGORIES: JournalCategory[] = [
  'My thoughts',
  'What I am grateful for',
  'What challenged me today',
  'Things I want to understand',
  'Personal achievements',
  'Reflections for tomorrow',
];

interface JournalViewProps {
  savedCards: NextStepCard[];
  journalEntries: PersonalJournalEntry[];
  hasPremiumAccess: boolean;
  onAddJournalEntry: (entry: Omit<PersonalJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateJournalEntry: (id: string, entry: Omit<PersonalJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteJournalEntry: (id: string) => void;
  onOpenCard: (card: NextStepCard) => void;
  onDeleteCard: (id: string) => void;
  onStartNew: () => void;
  onExplorePremium: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  savedCards,
  journalEntries,
  hasPremiumAccess,
  onAddJournalEntry,
  onUpdateJournalEntry,
  onDeleteJournalEntry,
  onOpenCard,
  onDeleteCard,
  onStartNew,
  onExplorePremium,
}) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'reflections'>('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<JournalCategory>('My thoughts');
  const [tagsInput, setTagsInput] = useState('');

  const reachedFreeLimit =
    !hasPremiumAccess && journalEntries.length >= PREMIUM_CONFIG.freeJournalLimit;

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return journalEntries.filter((entry) => {
      const matchesCat = selectedCategory === 'All' || entry.category === selectedCategory;
      const matchesSearch =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [journalEntries, searchQuery, selectedCategory]);

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      onUpdateJournalEntry(editingId, { title: title.trim(), content: content.trim(), category, tags });
    } else {
      onAddJournalEntry({ title: title.trim(), content: content.trim(), category, tags });
    }

    setTitle('');
    setContent('');
    setTagsInput('');
    setEditingId(null);
    setIsComposerOpen(false);
  };

  const handleEditClick = (entry: PersonalJournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setTagsInput(entry.tags.join(', '));
    setIsComposerOpen(true);
  };

  const handleExportJournal = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      journalEntries,
      savedReflections: savedCards,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firststep-journal-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#FFB68D] tracking-wide mb-2">
            Private Personal Sanctuary · Never Shared With Institutions
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Personal Journal & Reflections
          </h1>
          <p className="text-sm text-[#D1A98E] mt-2">
            Write private notes, organise by theme, export your data anytime, or revisit saved Next Step Cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportJournal}
            className="eclipse-button-ghost min-h-[42px] px-4 py-2 rounded-full text-xs font-medium text-[#DDC1B3] hover:text-white inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={onStartNew}
            className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            New Reflection
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="inline-flex items-center p-1 rounded-full bg-[#111319] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('entries')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'entries'
                ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/40'
                : 'text-[#94A3B8] hover:text-white border border-transparent'
            }`}
          >
            Personal Journal ({journalEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reflections')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'reflections'
                ? 'bg-[#FF8A3D]/20 text-[#FFB68D] border border-[#FF8A3D]/40'
                : 'text-[#94A3B8] hover:text-white border border-transparent'
            }`}
          >
            Saved Next Steps ({savedCards.length})
          </button>
        </div>

        {activeTab === 'entries' && (
          <button
            type="button"
            disabled={reachedFreeLimit && !editingId}
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setContent('');
              setTagsInput('');
              setIsComposerOpen((prev) => !prev);
            }}
            className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white inline-flex items-center gap-2 disabled:opacity-45 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal Entry</span>
          </button>
        )}
      </div>

      {activeTab === 'entries' ? (
        <div className="space-y-6">
          {reachedFreeLimit && (
            <div className="rounded-3xl bg-[#191c21] border border-[#FF8A3D]/35 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[#DDC1B3] leading-relaxed">
                <p className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#FFB68D]" />
                  <span>Free Journal Limit Reached ({PREMIUM_CONFIG.freeJournalLimit} entries)</span>
                </p>
                <p>
                  You can still edit, delete, or export your existing entries anytime. Upgrade to FirstStep Premium for unlimited personal journal entries.
                </p>
              </div>
              <button
                type="button"
                onClick={onExplorePremium}
                className="eclipse-button-primary min-h-[40px] px-5 py-2 rounded-full text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Premium
              </button>
            </div>
          )}

          {isComposerOpen && (
            <form onSubmit={handleSaveEntry} className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Journal Entry' : 'Write a Private Journal Entry'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entry title..."
                  className="eclipse-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as JournalCategory)}
                  className="eclipse-input rounded-xl px-4 py-2.5 text-sm text-white bg-[#0a0d13]"
                >
                  {JOURNAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write freely in English or தமிழ்..."
                className="eclipse-input w-full rounded-2xl p-4 text-sm text-white placeholder-[#94A3B8] resize-none"
              />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Optional tags separated by commas (e.g., calm, evening, work)"
                className="eclipse-input w-full rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#94A3B8]"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsComposerOpen(false);
                    setEditingId(null);
                  }}
                  className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-[#DDC1B3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="eclipse-button-primary min-h-[42px] px-6 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Search & Category Filter */}
          {journalEntries.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries or tags..."
                  className="eclipse-input w-full rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="eclipse-input rounded-full px-4 py-2.5 text-sm text-white bg-[#0a0d13]"
              >
                <option value="All">All Categories</option>
                {JOURNAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filteredEntries.length === 0 ? (
            <div className="eclipse-card rounded-3xl p-10 text-center">
              <BookOpen className="w-8 h-8 text-[#FF8A3D] mx-auto mb-4 opacity-80" />
              <h2 className="text-lg font-semibold text-white mb-2">
                {journalEntries.length === 0 ? 'Your private journal is ready' : 'No matching entries'}
              </h2>
              <p className="text-sm text-[#D1A98E] max-w-md mx-auto leading-relaxed">
                {journalEntries.length === 0
                  ? 'Capture quiet thoughts, gratitude, or reflections for tomorrow. Entries remain private to you.'
                  : 'Try clearing your search or selecting another category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEntries.map((entry) => (
                <article key={entry.id} className="eclipse-card rounded-3xl p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-[#D1A98E] mb-2">
                      <span>
                        {entry.category} · {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(entry)}
                          aria-label="Edit entry"
                          className="min-h-[34px] min-w-[34px] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteJournalEntry(entry.id)}
                          aria-label="Delete entry"
                          className="min-h-[34px] min-w-[34px] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#ffb4ab] hover:bg-white/5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{entry.title}</h3>
                    <p className="text-sm text-[#e2e2ea]/85 leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                  {entry.tags.length > 0 && (
                    <p className="text-xs text-[#FFB68D]/85 border-t border-white/[0.06] pt-3">
                      {entry.tags.join(' · ')}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      ) : savedCards.length === 0 ? (
        <div className="eclipse-card rounded-3xl p-10 text-center">
          <BookOpen className="w-8 h-8 text-[#FF8A3D] mx-auto mb-4 opacity-80" />
          <h2 className="text-lg font-semibold text-white mb-2">No saved reflections yet</h2>
          <p className="text-sm text-[#D1A98E] max-w-md mx-auto mb-6 leading-relaxed">
            When you generate a Next Step Card during a reflection, you can save it here to keep your Sangam poetry and reading suggestions close.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="eclipse-button-ghost min-h-[44px] px-6 py-2.5 rounded-full text-sm font-medium text-white cursor-pointer"
          >
            Begin a Reflection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedCards.map((card) => (
            <div
              key={card.id}
              className="eclipse-card rounded-3xl p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 text-xs text-[#D1A98E] mb-3">
                  <span>
                    {card.createdAt
                      ? new Date(card.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Saved Reflection'}
                  </span>
                  <button
                    type="button"
                    onClick={() => card.id && onDeleteCard(card.id)}
                    aria-label="Delete saved reflection"
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#94A3B8] hover:text-[#ffb4ab] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-white leading-snug mb-2">
                  {card.emotional_snapshot.english}
                </h3>
                <p className="font-tamil text-sm text-[#FFB68D]/90 leading-relaxed mb-4">
                  {card.emotional_snapshot.tamil}
                </p>

                {card.book_recommendation && (
                  <p className="text-xs text-[#D1A98E] border-t border-white/5 pt-3">
                    Reading:{' '}
                    <span className="text-white font-medium">
                      {card.book_recommendation.title_english}
                    </span>{' '}
                    by {card.book_recommendation.author}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenCard(card)}
                className="eclipse-button-ghost min-h-[44px] w-full px-4 py-2.5 rounded-full text-sm font-medium text-white inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Next Step Card</span>
                <ArrowRight className="w-4 h-4 text-[#FF8A3D]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
