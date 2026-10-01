// Lists the app uses: post types, research fields, interest tags and the
// "get to know you" questions. Edit these freely — no other code needs to change.
import type { PostKind } from './types';

export const CITIES = ['London', 'Cambridge'] as const;

export const POST_KINDS: {
  kind: PostKind;
  label: string;
  emoji: string;
  example: string;
}[] = [
  { kind: 'coffee', label: 'Coffee run', emoji: '☕', example: "Going to Jack's Gelato after lab — anyone want to chat physics?" },
  { kind: 'study', label: 'Work together', emoji: '📚', example: 'Heading to Waterstones Piccadilly to write my thesis, anyone wanna co-work?' },
  { kind: 'event', label: 'Event', emoji: '🎬', example: 'Movie night in the grad common room — Friday, bring snacks' },
  { kind: 'rant', label: 'Dissertation rant', emoji: '🌧️', example: 'Chapter 3 is eating me alive. Pub + group therapy?' },
  { kind: 'collab', label: 'Ideas & collabs', emoji: '💡', example: 'Want to start a podcast about weird history of science — co-hosts?' },
  { kind: 'ticket', label: 'Spare ticket', emoji: '🎟️', example: 'Extra formal hall ticket at Trinity this Thursday!' },
  { kind: 'study_participants', label: 'Participants wanted', emoji: '🧪', example: 'Looking for 10 people for a 20-min user study (£10 voucher)' },
  { kind: 'conference', label: 'Conference buddy', emoji: '🎤', example: "Going to NeurIPS alone and I'm shy — anyone else attending?" },
  { kind: 'other', label: 'Something else', emoji: '✨', example: 'Anything that is off the script' },
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
export const FUN_QUESTIONS: { key: FunKey; label: string; placeholder: string }[] = [
  { key: 'favourite_movie', label: 'Favourite movie', placeholder: 'Before Sunrise' },
  { key: 'favourite_song', label: 'Favourite song', placeholder: 'Motion Sickness — Phoebe Bridgers' },
  { key: 'cry_spot', label: 'Favourite place to cry at uni', placeholder: 'The 3rd floor library loos' },
  { key: 'dream_destination', label: 'Dream vacation destination', placeholder: 'Hokkaido in winter' },
  { key: 'comfort_order', label: 'Your coffee order', placeholder: 'Oat flat white, extra shot' },
];
export type FunKey =
  | 'favourite_movie'
  | 'favourite_song'
  | 'cry_spot'
  | 'dream_destination'
  | 'comfort_order';

// Fields people can choose to show or hide on their public profile.
export const VISIBILITY_OPTIONS: { key: string; label: string }[] = [
  { key: 'pronouns', label: 'Pronouns' },
  { key: 'age', label: 'Age' },
  { key: 'degree_stage', label: 'Degree stage' },
  { key: 'department', label: 'Department' },
  { key: 'college', label: 'College' },
  { key: 'research_field', label: 'Research field' },
  { key: 'research_topic', label: 'Research topic' },
  { key: 'interests', label: 'Interests' },
  { key: 'bio', label: 'Bio' },
  { key: 'favourite_movie', label: 'Favourite movie' },
  { key: 'favourite_song', label: 'Favourite song' },
  { key: 'cry_spot', label: 'Favourite place to cry' },
  { key: 'dream_destination', label: 'Dream destination' },
  { key: 'comfort_order', label: 'Coffee order' },
];

// Shown on the paywall. Keep in sync with plan_limits in the database.
export const PLUS_PRICE_LABEL = '£4.99 / month';
export const PLUS_PERKS = [
  'Unlimited meetups, coffee runs & requests',
  'Join as many meetups and events as you like',
  'Unlimited match requests + see every suggested match',
  'Host as many events as you want',
  'Filter matches by city (London ↔ Cambridge)',
  'A little butter-yellow ✦ next to your name',
];
