# The Offscript "launching soon" website

A one-page site: the envelope opens, the letter slides out, and people save their spot on the pre-registration list. Below that, the page shows the noticeboard, matching and profile questions to get people excited.

Everything for the site is in this `website` folder. It's separate from the app.

## Put it online (about 10 minutes)

### 1. Create the list in your database
Supabase → **SQL Editor → + New query**. Paste everything from `supabase/migrations/0005_waitlist.sql` and click **Run**.

### 2. Add your key
Open `website/config.js` in VS Code. Between the quotes after `SUPABASE_KEY:`, paste the **same key** as `EXPO_PUBLIC_SUPABASE_ANON_KEY` in your app's `.env` file:
```
SUPABASE_KEY: 'sb_publishable_xxxxxxxx',
```
Save the file. (The key is safe on a website: the database only lets it *join* the list, never read it.)

Optional in the same file: `CONTACT_EMAIL` and `INSTAGRAM` add links to the footer.

### 3. Publish it on Cloudflare Pages (free)
1. Go to https://dash.cloudflare.com/sign-up and make a free account (confirm your email).
2. In the left menu, open **Workers & Pages** (it may sit under **Compute**). Click **Create**, choose the **Pages** tab, then **Upload assets** (sometimes called "Drag and drop your files").
3. Give the project a name, e.g. `offscript`. This becomes your address: `offscript.pages.dev`. Click **Create project**.
4. In File Explorer, open `C:\Users\gayat\gayatrepuri\offscript`. **Drag the whole `website` folder** onto the upload box (or click **select from computer → folder**), then click **Deploy site**.
5. After a few seconds it says "Success" with your link. Open it and the envelope should play.

Cloudflare sometimes renames its menus. If a button above looks different, look for "Pages" and "upload" and you'll be on the right track.

**To update the site later:** Workers & Pages → your project → **Create deployment** (or "Create new deployment") → drag the `website` folder in again → **Save and deploy**.

**Your own address (e.g. offscript.co.uk):** in Cloudflare, go to **Domain Registration → Register Domains** and buy one (about £5–£10 a year, sold at cost). Then: Workers & Pages → your project → **Custom domains → Set up a custom domain** → type it in → **Activate**. Because the domain is with Cloudflare, it sets everything up for you.

*(Prefer Netlify? Drag the `website` folder onto https://app.netlify.com/drop instead. Everything else in this guide is the same.)*

### 4. Make link previews look nice (once you know your web address)
In `website/index.html`, find `content="og-image.jpg"` and change it to the full address, e.g. `content="https://offscript.pages.dev/og-image.jpg"`. Then upload again (step 3). WhatsApp, iMessage and Instagram will then show the envelope picture when someone shares your link.

## Check it works
Open your site, wait for the letter, type your email and press **Save my spot**. Then in Supabase → **Table Editor → waitlist** your email should be there.

While the key is missing, a red "Preview mode" bar shows at the top and nothing is saved.

## Where the emails are stored
Every sign-up is saved in **your Supabase database**, in a table called `waitlist`: the same place as the app's data. It is not stored on Cloudflare or Netlify, so you can move or rebuild the website any time without losing anyone.
- The website can only **add** people. Nobody can read the list from the website, only you, when logged in to Supabase.
- Supabase backs it up (daily backups on the Pro plan). Also click **Export → CSV** now and then to keep your own copy.

## The "you're in ✿" email (about 15 minutes)
When someone new joins, they automatically get an on-brand email with their place in the list and their "Bring your people" link. People already on the list don't get it again.

**1. Make a free Brevo account** (the email-sending service: free for up to 300 emails a day)
1. Sign up at https://www.brevo.com.
2. **Senders, domains & dedicated IPs → Domains → Add a domain**. Add the domain you bought (e.g. `offscript.co.uk`) and follow the steps. If your domain is on Cloudflare, Brevo can usually add the records for you automatically, or you copy them into Cloudflare → your domain → **DNS → Records**.
   - No domain yet? Use **Senders → Add a sender** with your Gmail to test. It works, but many of those emails will land in spam, so get a domain before you share the site widely.
3. **SMTP & API → API Keys → Generate a new API key**. Name it `offscript-website` and copy it (it starts with `xkeysib-`).

**2. Add the column that remembers who's been emailed**
Supabase → SQL Editor → + New query → paste `supabase/migrations/0006_waitlist_welcome.sql` → **Run**.

**3. Put the email function online**
In the VS Code terminal, inside the `offscript` folder (if you did the AI step, you're already logged in and linked, so skip the first two lines):
```
npx supabase login
npx supabase link --project-ref kcmdqjxdqcpqkjzqavze
npx supabase functions deploy waitlist-welcome --no-verify-jwt
npx supabase secrets set BREVO_API_KEY=xkeysib-your-key SENDER_EMAIL=hello@offscript.co.uk SITE_URL=https://offscript.pages.dev
```
Use your real key, the email address you set up in Brevo, and your website's address (no `/` at the end).

**4. Test it**
Sign up on your website with an email you haven't used before. The "you're in ✿" email should arrive within a minute (check spam the first time). In Supabase → Table Editor → `waitlist`, that row's `welcome_sent_at` now has a time in it.

If nothing arrives: Supabase → **Edge Functions → waitlist-welcome → Logs** says what went wrong. "Missing secret" means step 3's last command needs re-running. "Brevo said: 401" means the API key is wrong. "Brevo said: 400 … sender" means the sender email isn't verified in Brevo.

**To change the wording or design of the email:** it's at the bottom of `supabase/functions/waitlist-welcome/index.ts`. Edit the text, then run the `deploy` line from step 3 again.

## See who signed up
- **Everyone:** Supabase → Table Editor → `waitlist`. Click **Export → CSV** to download a spreadsheet.
- **Summary** (universities, what people want, where they came from, who brought the most friends): SQL Editor →
  ```
  select * from public.waitlist_summary;
  ```

## Tricks for promoting it
- **Track where people come from:** add `?src=` to the link you post, e.g. `offscript.netlify.app/?src=instagram` in your Instagram bio and `?src=flyer` on a poster QR code. The summary then shows which worked best.
- **Friends bringing friends:** after signing up, people get a **Bring your people** button with their own link (`?ref=…`). The summary shows your top referrers, so you could reward them with early access or a shout-out.
- **The "N academics already waiting" line** appears on the letter once 25 people have joined. Change the number in `config.js` (`SHOW_COUNT_FROM`).

## When the app launches
Export the `waitlist` table as CSV and email everyone (Brevo or Mailchimp both have free plans). The privacy note in the footer promises you'll only email them about the launch, so keep to that.
