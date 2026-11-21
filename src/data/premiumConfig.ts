import { BillingPeriod } from '../types';

export interface PremiumPlanConfig {
  id: 'premium_monthly' | 'premium_annual';
  billingPeriod: BillingPeriod;
  name: string;
  priceInr: number;
  priceDisplay: string;
  cadenceLabel: string;
  badgeNote?: string;
  summary: string;
  terms: string[];
}

export const PREMIUM_CONFIG = {
  heading: 'A little more support for your personal journey.',
  subheading:
    'Explore additional tools, guided experiences and personal reflections with FirstStep Premium.',
  freeJournalLimit: 5,
  pricingDisclaimer:
    'Preliminary pricing assumptions — subject to validation. Essential safety, crisis guidance, and basic reflection remain free for everyone.',
  plans: {
    monthly: {
      id: 'premium_monthly',
      billingPeriod: 'monthly',
      name: 'Premium Monthly',
      priceInr: 199,
      priceDisplay: '₹199',
      cadenceLabel: '/ month',
      summary: 'Flexible monthly subscription with full access to all personal journey tools.',
      terms: [
        'Billed monthly at ₹199 per billing cycle.',
        'Cancel anytime from Subscription Management before the next renewal date.',
        'Access continues through the end of your current paid period.',
      ],
    } as PremiumPlanConfig,
    annual: {
      id: 'premium_annual',
      billingPeriod: 'annual',
      name: 'Premium Annual',
      priceInr: 1499,
      priceDisplay: '₹1,499',
      cadenceLabel: '/ year',
      badgeNote: 'Proposed introductory offer · subject to validation',
      summary: 'Annual subscription with a lower effective monthly cost (approx. ₹125/month).',
      terms: [
        'Billed annually at ₹1,499 per year.',
        'Proposed introductory offer, subject to market validation.',
        'Cancel anytime before annual renewal; transparent refund policy applies once live billing launches.',
      ],
    } as PremiumPlanConfig,
  },
  comparisonRows: [
    { feature: 'Well-being Snapshot', free: 'Yes', premium: 'Yes' },
    { feature: 'Basic AI reflection', free: 'Yes', premium: 'Yes' },
    { feature: 'English and Tamil', free: 'Yes', premium: 'Yes' },
    { feature: 'Basic self-help resources', free: 'Yes', premium: 'Yes' },
    { feature: 'Emergency & safety guidance', free: 'Always Free', premium: 'Always Free' },
    { feature: 'Basic journal', free: 'Up to 5 entries', premium: 'Extended unlimited' },
    { feature: 'Saved reflection history', free: 'Limited', premium: 'Yes' },
    { feature: 'Personal Well-being Journey', free: 'No', premium: 'Yes' },
    { feature: 'Guided programmes', free: 'Selected preview', premium: 'Full 6-programme collection' },
    { feature: 'Advanced personal insights', free: 'No', premium: 'Yes' },
    { feature: 'Extended reflection summaries', free: 'Basic', premium: 'Yes' },
    { feature: 'Personal reminders', free: 'Basic', premium: 'Advanced configurable' },
    { feature: 'Expanded resource library', free: 'No', premium: 'Yes' },
    { feature: 'Data export', free: 'Basic account data', premium: 'Enhanced personal export' },
  ],
  personalGoals: [
    'Manage everyday stress',
    'Improve emotional awareness',
    'Build healthier daily routines',
    'Strengthen social connections',
    'Develop better self-reflection habits',
    'Explore personal growth',
  ],
};
