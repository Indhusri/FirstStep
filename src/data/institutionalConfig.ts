export interface PricingTier {
  id: string;
  segment: string;
  indicativeAnnualPricing: string;
  audienceNote: string;
  highlights: string[];
}

export const INSTITUTIONAL_PRICING_CONFIG: {
  disclaimer: string;
  tiers: PricingTier[];
  illustrativeModel: {
    eligibleUsers: number;
    monthlyPerUserInr: number;
    months: number;
    annualContractValueInr: string;
    tenInstitutionsArrInr: string;
    disclaimer: string;
  };
} = {
  disclaimer: 'Indicative pricing – subject to institutional requirements and validation.',
  tiers: [
    {
      id: 'small',
      segment: 'Small institution',
      indicativeAnnualPricing: '₹25,000–₹50,000',
      audienceNote: 'Independent colleges, boutique teams, or community organisations',
      highlights: [
        'Free Well-being Snapshot & bilingual reflection access',
        'Curated self-help & Tamil/English bibliotherapy library',
        'Privacy-first guest access without individual tracking',
      ],
    },
    {
      id: 'medium',
      segment: 'Medium institution',
      indicativeAnnualPricing: '₹75,000–₹1,50,000',
      audienceNote: 'Universities, multi-department campuses, and mid-size employers',
      highlights: [
        'Everything in Small institution',
        'Campus or workplace onboarding & awareness toolkit',
        'Optional privacy-protected aggregate engagement overview',
      ],
    },
    {
      id: 'large',
      segment: 'Large institution / enterprise',
      indicativeAnnualPricing: 'Custom pricing',
      audienceNote: 'Large university networks, enterprise employers, and senior-care networks',
      highlights: [
        'Tailored deployment & custom institutional configuration',
        'Dedicated onboarding support & privacy governance review',
        'Future professional-support pathway integrations (by agreement)',
      ],
    },
  ],
  illustrativeModel: {
    eligibleUsers: 1000,
    monthlyPerUserInr: 50,
    months: 12,
    annualContractValueInr: '₹6,00,000',
    tenInstitutionsArrInr: '₹60,00,000',
    disclaimer:
      'Hypothetical illustration only — not actual revenue, a financial forecast, or a confirmed customer commitment.',
  },
};
