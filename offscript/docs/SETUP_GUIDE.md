# Offscript: the complete setup & launch guide (no coding experience needed)

This guide takes you from "I have the code" to "Offscript is on the App Store and Google Play". Do the steps in order. Each step says **what** to do, **where** to click, and **why**.

> **Words you'll see**
> - **Terminal**: a window where you type commands. Mac: open **Terminal** (press ⌘+Space and type "Terminal"). Windows: open **PowerShell**.
> - **Command**: text in a grey box like `npm install`. Copy it, paste it into the terminal, press Enter.
> - **Folder / project**: the `offscript` folder that holds all the app's code.
> - **Supabase**: the online database that stores profiles, posts and messages.
> - **Expo**: the tool that turns the code into an iPhone and Android app.
> - **RevenueCat**: the service that handles the £4.99 subscriptions with Apple and Google.

---

## Step 0: What you need

- A laptop (Mac or Windows). You need a Mac only if you want to use the iPhone *simulator*. Building for the App Store happens in the cloud, so Windows works too.
- Your phone (iPhone or Android).
- About £100 for the Apple and Google developer accounts. You only need these at step 8, not for testing.
- A free account on each of:
  - **GitHub**: https://github.com (where the code lives)
  - **Supabase**: https://supabase.com
  - **Expo**: https://expo.dev

---

## Step 1: Install the tools (one time only)

1. **Node.js**: go to https://nodejs.org and download the **LTS** version. Open the installer and click Next until it's done.
2. **Visual Studio Code** (a text editor for the code): https://code.visualstudio.com
3. **Git** (downloads the code):
   - Mac: open Terminal and type `git --version`. If it asks to install "command line developer tools", click **Install**.
   - Windows: https://git-scm.com/download/win, then click Next through the installer.
4. **On your phone**: install **Expo Go** from the App Store / Google Play.

Check it worked: close and reopen the terminal, then run

```
node --version
```

You should see something like `v22.x.x`.

---

## Step 2: Get the code onto your laptop

In the terminal:

```
cd ~
git clone https://github.com/gayatrepuri/gayatrepuri.git
cd gayatrepuri
git checkout claude/offscript-academic-meetup-m8wybj
cd offscript
npm install
```

- `cd` means "go into this folder". `cd ~` goes to your home folder (e.g. `C:\Users\yourname`).
- Run `git clone` **only once**. If you run it again from inside the project, you get a second copy nested inside the first.
- `npm install` downloads all the building blocks the app needs. It takes 1–3 minutes, and yellow warnings are normal.

> **Windows: "npm.ps1 cannot be loaded because running scripts is disabled"**
> PowerShell blocks scripts by default. Run this once, then type `Y` if it asks:
> ```
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
> Then run `npm install` again. If that's not allowed on your computer, type `npm.cmd` instead of `npm` and `npx.cmd` instead of `npx` in every command in this guide.

Then open the folder in VS Code: **File → Open Folder…** and pick the `offscript` folder inside `gayatrepuri` (e.g. `C:\Users\yourname\gayatrepuri\offscript`).

---

## Step 3: Create your Supabase database

1. Go to https://supabase.com/dashboard and click **New project**.
   - Name: `offscript`
   - Database password: click **Generate**, then **save it in your password manager**.
   - Region: **West EU (London)**. This keeps data in the UK, which is good for speed and for UK GDPR.
   - Click **Create new project** and wait about 2 minutes.
2. Get your keys: **Project Settings (cog icon) → API Keys** (on some accounts it's under **Data API**). You need:
   - **Project URL**, e.g. `https://abcdxyz.supabase.co`
   - **anon / public key**, or the **publishable key** (`sb_publishable_…`). Either works.
   - ⚠️ **Never** use the `service_role` / secret key in the app.
3. In VS Code, find the file **`.env.example`**. Right-click it → **Copy**, then **Paste**, and rename the copy to exactly **`.env`**. Fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Save the file (⌘S / Ctrl+S). The `.env` file is deliberately never uploaded to GitHub.

---

## Step 4: Build the database tables (copy–paste, 1 minute)

1. In Supabase, click **SQL Editor** in the left sidebar, then **+ New query**.
2. In VS Code, open `supabase/migrations/0001_offscript_schema.sql`. Select everything (⌘A / Ctrl+A), copy it, and paste it into the Supabase SQL editor.
3. Click **Run**. You should see "Success. No rows returned".

That one file creates everything:

