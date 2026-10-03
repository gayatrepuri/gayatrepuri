// Lists the app uses: post types, research fields, interest tags and the
// "get to know you" questions. Edit these freely — no other code needs to change.
import type { StickerName } from '../components/Sticker';
import type { PostKind } from './types';

export const POST_KINDS: {
  kind: PostKind;
  label: string;
  sticker: StickerName;
  example: string;
}[] = [
  { kind: 'coffee', label: 'Coffee run', sticker: 'coffee', example: "Jack's Gelato after lab — chat physics?" },
  { kind: 'study', label: 'Work together', sticker: 'books', example: 'Thesis writing at Waterstones, join?' },
  { kind: 'event', label: 'Event', sticker: 'discoball', example: 'Movie night, grad common room, Friday' },
  { kind: 'rant', label: 'Rant', sticker: 'matchbook', example: 'Chapter 3 is eating me alive. Pub?' },
  { kind: 'collab', label: 'Ideas', sticker: 'key', example: 'Starting a science podcast — co-hosts?' },
  { kind: 'ticket', label: 'Spare ticket', sticker: 'ticket', example: 'Extra formal hall ticket, Thursday' },
  { kind: 'study_participants', label: 'Participants', sticker: 'envelope', example: '20-min user study, £10 voucher' },
  { kind: 'conference', label: 'Conference buddy', sticker: 'postcard', example: 'Going to NeurIPS alone — anyone?' },
  { kind: 'poll', label: 'Poll', sticker: 'poll', example: 'Best library to work in?' },
  { kind: 'other', label: 'Other', sticker: 'seashell', example: 'Anything off the script' },
];

export const kindInfo = (kind: PostKind) =>
  POST_KINDS.find((k) => k.kind === kind) ?? POST_KINDS[POST_KINDS.length - 1];

export const DEGREE_STAGES = [
  'Undergrad',
  "Master's",
  'PhD — year 1',
  'PhD — year 2',
  'PhD — year 3',
  'PhD — year 4+',
  'Writing up',
  'Postdoc',
  'Research staff',
  'Faculty',
];

export const RESEARCH_FIELDS = [
  'Physics & Astronomy',
  'Maths & Statistics',
  'Computer Science & AI',
  'Engineering',
  'Chemistry',
  'Biology & Life Sciences',
  'Medicine & Health',
  'Public Health',
  'Neuroscience',
  'Psychology',
  'Environmental Science',
  'Earth Sciences & Geography',
  'Economics',
  'Business & Management',
  'Law',
  'Politics & International Relations',
  'Sociology & Anthropology',
  'Education',
  'History',
  'Archaeology & Classics',
  'Philosophy',
  'Theology & Religious Studies',
  'Literature & Languages',
  'Linguistics',
  'Media & Communications',
  'Art, Design & Architecture',
  'Music & Performance',
  'Film & Cultural Studies',
  'Something else',
];

