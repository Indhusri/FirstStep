import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { postJson } from '../utils/apiClient';

interface InstitutionalEnquiryProps {
  onClose?: () => void;
}

export const InstitutionalEnquiry: React.FC<InstitutionalEnquiryProps> = ({ onClose }) => {
  const [institutionName, setInstitutionName] = useState('');
  const [segment, setSegment] = useState('College / University');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('');
  const [estimatedUsers, setEstimatedUsers] = useState('500–1,000');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!institutionName.trim() || !contactName.trim()) {
      setError('Please enter your institution name and contact name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await postJson<{ message: string }>('/api/institutional-enquiry', {
        institutionName,
        segment,
        contactName,
        role,
        estimatedUsers,
        notes,
      });
      setConfirmation(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="eclipse-card rounded-3xl p-7 sm:p-8 text-center space-y-4">
        <CheckCircle2 className="w-8 h-8 text-[#FFB68D] mx-auto" />
        <h3 className="text-xl font-bold text-white">Enquiry Recorded (Prototype Preview)</h3>
        <p className="text-sm text-[#DDC1B3] max-w-lg mx-auto leading-relaxed">
          {confirmation}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setConfirmation(null);
              setInstitutionName('');
              setContactName('');
              setRole('');
              setNotes('');
            }}
            className="eclipse-button-ghost min-h-[42px] px-5 py-2 rounded-full text-xs font-medium text-white cursor-pointer"
          >
            Submit Another Enquiry
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="eclipse-button-primary min-h-[42px] px-5 py-2 rounded-full text-xs font-semibold text-white cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="eclipse-card rounded-3xl p-6 sm:p-8 space-y-5">
      <div>
        <p className="text-xs font-medium text-[#FFB68D] mb-1">Institutional Demo Request</p>
        <h3 className="text-xl font-bold text-white">Request an Institutional Demo</h3>
        <p className="text-xs text-[#D1A98E] mt-1">
          Share your community details to explore a pilot for your college, university, or organisation.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/35 px-4 py-3 text-xs text-[#ffdad6] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
            Institution Name *
          </label>
          <input
            type="text"
            required
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            placeholder="e.g., Horizon College of Arts & Science"
            className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
            Institutional Segment *
          </label>
          <select
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white bg-[#0a0d13]"
          >
            <option value="College / University">College / University (Priority Segment)</option>
            <option value="Employer / Corporate">Employer / Corporate Organisation</option>
            <option value="Senior-Care Organisation">Senior-Care Organisation</option>
            <option value="Community / Social Support">Community / Social-Support Organisation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Full name"
            className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
            Role / Department
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Dean of Student Affairs / HR Lead"
            className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#94A3B8]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
          Estimated Eligible Community Size
        </label>
        <select
          value={estimatedUsers}
          onChange={(e) => setEstimatedUsers(e.target.value)}
          className="eclipse-input w-full rounded-xl px-4 py-2.5 text-sm text-white bg-[#0a0d13]"
        >
          <option value="Under 500">Under 500 individuals</option>
          <option value="500–1,000">500–1,000 individuals</option>
          <option value="1,000–5,000">1,000–5,000 individuals</option>
          <option value="5,000+">5,000+ individuals</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#DDC1B3] mb-1.5">
          Context or Questions (Optional)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tell us about your community's well-being goals..."
          className="eclipse-input w-full rounded-xl p-3.5 text-sm text-white placeholder-[#94A3B8] resize-none"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-[#94A3B8]">
          Prototype demo form — validates enquiry locally without external CRM transmission.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="eclipse-button-primary min-h-[44px] px-6 py-2.5 rounded-full text-sm font-semibold text-white inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit Demo Request</span>
        </button>
      </div>
    </form>
  );
};
