// ─────────────────────────────────────────────────────────────
//  Offscript website settings: the only file you need to edit.
// ─────────────────────────────────────────────────────────────
window.OFFSCRIPT = {
  // Supabase → Project Settings → API Keys.
  // Use the same two values as EXPO_PUBLIC_SUPABASE_URL and
  // EXPO_PUBLIC_SUPABASE_ANON_KEY in the app's .env file.
  // (The publishable key is safe to put on a website: the
  // database only lets it join the list, never read it.)
  SUPABASE_URL: 'https://kcmdqjxdqcpqkjzqavze.supabase.co',
  SUPABASE_KEY: '',

  // Show "N academics already waiting" only once the list is at least this big
  // (a small number can put people off).
  SHOW_COUNT_FROM: 25,

  // Optional. Leave '' to hide.
  CONTACT_EMAIL: '', // e.g. 'hello@offscript.app': shown in the footer
  INSTAGRAM: '', // e.g. 'https://instagram.com/offscript.app'
};