// Interests, grouped so the long list stays easy to browse (there's a search box too).
export const INTEREST_GROUPS: { title: string; tags: string[] }[] = [
  {
    title: 'Sciences',
    tags: [
      'physics', 'quantum physics', 'astrophysics', 'astronomy', 'particle physics', 'condensed matter',
      'chemistry', 'organic chemistry', 'biochemistry', 'materials science', 'nanotechnology',
      'mathematics', 'pure maths', 'applied maths', 'statistics', 'biology', 'molecular biology',
      'cell biology', 'microbiology', 'genetics', 'genomics', 'evolution', 'ecology', 'zoology',
      'botany', 'marine biology', 'neuroscience', 'immunology', 'pharmacology', 'environmental science',
      'climate science', 'earth sciences', 'geology', 'oceanography', 'meteorology', 'sustainability',
      'conservation', 'agriculture', 'food science',
    ],
  },
  {
    title: 'Tech & engineering',
    tags: [
      'computer science', 'artificial intelligence', 'machine learning', 'data science', 'robotics',
      'cybersecurity', 'human-computer interaction', 'software engineering', 'electrical engineering',
      'mechanical engineering', 'civil engineering', 'chemical engineering', 'biomedical engineering',
      'aerospace', 'energy & renewables', 'architecture', 'urban planning', 'design',
    ],
  },
  {
    title: 'Health',
    tags: [
      'medicine', 'public health', 'epidemiology', 'global health', 'nursing', 'psychiatry',
      'mental health', 'nutrition', 'sports science', 'dentistry', 'veterinary science',
    ],
  },
  {
    title: 'Social sciences',
    tags: [
      'psychology', 'cognitive science', 'sociology', 'anthropology', 'economics', 'behavioural economics',
      'finance', 'business & management', 'politics', 'international relations', 'public policy', 'law',
      'human rights', 'criminology', 'development studies', 'gender studies', 'geography', 'education',
      'social work', 'migration studies', 'media & communications',
    ],
  },
  {
    title: 'Humanities',
    tags: [
      'history', 'art history', 'archaeology', 'classics', 'philosophy', 'ethics', 'religious studies',
      'theology', 'literature', 'english', 'creative writing', 'linguistics', 'modern languages',
      'film studies', 'music', 'theatre & performance', 'cultural studies', 'museum studies',
    ],
  },
  {
    title: 'Skills & methods',
    tags: [
      'qualitative methods', 'quantitative methods', 'stats help', 'R / Python', 'LaTeX', 'writing support',
      'lab techniques', 'fieldwork', 'interviews & surveys', 'grant writing', 'teaching', 'science comms',
      'open science', 'academic publishing', 'presenting',
    ],
  },
  {
    title: 'Beyond the thesis',
    tags: [
      'startups', 'podcasting', 'coffee', 'running', 'climbing', 'cycling', 'swimming', 'yoga', 'gym',
      'football', 'rowing', 'hiking', 'dancing', 'films', 'live music', 'museums', 'theatre', 'board games',
      'gaming', 'cooking', 'baking', 'pub quizzes', 'books', 'poetry', 'photography', 'art', 'crafts',
      'travel', 'languages', 'volunteering', 'choir', 'formal halls',
    ],
  },
];

// every interest in one list (used for post tags)
export const INTEREST_TAGS = [...new Set(INTEREST_GROUPS.flatMap((g) => g.tags))];

// The onboarding questions. `key` matches a column in the profiles table.
export const FUN_QUESTIONS: { key: FunKey; label: string; placeholder: string; sticker: StickerName }[] = [
  { key: 'favourite_movie', label: 'Favourite movie', placeholder: 'Before Sunrise', sticker: 'ticket' },
  { key: 'favourite_song', label: 'Favourite song', placeholder: 'Motion Sickness', sticker: 'headphones' },
  { key: 'cry_spot', label: 'Favourite place to cry', placeholder: '3rd floor library loos', sticker: 'waxheart' },
  { key: 'dream_destination', label: 'Dream destination', placeholder: 'Hokkaido in winter', sticker: 'postcard' },
  { key: 'comfort_order', label: 'Coffee order', placeholder: 'Oat flat white', sticker: 'coffee' },
];
export type FunKey =
  | 'favourite_movie'
  | 'favourite_song'
  | 'cry_spot'
  | 'dream_destination'
  | 'comfort_order';

// Every profile field: its label, its sticker, and whether people can hide it.
export const PROFILE_FIELDS: { key: string; label: string; sticker: StickerName }[] = [
  { key: 'pronouns', label: 'Pronouns', sticker: 'button' },
  { key: 'age', label: 'Age', sticker: 'bow' },
  { key: 'degree_stage', label: 'Stage', sticker: 'clip' },
  { key: 'department', label: 'Department', sticker: 'books' },
  { key: 'college', label: 'College', sticker: 'swan' },
  { key: 'research_field', label: 'Field', sticker: 'butterfly' },
  { key: 'research_topic', label: 'Working on', sticker: 'waxseal' },
  { key: 'bio', label: 'About', sticker: 'envelope' },
  { key: 'interests', label: 'Interests', sticker: 'hibiscus' },
  ...FUN_QUESTIONS.map(({ key, label, sticker }) => ({ key, label, sticker })),
];
export const VISIBILITY_OPTIONS = PROFILE_FIELDS;

// Shown on the paywall. Keep in sync with plan_limits in the database.
export const PLUS_PRICE_LABEL = '£4.99 / month';
export const PLUS_PERKS: { text: string; sticker: StickerName }[] = [
  { text: 'Unlimited posts', sticker: 'postcard' },
  { text: 'Join anything', sticker: 'ticket' },
  { text: 'Unlimited hellos', sticker: 'envelope' },
  { text: 'See every match', sticker: 'bulb' },
  { text: 'Host more events', sticker: 'champagne' },
  { text: 'A little ✦ badge', sticker: 'star' },
];
