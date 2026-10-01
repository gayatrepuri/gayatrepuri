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
  { kind: 'event', label: 'Event', sticker: 'vinyl', example: 'Movie night, grad common room, Friday' },
  { kind: 'rant', label: 'Rant', sticker: 'matchbook', example: 'Chapter 3 is eating me alive. Pub?' },
  { kind: 'collab', label: 'Ideas', sticker: 'waxseal', example: 'Starting a science podcast — co-hosts?' },
  { kind: 'ticket', label: 'Spare ticket', sticker: 'ticket', example: 'Extra formal hall ticket, Thursday' },
  { kind: 'study_participants', label: 'Participants', sticker: 'envelope', example: '20-min user study, £10 voucher' },
  { kind: 'conference', label: 'Conference buddy', sticker: 'postcard', example: 'Going to NeurIPS alone — anyone?' },
  { kind: 'other', label: 'Other', sticker: 'button', example: 'Anything off the script' },
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
  'Neuroscience & Psychology',
  'Earth & Environment',
  'Economics & Business',
  'Law',
  'Politics & International Relations',
  'Sociology & Anthropology',
  'History',
  'Philosophy',
  'Literature & Languages',
  'Art, Design & Architecture',
  'Music & Performance',
  'Education',
  'Something else',
];

export const INTEREST_TAGS = [
  'machine learning', 'climate', 'quantum', 'genetics', 'public health', 'policy',
  'qualitative methods', 'stats help', 'R / Python', 'LaTeX', 'writing support',
  'startups', 'podcasting', 'science comms', 'teaching', 'open science',
  'coffee', 'running', 'climbing', 'films', 'live music', 'museums', 'board games',
  'cooking', 'pub quizzes', 'books', 'yoga', 'formal halls', 'travel', 'art',
];

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
  { text: 'See every match', sticker: 'waxheart' },
  { text: 'Host more events', sticker: 'vinyl' },
  { text: 'A little ✦ badge', sticker: 'sparkle' },
];
