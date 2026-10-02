// AI matching: asks the server to (re)analyse your profile answers.
// Safe to call often: the server skips the work if nothing has changed.
import { supabase } from './supabase';

export async function refreshThemes() {
  try {
    await supabase.functions.invoke('analyse-profile', { body: {} });
  } catch {
    // AI matching is a bonus: if it isn't set up yet, matching still works without it
  }
}