| Table | What it holds |
|---|---|
| `universities` | The London & Cambridge email domains allowed to sign up. Add more any time. |
| `profiles` | Everyone's answers (age, uni, favourite movie, place to cry…) and what they chose to show. |
| `posts` | Coffee runs, study sessions, events, spare formal hall tickets, user-study requests… |
| `post_attendees` | Who joined what. |
| `post_messages` | Group chat on each post. |
| `connections` | Match requests ("Say hi") and accepted matches. |
| `direct_messages` | Private chats between matches. |
| `blocks`, `reports` | Safety. Apple and Google require these. |
| `plan_limits` | The free-plan limits. Edit the numbers any time. |
| `allowed_emails` | Individual non-university emails you let in (e.g. app reviewers). |

It also locks the data down, so people can only read and change what they're allowed to. A gmail address can't sign up, and nobody can give themselves Plus.

---

## Step 5: Set up the login emails

Offscript logs people in with a **6-digit code** sent to their university email, so there are no passwords to forget.

1. Supabase → **Authentication → Sign In / Providers → Email**. Make sure **Email** is enabled. Save.
2. Supabase → **Authentication → Emails** (called **Email Templates** on some accounts) → **Magic Link** template. Replace the body with:

   ```html
   <h2>Your Offscript code</h2>
   <p>Here's your login code: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>It expires in 1 hour. If you didn't ask for this, ignore this email.</p>
   ```
   Do the same for the **Confirm signup** template. Save both.
   The `{{ .Token }}` part is what makes Supabase send a code instead of a link.
3. **Before real launch: set up proper email sending.** Supabase's built-in email only sends a handful of emails per hour, which is fine for testing but not for launch.
   - Make a free account at https://resend.com, add and verify a domain (e.g. `offscript.app`; domains cost about £10/year from Namecheap or Cloudflare), and create an API key.
   - Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
     host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key, sender `hello@yourdomain`.
   - University email filters are strict, and a proper domain stops your codes landing in junk.

---

## Step 6: Run the app on your phone 🎉

In the terminal (inside the `offscript` folder):

```
npx expo start
```

A QR code appears.
- **iPhone**: open the Camera app and point it at the QR code, then tap the banner.
- **Android**: open **Expo Go** and tap **Scan QR code**.

Your phone and laptop must be on the same Wi-Fi. If that doesn't work (e.g. on eduroam), stop it (Ctrl+C) and run `npx expo start --tunnel` instead.

Now try it: enter your university email, type in the code from your inbox, answer the questions, add a portrait, and pin a coffee run!

Things to play with: swipe people left/right on **Matches**, tap the stickers on a profile (they wiggle), and press **I'm in** on a post (a wax seal stamps onto it). Screenshots of the main screens are in `docs/screens/`.

**While `npx expo start` is running, every time you save a file in VS Code the app on your phone updates instantly.** Try it: open `src/lib/constants.ts`, change a word, and save.

To also see it in your web browser, press **w** in the terminal.

---

## Step 7: How the code is organised (so you know what to change)

```
offscript/
├── src/app/                ← every file here is a screen
│   ├── (auth)/index.tsx      Welcome + email screen
│   ├── (auth)/verify.tsx     Type in your code
│   ├── onboarding.tsx        The 4-step questions for new people
│   ├── (tabs)/index.tsx      Noticeboard (the main feed)
│   ├── (tabs)/matches.tsx    Matches + requests
│   ├── (tabs)/inbox.tsx      Chats
│   ├── (tabs)/profile.tsx    "Me": your profile, plan, sign out, delete account
│   ├── post/new.tsx          Make a post
│   ├── post/[id].tsx         A single post (join / leave / cancel)
│   ├── post/chat/[id].tsx    Group chat for a post
│   ├── person/[id].tsx       Someone's profile (say hi / report / block)
│   ├── dm/[id].tsx           Private chat
│   ├── edit-profile.tsx      Edit answers, photo, privacy
│   └── plus.tsx              The £4.99 Plus screen
├── src/lib/
│   ├── theme.ts              ← COLOURS & FONTS
│   ├── constants.ts          ← post types, research fields, interests, questions, Plus perks
│   ├── supabase.ts           connects to the database
│   ├── auth.tsx              keeps track of who's logged in
│   └── purchases.ts          subscriptions (RevenueCat)
├── src/components/           reusable pieces (buttons, cards, chat…)
├── supabase/migrations/      the database setup (Step 4)
├── supabase/functions/       the payment webhook (Step 8)
├── assets/                   app icon + splash screen
├── app.json                  app name, icon, bundle ID
└── docs/                     this guide + the pricing plan
```

