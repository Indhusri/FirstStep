export interface ProgrammeDay {
  day: number;
  title: string;
  activity: string;
  reflectionQuestion: string;
  practicalExercise: string;
}

export interface GuidedProgramme {
  id: string;
  title: string;
  durationDays: number;
  category: string;
  isFreePreview?: boolean;
  introduction: string;
  days: ProgrammeDay[];
}

export const GUIDED_PROGRAMMES: GuidedProgramme[] = [
  {
    id: 'stress-awareness-7',
    title: '7-Day Stress Awareness Journey',
    durationDays: 7,
    category: 'Stress',
    isFreePreview: true,
    introduction:
      'A gentle seven-day self-guided exploration to notice how everyday tension builds up and practise small, realistic pauses.',
    days: [
      {
        day: 1,
        title: 'Noticing Early Signals',
        activity: 'Pause twice today to notice where tension sits in your shoulders, jaw, or breath.',
        reflectionQuestion: 'What is the earliest physical or mental sign that your day is becoming crowded?',
        practicalExercise: 'Take three slow 4-4-6 breaths before opening your next message or task.',
      },
      {
        day: 2,
        title: 'Sorting What Can Wait',
        activity: 'Write down everything competing for your attention and circle only two items that truly belong to today.',
        reflectionQuestion: 'Which expectation am I carrying today that could wait until tomorrow?',
        practicalExercise: 'Move one non-urgent task off today’s list intentionally.',
      },
      {
        day: 3,
        title: 'Micro-Transitions',
        activity: 'Create a 60-second buffer between finishing one responsibility and starting the next.',
        reflectionQuestion: 'How does my energy shift when I give myself one quiet minute between tasks?',
        practicalExercise: 'Stand up, stretch your wrists and neck, and look away from screens for 60 seconds.',
      },
    ],
  },
  {
    id: 'better-sleep-7',
    title: '7-Day Better Sleep Habits Journey',
    durationDays: 7,
    category: 'Daily Routine',
    introduction:
      'Build a calmer evening wind-down rhythm with small, sustainable habits that help your mind transition toward rest.',
    days: [
      {
        day: 1,
        title: 'Setting a Gentle Sunset Cue',
        activity: 'Choose a consistent time 30 minutes before bed to dim bright screens.',
        reflectionQuestion: 'What usually keeps my mind alert when I am physically ready to rest?',
        practicalExercise: 'Place your phone slightly out of arm’s reach for the last 20 minutes tonight.',
      },
      {
        day: 2,
        title: 'The Evening Unload',
        activity: 'Write three brief lines on paper to park tomorrow’s reminders outside your head.',
        reflectionQuestion: 'What thought tends to loop most often at night?',
        practicalExercise: 'Jot down one reminder for tomorrow morning and close your notebook.',
      },
    ],
  },
  {
    id: 'emotional-awareness-14',
    title: '14-Day Emotional Awareness Journey',
    durationDays: 14,
    category: 'Emotional Balance',
    introduction:
      'Practise naming subtle emotions with curiosity rather than self-criticism, inspired by mindful reflection and Sangam Akam landscapes.',
    days: [
      {
        day: 1,
        title: 'Beyond “Good” or “Bad”',
        activity: 'Choose one more specific word for how you feel today—such as restless, tender, stretched, or steady.',
        reflectionQuestion: 'What changes when I name a feeling accurately instead of pushing it away?',
        practicalExercise: 'Write one sentence starting with: “Right now, I notice a feeling of…”',
      },
      {
        day: 2,
        title: 'Inner Landscapes',
        activity: 'Reflect on how Sangam poetry mirrors inner moods through nature—seasons shift, and so do feelings.',
        reflectionQuestion: 'If my mood today were a weather pattern, what would it look like?',
        practicalExercise: 'Spend two minutes looking out a window without trying to solve anything.',
      },
    ],
  },
  {
    id: 'self-reflection-14',
    title: '14-Day Self-Reflection Journey',
    durationDays: 14,
    category: 'Self-Reflection',
    introduction:
      'Two weeks of structured, unhurried questions designed to help you hear your own thoughts clearly.',
    days: [
      {
        day: 1,
        title: 'What Gave Energy Today',
        activity: 'Notice one conversation, task, or quiet moment that left you feeling slightly steadier.',
        reflectionQuestion: 'What small part of my day felt most authentic to me?',
        practicalExercise: 'Record two sentences in your Personal Journal before the evening ends.',
      },
    ],
  },
  {
    id: 'gratitude-journaling-7',
    title: '7-Day Gratitude and Journaling Journey',
    durationDays: 7,
    category: 'Journaling',
    introduction:
      'A grounded, non-toxic approach to gratitude—acknowledging small steady moments without ignoring real difficulties.',
    days: [
      {
        day: 1,
        title: 'One Ordinary Comfort',
        activity: 'Notice one small sensory comfort today—warm tea, shade, music, or a quiet chair.',
        reflectionQuestion: 'What ordinary detail did I appreciate today even if the day was busy?',
        practicalExercise: 'Save a short entry under “What I am grateful for” in your Journal.',
      },
    ],
  },
  {
    id: 'social-connections-14',
    title: '14-Day Building Social Connections Journey',
    durationDays: 14,
    category: 'Social Connection',
    introduction:
      'Low-pressure steps to bridge isolation and nurture meaningful everyday connection at your own pace.',
    days: [
      {
        day: 1,
        title: 'A Low-Stakes Hello',
        activity: 'Think of one person you appreciate and send a brief, zero-pressure message.',
        reflectionQuestion: 'What makes reaching out feel easier or harder for me right now?',
        practicalExercise: 'Send a one-line check-in with no expectation of an immediate reply.',
      },
    ],
  },
];
