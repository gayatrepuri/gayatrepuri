// Shapes of the data that comes back from the database.

export type City = 'London' | 'Cambridge';

export type PostKind =
  | 'coffee'
  | 'study'
  | 'event'
  | 'rant'
  | 'collab'
  | 'ticket'
  | 'study_participants'
  | 'conference'
  | 'poll'
  | 'other';

export type Profile = {
  id: string;
  email_domain: string;
  university: string;
  city: City;
  display_name: string;
  pronouns: string | null;
  avatar_url: string | null;
  degree_stage: string | null;
  department: string | null;
  college: string | null;
  research_field: string | null;
  research_topic: string | null;
  interests: string[];
  bio: string | null;
  age: number | null;
  favourite_movie: string | null;
  favourite_song: string | null;
  cry_spot: string | null;
  dream_destination: string | null;
  comfort_order: string | null;
  visible_fields: string[];
  onboarded: boolean;
  is_plus: boolean;
  plus_expires_at: string | null;
};

// What other people can see (hidden answers come back as null)
export type PublicProfile = Omit<
  Profile,
  'email_domain' | 'visible_fields' | 'onboarded' | 'plus_expires_at'
>;

export type FeedPost = {
  id: string;
  author_id: string;
  kind: PostKind;
  title: string;
  body: string | null;
  location: string | null;
  city: City;
  starts_at: string | null;
  capacity: number | null;
  tags: string[];
  is_cancelled: boolean;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_university: string;
  author_field: string | null;
  attendee_count: number;
  i_joined: boolean;
  vote_count?: number; // polls (after 0003_polls_and_view_fix.sql)
};

export type Match = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  university: string;
  city: City;
  degree_stage: string | null;
  research_field: string | null;
  research_topic: string | null;
  interests: string[];
  shared_interests: string[];
  shared_themes?: string[]; // from AI matching (missing until 0002_ai_matching.sql is run)
  score: number;
};

export type Connection = {
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  note: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

// A sponsor card on the Board (an ad, a sponsored event or a member perk).
// You add these in Supabase → Table Editor → sponsored.
export type Sponsored = {
  id: string;
  sponsor_name: string;
  kind: 'ad' | 'event' | 'perk';
  title: string;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  button_label: string | null;
  event_starts_at: string | null;
  event_location: string | null;
  weight: number;
};