**Easy changes you can make yourself:**
- **Colours**: `src/lib/theme.ts`. The maroon / butter / baby-blue palette comes from your mood board (Rosewood `#6B0B0C`, Lemon Chiffon `#FFF8CA`, Botticelli `#CDE3E8`, Tamarind, Coffee Bean…).
- **Fonts**: `src/lib/theme.ts`. They are:
  - **Mrs Saint Delafield**: the "Offscript" wordmark, a pen calligraphy like *Villa D'Cipoletti*.
  - **Della Respira**: headings only, like *Brioche*.
  - **Courier Prime**: a typewriter font for everything else.
  - **Sacramento**: the occasional handwritten touch ("we aren't there yet ✿").

  All are free Google Fonts. If you buy Brioche itself, put the `.otf` file in `assets/fonts/` and ask an AI assistant to "swap the heading font for this file".
- **Icons ("stickers")**: `src/components/Sticker.tsx`. They're drawn in code in the style of your mood board (wax seals, ticket stubs, postcards, a vinyl record, a bunny…), so they stay sharp at any size. Which sticker goes with which profile answer or post type is set in `src/lib/constants.ts` (e.g. favourite song → `headphones`, dream destination → `postcard`). Pictures of every sticker are in `docs/screens/stickers.png`.
- **Photos**: people add a portrait during sign-up (or later in Edit), and it's shown in an ornate gold frame (`src/components/GoldFrame.tsx`).
- **Post types, examples, research fields, interest tags, onboarding questions**: `src/lib/constants.ts`.
- **Allowed universities**: Supabase → **Table Editor → universities → Insert row**.
- **Free-plan limits**: Supabase → **Table Editor → plan_limits**.

---

## Step 8: Payments (Offscript Plus, £4.99/month)

Apple and Google **require** app subscriptions to go through their own payment systems. RevenueCat handles both for you.

### 8a. Developer accounts
- **Apple**: https://developer.apple.com/programs ($99/year). Enrol as an individual, or as a company if you set up a Ltd (needs a D-U-N-S number). Approval takes 1–2 days.
- **Google**: https://play.google.com/console ($25 one-off). New personal accounts must run a **closed test with 12 testers for 14 days** before going public, so recruit 12 friends early!
- Then join Apple's **Small Business Program** (https://developer.apple.com/app-store/small-business-program/) so Apple takes 15% instead of 30%. Google charges 15% on subscriptions automatically.

