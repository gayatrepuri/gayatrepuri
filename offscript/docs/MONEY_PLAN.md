# How Offscript makes money

## The short version

**Offscript is free for everyone, with no limits and no paid plan.** Money comes from two things, both sold by you directly:

1. **Sponsor cards**: ads from businesses students and researchers actually use (cafés, bookshops, tutoring, travel, software…), pinned between posts on the Board.
2. **Event sponsorships**: organisers pay to put their event in front of academics. That covers careers fairs, conferences, talks, balls, society nights and festivals.

Both show up as the same kind of card on the Board, always labelled **"Sponsored"**. Setting one up takes 2 minutes in Supabase (see [SETUP_GUIDE.md, Step 8](SETUP_GUIDE.md)).

---

## Why sell your own ads instead of using Google AdMob

| | **Your own sponsor cards (what's built)** | **An ad network (Google AdMob, etc.)** |
|---|---|---|
| Looks | Matches the scrapbook style, feels like part of the Board | Generic banners, cheapens the look |
| Relevance | You pick sponsors academics actually want | Random ads (mobile games, dropshipping…) |
| Money at small size | One local sponsor can pay more than thousands of AdMob impressions | Pennies per user per month until you're big |
| Privacy | No ad company gets any data, so no "Allow tracking?" pop-up and no cookie banner | Needs Apple's tracking prompt, a GDPR consent pop-up, and a privacy label that says you track people |
| Works in Expo Go | ✅ | ❌ needs a custom build |

**Recommendation:** stick with direct sponsors. Consider an ad network only once you have several thousand people using the app every week, and even then only as a filler for weeks when no sponsor is booked.

---

## What you can sell

| Product | What the sponsor gets | Who buys it |
|---|---|---|
| **Board card (1 week)** | A card on the Board for everyone at the universities they choose, with a link | Cafés, bookshops, tutoring companies, study apps, travel, gyms |
| **Sponsored event** | A card with date, place and a "Get tickets" button, from the day you agree until the event | Careers fairs, conferences, summer schools, balls, society events, festivals |
| **Member perk** | A "Member perk" card ("show Offscript at the till for 10% off") | Cafés and restaurants near campus. Great for your users too |
| **Recruiting** | A card for PhD programmes, research jobs, grad schemes or user-study panels | Universities, research labs, consultancies, tech companies |
| **Launch partner** (later) | Their logo on a themed week, plus several cards | One bigger brand per term |

### Starting prices (test and adjust)

These are rough starting points, not market data. Raise them as your user numbers grow, and always quote by **people reached** (the number the report gives you).

| | Small (under 500 people a week) | Growing (500–2,000) | Big (2,000+) |
|---|---|---|---|
| Board card, 1 week | £25–50 | £75–150 | £200+ |
| Sponsored event | £50–100 | £150–300 | £400+ |
| Member perk | free or swap (free coffee for your launch event) | £30–60/month | £100+/month |

**Your first 3–5 sponsors: give it away free or very cheap** in exchange for a quote you can use ("Offscript sent 40 people to our careers night"). Real numbers from the report are what sell the next ones.

---

## Who to pitch first

1. **Event organisers who already need academics in the room.** Think careers services, PhD open days, conference organisers, summer schools, and graduate society balls. They have budgets and a clear goal (tickets and sign-ups).
2. **Cafés and bookshops near campus.** Offer a free "Member perk" first, then charge once you can show taps.
3. **Researchers recruiting study participants.** They often have grant money for recruitment, and "Study participants wanted" is already a post type.
4. **Companies hiring PhDs and postdocs**: consultancies, quant firms, AI labs, biotech. A small spend for them, and very targeted.

**What to send:** a short email with one screenshot of a sponsor card, how many people you reach a week (from Supabase → Authentication → Users), the price, and an offer to report the numbers afterwards.

---

## The rules (keep sponsors and users happy)

- **Always labelled.** Every card says "Sponsored", "Sponsored event" or "Member perk · sponsored". UK ad rules (the ASA's CAP Code) require ads to be obviously ads. The app does this automatically.
- **No sponsor ever sees who saw their card.** They get totals only (views, people reached, taps). Never sell or share anyone's profile, email or answers.
- **Under-18s:** some users are 16–17. Tick `adults_only` for anything with alcohol, nightlife or gambling, and those users never see it. Simplest rule: don't take gambling ads at all.
- **Things to say no to:** gambling, crypto "investment" schemes, essay mills (illegal in England since 2022), dating apps (wrong vibe for Offscript), anything you wouldn't recommend to a friend.
- **Not too many.** The app shows a card after the 3rd post and then every 6 posts. If users complain, raise those numbers in `src/app/(tabs)/index.tsx` (`FIRST_AD_AFTER` and `AD_EVERY`).
- **Taking money:** send an invoice (free tools like Stripe Invoicing, Wave or Zoho work), get paid before the card goes live, and keep a simple spreadsheet. Once you're earning regularly, register as a sole trader with HMRC or set up a Ltd company.

---

## Your running costs (what you need to cover)

| | Cost |
|---|---|
| Apple Developer Program | $99 / year (~£79) |
| Google Play developer account | $25 one-off |
| Supabase | Free to start, then **$25/month (Pro)** once you launch for real |
| Claude API (AI matching) | A few pounds a month at small scale |
| Email sending (Resend / Brevo) | Free tier is enough to start |
| ICO data protection fee | £40 / year |

**Roughly £30–40 a month once launched**, so one or two small sponsors a month covers it all.

---

## Numbers to watch every week

- New sign-ups per university, and **people active each week** (your selling number).
- Posts per week, and the % of posts where at least 1 person joins (the app's health: aim for 60%+).
- For each sponsor card: people reached and tap rate (`select * from public.sponsor_report;`). A tap rate of 1–3% is decent for an ad. A perk or a well-targeted event can do much better.
- Sponsors who come back for a second booking. That's the real sign it's working.
