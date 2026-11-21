export type LiteraryTheme =
  | 'Hope and New Beginnings'
  | 'Facing Difficulties'
  | 'Loneliness and Belonging'
  | 'Love and Compassion'
  | 'Friendship and Human Connection'
  | 'Self-Understanding'
  | 'Courage and Inner Strength'
  | 'Patience and Acceptance'
  | 'Emotional Expression'
  | 'Wisdom and Reflection'
  | 'Nature and Peace'
  | 'Meaning and Purpose';

export type ReviewStatus =
  | 'Draft'
  | 'Source verified'
  | 'Translation reviewed'
  | 'Approved for publication';

export type ContentType = 'Exact quotation' | 'Translation' | 'Original adaptation';

export type WelcomeEntryKind =
  | 'classical_excerpt'
  | 'original_tagline'
  | 'contemporary_reflection';

export interface LiteraryEntry {
  id: string;
  kind: WelcomeEntryKind;
  originalTamilText?: string;
  tamilExplanation?: string;
  englishTranslation: string;
  author: string;
  authorTamil?: string;
  literaryWork: string;
  literaryWorkTamil?: string;
  reference?: string;
  themes: LiteraryTheme[];
  shortExplanation: string;
  firstStepReflection: string;
  sourceReference: string;
  translationAttribution: string;
  copyrightStatus: string;
  reviewStatus: ReviewStatus;
  contentType: ContentType;
}

export const ALL_LITERARY_THEMES: LiteraryTheme[] = [
  'Hope and New Beginnings',
  'Facing Difficulties',
  'Loneliness and Belonging',
  'Love and Compassion',
  'Friendship and Human Connection',
  'Self-Understanding',
  'Courage and Inner Strength',
  'Patience and Acceptance',
  'Emotional Expression',
  'Wisdom and Reflection',
  'Nature and Peace',
  'Meaning and Purpose',
];

export const CONTEXTUAL_DISCOVERY_PROMPTS: Array<{
  label: string;
  tamilLabel: string;
  themes: LiteraryTheme[];
}> = [
  {
    label: 'I need a little hope',
    tamilLabel: 'சிறிது நம்பிக்கை தேவை',
    themes: ['Hope and New Beginnings', 'Meaning and Purpose'],
  },
  {
    label: 'I feel alone',
    tamilLabel: 'தனிமையாக உணர்கிறேன்',
    themes: ['Loneliness and Belonging', 'Love and Compassion'],
  },
  {
    label: 'I want courage',
    tamilLabel: 'மன உறுதி வேண்டும்',
    themes: ['Courage and Inner Strength', 'Facing Difficulties'],
  },
  {
    label: 'I need to understand myself',
    tamilLabel: 'என்னைப் புரிந்துகொள்ள விரும்புகிறேன்',
    themes: ['Self-Understanding', 'Wisdom and Reflection', 'Emotional Expression'],
  },
  {
    label: 'I want to reflect on friendship',
    tamilLabel: 'நட்பைப் பற்றிச் சிந்திக்க விரும்புகிறேன்',
    themes: ['Friendship and Human Connection', 'Love and Compassion'],
  },
  {
    label: 'I want a moment of peace',
    tamilLabel: 'அமைதியான ஒரு தருணம் வேண்டும்',
    themes: ['Nature and Peace', 'Patience and Acceptance'],
  },
];