### 8b. Create the app in the stores
- **App Store Connect** (https://appstoreconnect.apple.com) → **Apps → +**. Name "Offscript", bundle ID `com.offscript.app`. If that's taken, choose another and change it in `app.json` too.
- Then **Subscriptions** → create a group "Offscript Plus" with two subscriptions:
  - `offscript_plus_monthly`: £4.99, 1 month
  - `offscript_plus_yearly`: £39.99, 1 year
  - Optional: add a 7-day free trial as an "Introductory Offer".
- **Google Play Console** → **Create app** → then **Monetise → Subscriptions** → the same two products.

### 8c. RevenueCat
1. Sign up at https://www.revenuecat.com and create a project called "Offscript".
2. Add an **App Store** app and a **Play Store** app, following their on-screen steps to connect each store.
3. **Product catalog → Entitlements → New**: identifier **`plus`** (exactly that).
4. Attach both products to the `plus` entitlement.
5. **Offerings → default** → add a **Monthly** package and an **Annual** package with your products.
6. **API keys**: copy the iOS key (`appl_…`) and the Android key (`goog_…`) into `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
   ```

### 8d. Tell the database when someone pays (webhook)
In the terminal, inside the `offscript` folder:
```
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase functions deploy revenuecat-webhook --no-verify-jwt
npx supabase secrets set REVENUECAT_WEBHOOK_SECRET=make-up-a-long-random-password-here
```
`YOUR_PROJECT_ID` is the `abcdxyz` part of your Supabase URL.

Then in RevenueCat → **Integrations → Webhooks → Add**:
- URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/revenuecat-webhook`
- Authorization header: `Bearer make-up-a-long-random-password-here` (the same secret as above, with the word `Bearer` and a space in front)

Now, when someone subscribes, the webhook switches on `is_plus` in their profile and the limits disappear.

> **Testing payments:** Expo Go only *pretends* to buy (RevenueCat's "preview mode"). To test real (sandbox) purchases you need a **development build**:
> `npx eas-cli@latest build --profile development --platform ios` (or `android`). Install it on your phone, then run `npx expo start` as usual.
>
> **Give yourself or a friend Plus by hand:** Supabase → Table Editor → profiles → set `is_plus` to `true`.

---

## Step 9: Build & publish to the App Store and Google Play

### 9a. One-time setup
```
npx eas-cli@latest login
npx eas-cli@latest init
```
This links the project to your Expo account.

The `.env` file isn't uploaded to the build servers, so give Expo your keys too. Run this once for each of the four lines in `.env`:
```
npx eas-cli@latest env:create --environment production --visibility plaintext --name EXPO_PUBLIC_SUPABASE_URL --value https://abcdxyz.supabase.co
```
Repeat with `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. Do it for `--environment preview` and `--environment development` too.

### 9b. Build
```
npx eas-cli@latest build --platform all --profile production
```
The first time, it asks to log into your Apple account and offers to create signing certificates. Say **yes** to everything. A build takes about 15–30 minutes in the cloud, and you get a link when it's done.

### 9c. Submit
```
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```
For Android, the first upload has to be done by hand in Play Console (Testing → Closed testing → Create release → upload the `.aab` file from the build page). After that, `submit` works.

### 9d. What the stores will ask you for
- **Privacy policy URL** and **support URL**. A free Notion page or Carrd site is fine. The privacy policy must say you store: university email, name, profile answers, photos, posts and messages, held by Supabase in London. It must also say people can delete their account in-app (Me → Delete my account).
- **A demo account for the reviewer.** They can't receive codes at a uni email, so:
  1. Supabase → Table Editor → `allowed_emails` → insert a row with `reviewer@yourdomain.com`.
  2. Supabase → **Authentication → Users → Add user → Create new user**, using that email, a password and **Auto Confirm User** ✅.
  3. Log in once yourself: on the landing page, wait for the letter to come out, then **press and hold the word Offscript on the letter**, and a password box appears. Then finish the questions.
  4. Give that email and password to Apple and Google in the review notes, with this line: "On the first screen, once the letter is out, press and hold the word Offscript to show the password field." 
- **Age rating**: the app has user chat and meetups, so answer the questionnaire honestly. Expect **17+ / Mature**. Say users must be 18+ in your terms.
- **Screenshots**: run the app, take screenshots on your phone (6.7" iPhone and an Android phone), and upload them.
- **App Privacy "nutrition label"** (Apple): Contact info (email), User content (photos, messages, other), Identifiers (user ID), all **linked to the user**, **not used for tracking**.
- **Apple's rules for apps with user content**: report (✅ built in), block (✅ built in), a way to contact you (put your email in the support URL), and you must act on reports within 24h. Check reports: Supabase → Table Editor → `reports`. To ban someone: Authentication → Users → … → **Delete user**.

### 9e. After launch: updating the app
- Small changes (text, colours, screens): `npx eas-cli@latest update --channel production` sends the update straight to users' phones, no review needed.
- New native features or a new app icon: build and submit again (steps 9b–9c).
- Database changes: edit in Supabase directly; no app update needed.

---

## Step 10: Running Offscript day to day

| Task | Where |
|---|---|
| See new users | Supabase → Authentication → Users |
| Check reports | Table Editor → `reports` |
| Remove a post | Table Editor → `posts` → delete the row |
| Ban someone | Authentication → Users → Delete user |
| Change free limits | Table Editor → `plan_limits` |
| Add a university | Table Editor → `universities` |
| Let one person in without a uni email | Table Editor → `allowed_emails` |
| See subscribers & revenue | RevenueCat dashboard |

**Legal checklist (UK):**
- Pay the **ICO data protection fee** (£40/year): https://ico.org.uk/fee
- Publish a privacy policy and terms (18+ only, be kind, no harassment, you can remove content).
- Consider setting up a Ltd company before you take money (Companies House, £50). It protects you personally.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Windows: "running scripts is disabled on this system" | See the box in Step 2 (`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`). |
| "Add your Supabase keys" message | The `.env` file is missing or misnamed (it must be exactly `.env`). Stop the app with Ctrl+C and run `npx expo start --clear`. |
| No code email | Check junk. Check step 5 (template has `{{ .Token }}`). The built-in Supabase email is rate-limited, so set up Resend. |
| "we aren't there yet" on the landing page | That email domain isn't in `universities`. Add it (Table Editor → universities). |
| Phone can't connect to the QR code | Use `npx expo start --tunnel`. |
| Weird errors after installing something | `npx expo install --fix`, then `npx expo start --clear`. |
| "Time to go Plus?" popup while testing | You hit a free limit. Set `is_plus = true` on your profile, or raise `plan_limits`. |
| Want help changing something | Open the project in VS Code with an AI coding assistant (like Claude Code) and describe the change in plain English. |
