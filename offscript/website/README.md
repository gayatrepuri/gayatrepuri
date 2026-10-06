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

### 3. Publish it on Netlify
1. Go to https://app.netlify.com/drop and log in.
2. In File Explorer, open `C:\Users\gayat\gayatrepuri\offscript`. **Drag the whole `website` folder** onto the Netlify page.
3. After a few seconds you get a link like `https://random-name-123.netlify.app`. That's your site!
4. To change the name: **Site configuration → Change site name** (e.g. `offscript` → `offscript.netlify.app`).
5. Got your own domain (e.g. offscript.co.uk)? **Domain management → Add a domain**, and follow the steps.

**To update the site later:** on your site's Netlify page, go to **Deploys** and drag the `website` folder onto the box that says "Need to update your site? Drag and drop your site output folder here".

### 4. Make link previews look nice (once you know your web address)
In `website/index.html`, find `content="og-image.jpg"` and change it to the full address, e.g. `content="https://offscript.netlify.app/og-image.jpg"`. Then upload again (step 3). WhatsApp, iMessage and Instagram will then show the envelope picture when someone shares your link.

## Check it works
Open your site, wait for the letter, type your email and press **Save my spot**. Then in Supabase → **Table Editor → waitlist** your email should be there.

While the key is missing, a red "Preview mode" bar shows at the top and nothing is saved.

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
