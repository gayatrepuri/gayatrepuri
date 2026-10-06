// waitlist-welcome: sends the "you're in ✿" email when someone joins the
// list on the launching-soon website.
//
//  1. The website calls this straight after a NEW sign-up, passing the secret
//     token that only that sign-up received (so nobody can use this to email
//     random people).
//  2. It marks the row as emailed (so the same person never gets it twice),
//     works out their place in the queue, and sends the email through Brevo.
//
// Deploy (see website/README.md, "The 'you're in' email"):
//   npx supabase functions deploy waitlist-welcome --no-verify-jwt
//   npx supabase secrets set BREVO_API_KEY=xkeysib-... SENDER_EMAIL=hello@yourdomain SITE_URL=https://yoursite
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
  const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL');
  const SENDER_NAME = Deno.env.get('SENDER_NAME') ?? 'Offscript';
  const SITE_URL = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  if (!BREVO_API_KEY || !SENDER_EMAIL || !SITE_URL) {
    console.error('Missing secret: set BREVO_API_KEY, SENDER_EMAIL and SITE_URL');
    return json({ error: 'not configured' }, 500);
  }

  const { token } = await req.json().catch(() => ({ token: null }));
  if (typeof token !== 'string' || !UUID.test(token)) return json({ error: 'bad token' }, 400);

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // claim the row: only succeeds once per person
  const { data: row, error } = await db
    .from('waitlist')
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq('token', token)
    .is('welcome_sent_at', null)
    .select('id, email, ref_code')
    .maybeSingle();
  if (error) {
    console.error(error);
    return json({ error: 'database' }, 500);
  }
  if (!row) return json({ sent: false }); // already emailed (or unknown token)

  const { count } = await db.from('waitlist').select('id', { count: 'exact', head: true }).lte('id', row.id);
  const position = count ?? row.id;
  const shareUrl = `${SITE_URL}/?ref=${row.ref_code}`;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      replyTo: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: row.email }],
      subject: "you're in ✿",
      htmlContent: html(position, shareUrl, SITE_URL),
      textContent: text(position, shareUrl, SITE_URL),
    }),
  });

  if (!res.ok) {
    console.error('Brevo said:', res.status, await res.text());
    // un-claim so it can be retried
    await db.from('waitlist').update({ welcome_sent_at: null }).eq('id', row.id);
    return json({ error: 'email failed' }, 502);
  }
  return json({ sent: true });
});

// ───────────────────────── the email ─────────────────────────
// Email apps ignore web fonts, so the calligraphy logo is a picture
// (website/email-logo.png) and the rest uses Georgia / Courier.

function text(position: number, shareUrl: string, site: string) {
  return `you're in ✿

You're #${position} on the Offscript list.

Coffee runs, study sessions, collabs and kindred minds, for academics. We'll write the moment the doors open.

Offscript is better with your people. Share your link:
${shareUrl}

—
You're getting this because you signed up at ${site}.
Not you, or want off the list? Just reply and we'll delete you.`;
}

function html(position: number, shareUrl: string, site: string) {
  const maroon = '#6B0B0C';
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>you're in</title></head>
<body style="margin:0;padding:0;background:#CDE3E8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#CDE3E8;padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FBF7EE;border-radius:14px;">
    <tr><td align="center" style="padding:36px 28px 6px;">
      <img src="${site}/email-logo.png" width="260" alt="Offscript" style="display:block;width:260px;max-width:80%;height:auto;border:0;">
    </td></tr>
    <tr><td align="center" style="padding:6px 28px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:34px;color:${maroon};">
      you're in ✿
    </td></tr>
    <tr><td align="center" style="padding:14px 28px 0;font-family:Georgia,serif;font-weight:bold;font-size:20px;color:#361319;">
      #${position} on the list
    </td></tr>
    <tr><td align="center" style="padding:16px 34px 0;font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.6;color:#7B694E;">
      coffee runs, study sessions, collabs &amp; kindred minds, for academics.<br>we'll write the moment the doors open.
    </td></tr>
    <tr><td align="center" style="padding:26px 28px 6px;">
      <a href="${shareUrl}" style="display:inline-block;background:${maroon};color:#FFF8CA;font-family:'Courier New',Courier,monospace;font-weight:bold;font-size:16px;text-decoration:none;padding:13px 26px;border-radius:999px;">Bring your people</a>
    </td></tr>
    <tr><td align="center" style="padding:4px 28px 32px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#4E7F91;">
      your link: <a href="${shareUrl}" style="color:#4E7F91;">${shareUrl.replace(/^https?:\/\//, '')}</a>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
    <tr><td align="center" style="padding:16px 20px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.6;color:#4E7F91;">
      You're getting this because you signed up at ${site.replace(/^https?:\/\//, '')}.<br>Not you, or want off the list? Just reply and we'll delete you.
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}