export const LITERARY_COLLECTION: LiteraryEntry[] = [
  // A. Thirukkural – Thiruvalluvar
  {
    id: 'kural-621',
    kind: 'classical_excerpt',
    originalTamilText: 'இடுக்கண் வருங்கால் நகுக அதனை\nஅடுத்தூர்வது அஃதொப்ப தில்.',
    tamilExplanation: 'துன்பம் வரும்போது மனம் தளராமல் அமைதியான புன்னகையுடன் எதிர்கொள்வது அதைக் கடந்து செல்ல உதவும்.',
    englishTranslation: 'When difficulties arise, meet them with calm courage; nothing softens hardship more gently.',
    author: 'Thiruvalluvar',
    authorTamil: 'திருவள்ளுவர்',
    literaryWork: 'Thirukkural',
    literaryWorkTamil: 'திருக்குறள்',
    reference: 'Verse 621 (இடுக்கண் அழியாமை)',
    themes: ['Facing Difficulties', 'Courage and Inner Strength', 'Hope and New Beginnings'],
    shortExplanation:
      'From the chapter on steadiness in adversity, this couplet reflects on meeting difficult seasons without losing inner composure.',
    firstStepReflection:
      'Even in difficult moments, there is room for a quiet breath and a gentle new beginning.',
    sourceReference: 'Thirukkural, Chapter 63, Verse 621',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },
  {
    id: 'kural-788',
    kind: 'classical_excerpt',
    originalTamilText: 'உடுக்கை இழந்தவன் கைபோல ஆங்கே\nஇடுக்கண் களைவதாம் நட்பு.',
    tamilExplanation: 'ஆடை நழுவும்போது கை தானாக உதவுவது போல, துன்பம் நேரும்போது உடனே துணை நிற்பதே உண்மையான நட்பு.',
    englishTranslation: 'True friendship rushes in instinctively to ease sorrow, like a hand steadying a slipping garment.',
    author: 'Thiruvalluvar',
    authorTamil: 'திருவள்ளுவர்',
    literaryWork: 'Thirukkural',
    literaryWorkTamil: 'திருக்குறள்',
    reference: 'Verse 788 (நட்பு)',
    themes: ['Friendship and Human Connection', 'Love and Compassion', 'Loneliness and Belonging'],
    shortExplanation:
      'A classic meditation on how genuine human companionship shows up quietly and without hesitation when life feels heavy.',
    firstStepReflection:
      'You do not have to carry everything alone; reaching toward someone who cares is a deeply human step.',
    sourceReference: 'Thirukkural, Chapter 79, Verse 788',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },
  {
    id: 'kural-611',
    kind: 'classical_excerpt',
    originalTamilText: 'அருமை உடைத்தென்று அசாவாமை வேண்டும்\nபெருமை முயற்சி தரும்.',
    tamilExplanation: 'இது கடினமானது என்று மனம் தளராமல், சிறிய முயற்சியைத் தொடர்வது மன வலிமையைத் தரும்.',
    englishTranslation: 'Do not lose heart thinking a path is too difficult; steady effort brings quiet strength.',
    author: 'Thiruvalluvar',
    authorTamil: 'திருவள்ளுவர்',
    literaryWork: 'Thirukkural',
    literaryWorkTamil: 'திருக்குறள்',
    reference: 'Verse 611 (ஆள்வினையுடைமை)',
    themes: ['Hope and New Beginnings', 'Courage and Inner Strength', 'Patience and Acceptance'],
    shortExplanation:
      'Encourages patience with ourselves when a task or season feels overwhelming, valuing small steady steps over perfection.',
    firstStepReflection:
      'Progress does not require solving everything today—one small, honest step is enough.',
    sourceReference: 'Thirukkural, Chapter 62, Verse 611',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },

  // B. Avvaiyar – Aathichoodi
  {
    id: 'avvaiyar-aathichoodi-1',
    kind: 'classical_excerpt',
    originalTamilText: 'ஆறுவது சினம்.',
    tamilExplanation: 'கோபம் என்பது காலப்போக்கில் தணிய வேண்டிய ஒரு உணர்வு; அதற்கு சிறிது அவகாசம் கொடுப்பது மனதிற்கு அமைதி தரும்.',
    englishTranslation: 'Anger is meant to cool and settle.',
    author: 'Avvaiyar',
    authorTamil: 'ஒளவையார்',
    literaryWork: 'Aathichoodi',
    literaryWorkTamil: 'ஆத்திசூடி',
    reference: 'Line 2',
    themes: ['Patience and Acceptance', 'Emotional Expression', 'Self-Understanding'],
    shortExplanation:
      'A concise two-word ethical line reminding us that intense emotions naturally soften when given space and stillness.',
    firstStepReflection:
      'Strong feelings do not have to be acted on immediately—pausing lets the heat settle into clarity.',
    sourceReference: 'Aathichoodi by Avvaiyar, Line 2',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },
  {
    id: 'avvaiyar-aathichoodi-2',
    kind: 'classical_excerpt',
    originalTamilText: 'ஊக்கமது கைவிடேல்.',
    tamilExplanation: 'மன ஊக்கத்தையும் நம்பிக்கையையும் ஒருபோதும் கைவிடாமல் மென்மையாகக் காத்துக்கொள்ளுங்கள்.',
    englishTranslation: 'Do not let go of your inner encouragement.',
    author: 'Avvaiyar',
    authorTamil: 'ஒளவையார்',
    literaryWork: 'Aathichoodi',
    literaryWorkTamil: 'ஆத்திசூடி',
    reference: 'Line 6',
    themes: ['Hope and New Beginnings', 'Courage and Inner Strength', 'Meaning and Purpose'],
    shortExplanation:
      'A timeless reminder to keep a small spark of self-kindness and hope alive even during tiring days.',
    firstStepReflection:
      'Even on low-energy days, showing up to check in with yourself is a quiet act of care.',
    sourceReference: 'Aathichoodi by Avvaiyar, Line 6',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },

  // C. Subramania Bharati
  {
    id: 'bharati-achamillai',
    kind: 'classical_excerpt',
    originalTamilText: 'அச்சமில்லை அச்சமில்லை அச்சமென்ப தில்லையே.',
    tamilExplanation: 'பயத்தை விட நமது உள்ளத்தின் உறுதி பெரிது என்ற நம்பிக்கையைத் தரும் பாரதியின் வரிகள்.',
    englishTranslation: 'There is no fear, no fear—let fear hold no dominion over the spirit.',
    author: 'Subramania Bharati',
    authorTamil: 'மகாகவி சுப்பிரமணிய பாரதியார்',
    literaryWork: 'Bharathiyar Kavithaigal (Achamillai)',
    literaryWorkTamil: 'பாரதியார் கவிதைகள் (அச்சமில்லை)',
    reference: 'Opening refrain',
    themes: ['Courage and Inner Strength', 'Facing Difficulties', 'Self-Understanding'],
    shortExplanation:
      'Bharati’s celebrated refrain evokes inner steadiness and dignity when uncertainty feels loud.',
    firstStepReflection:
      'Feeling afraid is human; reminding yourself of your own steadiness can help you take the next calm step.',
    sourceReference: 'Subramania Bharati, Achamillai (Public domain in India)',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain Tamil text (author d. 1921); original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },

  // D. Sangam Literature – Purananuru & Kurunthogai
  {
    id: 'purananuru-192',
    kind: 'classical_excerpt',
    originalTamilText: 'யாதும் ஊரே யாவரும் கேளிர்\nதீதும் நன்றும் பிறர்தர வாரா.',
    tamilExplanation: 'எல்லா ஊரும் நம் ஊரே, எல்லா மனிதரும் நம் உறவினரே; நம் மன அமைதியும் பார்வையும் நம்முள்ளிருந்தே பிறக்கின்றன.',
    englishTranslation: 'Every town is our home, and all people are kin; neither sorrow nor well-being comes solely from others.',
    author: 'Kaniyan Pungundranar',
    authorTamil: 'கணியன் பூங்குன்றனார்',
    literaryWork: 'Purananuru (Sangam Literature)',
    literaryWorkTamil: 'புறநானூறு (சங்க இலக்கியம்)',
    reference: 'Poem 192, Lines 1–2',
    themes: ['Loneliness and Belonging', 'Wisdom and Reflection', 'Friendship and Human Connection'],
    shortExplanation:
      'One of the most cherished Sangam poems, offering a vast sense of human belonging and grounded equanimity.',
    firstStepReflection:
      'When the world feels distant, remember that you still belong to a wider human community.',
    sourceReference: 'Purananuru, Poem 192',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Sangam text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },
  {
    id: 'kurunthogai-40',
    kind: 'classical_excerpt',
    originalTamilText: 'யாயும் ஞாயும் யாரா கியரோ\nசெம்புலப் பெயல்நீர் போல\nஅன்புடை நெஞ்சம் தாம் கலந்தனவே.',
    tamilExplanation: 'செம்மண் நிலத்தில் பெய்யும் மழைநீர் மண்ணோடு கலப்பது போல, அன்புள்ள உள்ளங்கள் இயல்பாக இணைகின்றன.',
    englishTranslation: 'Like rain falling upon red earth, loving hearts mingle and become one.',
    author: 'Sempulappeyanirar',
    authorTamil: 'செம்புலப்பெயல்நீரார்',
    literaryWork: 'Kurunthogai (Sangam Akam Literature)',
    literaryWorkTamil: 'குறுந்தொகை (சங்க அக இலக்கியம்)',
    reference: 'Poem 40',
    themes: ['Love and Compassion', 'Nature and Peace', 'Emotional Expression'],
    shortExplanation:
      'A tender Sangam Akam verse celebrating how human connection transforms and softens our inner world.',
    firstStepReflection:
      'Warmth and understanding often grow quietly, just like rain meeting dry earth.',
    sourceReference: 'Kurunthogai, Poem 40',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Sangam text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },

  // E. Thiruvachakam
  {
    id: 'thiruvachakam-sivapuranam',
    kind: 'classical_excerpt',
    originalTamilText: 'மெய்தான் அரும்பி விதிர்விதிர்த்து உன் விரைஆர் கழற்கென்\nகைதான் தலைவைத்துக் கண்ணீர் ததும்பி...',
    tamilExplanation: 'உள்ளத்தின் ஆழமான உணர்வுகளை மறைக்காமல் வெளிப்படுத்தும் போது மனம் இலேசாகிறது.',
    englishTranslation: 'When the heart is deeply moved and tears rise freely, honest feeling finds its voice.',
    author: 'Manikkavacakar',
    authorTamil: 'மாணிக்கவாசகர்',
    literaryWork: 'Thiruvachakam',
    literaryWorkTamil: 'திருவாசகம்',
    reference: 'Sivapuranam / Emotional reflection',
    themes: ['Emotional Expression', 'Meaning and Purpose', 'Nature and Peace'],
    shortExplanation:
      'Thiruvachakam is renowned in Tamil literary heritage for its unguarded emotional honesty and tenderness.',
    firstStepReflection:
      'Allowing yourself to feel honestly—without rushing to hide it—can be a quiet relief.',
    sourceReference: 'Thiruvachakam, Manikkavacakar',
    translationAttribution: 'Original English interpretation written for FirstStep',
    copyrightStatus: 'Public domain classical Tamil text; original English interpretation © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Exact quotation',
  },

  // Original FirstStep Taglines (never attributed to classical poets)
  {
    id: 'firststep-tagline-1',
    kind: 'original_tagline',
    originalTamilText: 'எல்லா உணர்வுகளையும் உடனே விளக்கத் தேவையில்லை — அமைதியாகத் தொடங்குவதே போதும்.',
    englishTranslation: 'You do not need the right words right away—beginning quietly is enough.',
    author: 'FirstStep',
    literaryWork: 'FirstStep Living Welcome',
    themes: ['Hope and New Beginnings', 'Self-Understanding'],
    shortExplanation: 'An original FirstStep welcome line for moments when thoughts feel tangled.',
    firstStepReflection: 'Navigation comes before destination. Take one calm step at a time.',
    sourceReference: 'FirstStep Original Copy',
    translationAttribution: 'Written for FirstStep',
    copyrightStatus: 'Original copy © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Original adaptation',
  },
  {
    id: 'firststep-tagline-2',
    kind: 'contemporary_reflection',
    originalTamilText: 'சில உணர்வுகளைச் சொல்ல வார்த்தைகள் கிடைக்காதபோது, காலம் கடந்த ஒரு வரி நம்மைப் புரிந்துகொள்ள உதவும்.',
    englishTranslation: 'Some feelings are difficult to explain. Sometimes, a line written long ago helps us begin.',
    author: 'FirstStep',
    literaryWork: 'Words That Understand',
    themes: ['Wisdom and Reflection', 'Emotional Expression', 'Patience and Acceptance'],
    shortExplanation: 'A contemporary FirstStep reflection inspired by the continuity of human emotion across centuries.',
    firstStepReflection: 'You are not the first person to feel this way, and you do not have to navigate it alone.',
    sourceReference: 'FirstStep Original Reflection',
    translationAttribution: 'Written for FirstStep',
    copyrightStatus: 'Original copy © FirstStep',
    reviewStatus: 'Approved for publication',
    contentType: 'Original adaptation',
  },
];

export function getApprovedLiteraryEntries(): LiteraryEntry[] {
  return LITERARY_COLLECTION.filter((e) => e.reviewStatus === 'Approved for publication');
}

const LAST_WELCOME_KEY = 'firststep_last_welcome_id_v1';

/**
 * Selects one stable Living Welcome entry per visit without repeating the previous visit's entry.
 */
export function selectLivingWelcomeForVisit(): LiteraryEntry {
  const approved = getApprovedLiteraryEntries();
  if (approved.length === 0) return LITERARY_COLLECTION[0];

  let lastId: string | null = null;
  try {
    lastId = localStorage.getItem(LAST_WELCOME_KEY);
  } catch {
    // ignore
  }

  const candidates = approved.length > 1 ? approved.filter((e) => e.id !== lastId) : approved;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  try {
    localStorage.setItem(LAST_WELCOME_KEY, chosen.id);
  } catch {
    // ignore
  }

  return chosen;
}
