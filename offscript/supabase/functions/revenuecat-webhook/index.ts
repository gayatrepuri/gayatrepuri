// RevenueCat → Supabase webhook.
// When someone subscribes, renews, cancels or expires, RevenueCat calls this
// function and we switch `is_plus` on or off in their profile.
//
// Deploy (see docs/SETUP_GUIDE.md, step 8):
//   npx supabase functions deploy revenuecat-webhook --no-verify-jwt
//   npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=some-long-random-text
import { createClient } from 'npm:@supabase/supabase-js@2';

const ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
  // a cancellation still has access until the paid period runs out
  'CANCELLATION',
  'BILLING_ISSUE',
]);

Deno.serve(async (req) => {
  // RevenueCat sends the secret you typed in its dashboard as the Authorization header.
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('REVENUECAT_WEBHOOK_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { event } = await req.json();
  const userId: string | undefined = event?.app_user_id;
  if (!userId || userId.startsWith('$RCAnonymousID')) {
    return new Response('ignored: anonymous user', { status: 200 });
  }

  const expires = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
  const isPlus = event.type === 'EXPIRATION' ? false : ACTIVE_EVENTS.has(event.type) ? true : null;
  if (isPlus === null) return new Response(`ignored: ${event.type}`, { status: 200 });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await supabase
    .from('profiles')
    .update({ is_plus: isPlus, plus_expires_at: isPlus ? expires : null })
    .eq('id', userId);

  if (error) return new Response(error.message, { status: 500 });
  return new Response('ok', { status: 200 });
});
