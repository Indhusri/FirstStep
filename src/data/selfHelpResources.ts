export interface SelfHelpCategory {
  id: string;
  title: string;
  tamilTitle: string;
  description: string;
  activities: Array<{
    title: string;
    duration: string;
    guidance: string;
  }>;
  literaryNote?: {
    tamilVerse: string;
    englishTranslation: string;
    tradition: string;
    bookSuggestion: string;
  };
  isProfessionalSupport?: boolean;
}

export const SELF_HELP_CATEGORIES: SelfHelpCategory[] = [
  {
    id: 'relaxation-breathing',
    title: 'Relaxation and Breathing',
    tamilTitle: 'ஓய்வு மற்றும் மூச்சுப் பயிற்சி',
    description:
      'Gentle somatic practices to slow a racing nervous system and create a quiet pause in the middle of a demanding day.',
    activities: [
      {
        title: '4-4-6 Exhale Softening',
        duration: '2 minutes',
        guidance:
          'Inhale gently through your nose for 4 counts, hold softly for 4 counts, and let the breath leave slowly for 6 counts. Repeat five times.',
      },
      {
        title: 'Shoulder & Jaw Release',
        duration: '3 minutes',
        guidance:
          'Unclench your jaw, drop your shoulders away from your ears, and rest your palms face-up on your lap while noticing the weight of your hands.',
      },
    ],
    literaryNote: {
      tamilVerse: 'தீயினால் சுட்டபுண் உள்ளாறும் ஆறாதே நாவினால் சுட்ட வடு',
      englishTranslation: 'Gentle inner speech heals faster than harshness; speak to yourself with the same softness you offer a friend.',
      tradition: 'Tirukkural — Reflective Adaptation',
      bookSuggestion: 'The Miracle of Mindfulness — Thich Nhat Hanh',
    },
  },
  {
    id: 'journaling-reflection',
    title: 'Journaling and Self-reflection',
    tamilTitle: 'நாட்குறிப்பு மற்றும் சுய-பிரதிபலிப்பு',
    description:
      'Unstructured and guided writing prompts to untangle crowded thoughts without judging them.',
    activities: [
      {
        title: 'Three-Line Evening Unload',
        duration: '4 minutes',
        guidance:
          'Write down: (1) One thing that felt heavy today, (2) One small moment that felt steady, and (3) One thing that can wait until tomorrow.',
      },
      {
        title: 'Naming the Weather',
        duration: '3 minutes',
        guidance:
          'Describe your current mood as a landscape or season rather than a problem to fix. Notice how observing a feeling creates slight breathing room.',
      },
    ],
    literaryNote: {
      tamilVerse: 'யாயும் ஞாயும் யாரா கியரோ... செம்புலப் பெயல்நீர் போல',
      englishTranslation: 'Like rain falling on red earth, our inner landscapes mingle and change with time.',
      tradition: 'Kuruntokai 40 — Sangam Akam Poetry',
      bookSuggestion: 'Letters to a Young Poet — Rainer Maria Rilke',
    },
  },
  {
    id: 'daily-routine',
    title: 'Daily Routine and Well-being Habits',
    tamilTitle: 'அன்றாட நடைமுறை மற்றும் நலப் பழக்கங்கள்',
    description:
      'Small, realistic anchors that restore rhythm when energy or focus feels scattered.',
    activities: [
      {
        title: 'One-Anchor Morning',
        duration: '5 minutes',
        guidance:
          'Choose just one non-negotiable anchor for the first hour of the day—a glass of water, opening a window, or five minutes away from screens.',
      },
      {
        title: '10-Minute Focus Window',
        duration: '10 minutes',
        guidance:
          'When tasks feel overwhelming, commit to working on a single small step for just 10 minutes, with full permission to pause afterward.',
      },
    ],
  },
  {
    id: 'emotional-awareness',
    title: 'Emotional Awareness',
    tamilTitle: 'உணர்ச்சி விழிப்புணர்வு',
    description:
      'Practices for noticing difficult feelings with curiosity instead of self-criticism.',
    activities: [
      {
        title: '5-4-3-2-1 Sensory Grounding',
        duration: '3 minutes',
        guidance:
          'Name 5 things you can see, 4 you can physically feel, 3 you can hear, 2 you can smell, and 1 steady breath you can take right now.',
      },
      {
        title: 'Separating Feeling from Fact',
        duration: '4 minutes',
        guidance:
          'Replace “I am failing” with “I am noticing a feeling of overwhelm right now.” Small shifts in wording reduce emotional weight.',
      },
    ],
    literaryNote: {
      tamilVerse: 'இடுக்கண் வருங்கால் நகுக அதனை அடுத்தூர்வது அஃதொப்பது இல்',
      englishTranslation: 'Meeting hardship with quiet steadiness softens its grip.',
      tradition: 'Tirukkural 621 — Resilience & Composure',
      bookSuggestion: 'Bittersweet — Susan Cain',
    },
  },
  {
    id: 'social-connection',
    title: 'Social Connection',
    tamilTitle: 'சமூக இணைப்பு',
    description:
      'Low-pressure ways to bridge isolation when reaching out feels harder than usual.',
    activities: [
      {
        title: 'Low-Stakes Check-In Message',
        duration: '2 minutes',
        guidance:
          'Send a brief message to someone you trust: “Thinking of you today—no need to reply right away, just wanted to say hello.”',
      },
      {
        title: 'Shared Quiet Space',
        duration: '15 minutes',
        guidance:
          'Sit in a library, café, park, or quiet common room where you can be gently around other people without needing to perform conversation.',
      },
    ],
    literaryNote: {
      tamilVerse: 'யாதும் ஊரே யாவரும் கேளிர்',
      englishTranslation: 'Every place is home, and all people are kin.',
      tradition: 'Purananuru 192 — Kaniyan Pungundranar (Sangam Puram)',
      bookSuggestion: 'Together — Vivek H. Murthy',
    },
  },
  {
    id: 'professional-support',
    title: 'Finding Qualified Professional Support',
    tamilTitle: 'தகுதிவாய்ந்த தொழில்முறை ஆதரவைக் கண்டறிதல்',
    description:
      'Self-help and literary reflection are helpful companions, but they do not replace qualified mental-health professionals. Here is how to take a calm step toward human care.',
    isProfessionalSupport: true,
    activities: [
      {
        title: 'When to Consider a Counselor or Therapist',
        duration: 'Guidance',
        guidance:
          'If difficult emotions, sleep disruption, or exhaustion persist for weeks or interfere with daily life, speaking with a licensed counselor, clinical psychologist, or doctor can provide tailored support.',
      },
      {
        title: 'Campus, Workplace, or Community Pathways',
        duration: 'Next step',
        guidance:
          'Check whether your college, university, or employer offers confidential student counseling or an Employee Assistance Programme (EAP), or ask a trusted primary-care doctor for a verified referral.',
      },
      {
        title: 'National Mental Health Helpline (India)',
        duration: '24/7 Free',
        guidance:
          'Tele-MANAS (14416 / 1-800-891-4416) offers free, confidential 24/7 mental-health support in English, Tamil, and regional languages. Outside India, consult your local emergency or national health directory.',
      },
    ],
  },
];
