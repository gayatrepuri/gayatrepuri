# Offscript pricing plan (freemium)

## The short version

| | **Free** | **Offscript Plus ✦** |
|---|---|---|
| Price | £0 | **£4.99 / month** (or **£39.99 / year**, about a third off) |
| Browse the noticeboard, see every post | ✅ unlimited | ✅ unlimited |
| Chat in meetup group chats & with matches | ✅ unlimited | ✅ unlimited |
| Post a meetup / coffee run / request | **3 per month** | Unlimited |
| Join meetups & RSVP to events | **5 per month** | Unlimited |
| Send match requests ("Say hi") | **5 per week** | Unlimited |
| Suggested matches | **Top 5** | Everyone (up to 100), filter by city |
| Host events (movie nights, socials) | **1 upcoming at a time** | Unlimited |
| ✦ badge next to your name | – | ✅ |

The database enforces every limit (see `plan_limits` in `supabase/migrations/0001_offscript_schema.sql`). Nobody can get round them by tinkering with the app. **You can change any number at any time without updating the app.** In Supabase, open **Table Editor → plan_limits** and edit the `free_limit` column.

---

## Why these numbers

**1. The free plan has to be good enough to fill the noticeboard.**
A meetup app is only worth paying for when there's something happening on it. If you paywall too hard at the start, the noticeboard stays empty, nobody pays, and the app dies. So the free plan covers the "typical" month for most people:
- About one coffee run or study session a week = 3 posts/month.
- Joining 1–2 things a week = 5 joins/month.

The people who hit the limits are your most social, most engaged users. They are exactly the ones who'll happily pay £5.

**2. Never paywall safety or replying.**
Messaging, reporting, blocking and reading stay free forever. If someone joined your coffee run, they must always be able to message the group, even on the free plan.

**3. £4.99, not £5.**
It's under the "£5 mental line", like most UK subscriptions. Apple and Google prices also come in fixed steps, and £4.99 is one of them.

**4. Offer a yearly plan.**
At £39.99/year, students who pay once don't churn over the summer. That matters a lot for an academic app, because July–September is dead.

## What you actually earn per subscriber

| | Monthly |
|---|---|
| Price the user pays | £4.99 |
| minus UK VAT (20%, Apple/Google handle it) | ≈ £4.16 |
| minus store fee (**15%** if you join Apple's *Small Business Program* and Google's equivalent, which you should) | ≈ **£3.53 to you** |

**Your running costs at launch:**

| Item | Cost |
|---|---|
| Apple Developer Program | $99 / year (~£79) |
| Google Play developer account | $25 one-off |
| Supabase | Free to start → **$25/month (Pro)** when you launch for real (backups, no pausing) |
| Expo / EAS builds | Free plan is enough to start |
| RevenueCat | Free until you make $2,500/month |
| Email sending (Resend) | Free up to 3,000 emails/month |
| ICO data protection fee (UK law if you store personal data) | £40 / year |

**Break-even ≈ 10 paying users.** If 3% of users subscribe (a normal freemium rate), that's about 350 active users across London + Cambridge.

## Launch strategy (recommended)

1. **Founding-member period: everyone gets Plus free for the first 2 months.**
   The easy way is to set all the free limits very high (e.g. 999) in `plan_limits`. When you're ready, put them back to 3 / 5 / 5 / 1. Announce it upfront ("free for founding members until 1 March") so it doesn't feel like a bait-and-switch.
2. **Start in Cambridge.** It's small and dense, and colleges, formal halls and Jack's Gelato are perfect for word of mouth. Then expand to UCL / KCL / Imperial / LSE, which are close to each other in central London.
3. **Add a 7-day free trial** to the subscription in App Store Connect / Play Console (an "introductory offer"). Trials typically double conversion.
4. **Go after the participant-recruiters.** Researchers looking for user-study participants have grant money and a real need. Later you can sell a "boosted post" (e.g. £9.99 to pin a "participants wanted" post for a week). That's a second income stream that doesn't charge students.

## Ideas for later

- **Ticketed events** (e.g. a £5 movie night). Real-world events can take payment by card through Stripe, and Apple/Google don't take a cut of those.
- **Society / department partnerships**: a grad society pays a small fee to post official events with a badge.
- **"Who viewed my post"**, saved searches and notifications for new posts matching your interests are all good Plus perks.

## Numbers to watch every week

- New sign-ups per university.
- **Posts per week**, and the % of posts that get at least 1 person joining (your health metric: aim for 60%+).
- Free users hitting a limit → % who open the Plus screen → % who buy.
- Subscribers cancelling within 30 days.
