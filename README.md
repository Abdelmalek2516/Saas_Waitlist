# LaunchKit — SaaS Waitlist

A production-ready referral waitlist built with **Next.js 16**, **Clerk**, **MongoDB/Mongoose**, and **Cloudflare Turnstile**.

---

## Features

- **Referral system** — unique codes, position tracking, milestone nudges
- **Clerk auth** — sign-up/sign-in, protected dashboard and admin panel
- **Admin panel** — view all signups, top referrers, update user status
- **Rate limiting** — 5 attempts per IP per 10 minutes (atomic, race-condition-proof)
- **GDPR-safe IPs** — raw IPs are never stored; salted `sha256` hashes are used instead
- **Honeypot** — autofill-safe hidden field catches basic bots silently
- **Cloudflare Turnstile** — invisible bot challenge (optional; degrades gracefully in dev)

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

---

## Environment Variables

Copy `.env.local` and fill in each value before deploying.

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | ✅ | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | ✅ | `/dashboard` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your production URL (e.g. `https://yourdomain.com`) |
| `ADMIN_EMAIL` | ✅ | Comma-separated list of admin email addresses |
| `IP_SALT` | ✅ | Random 32-char secret for GDPR-safe IP hashing — generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ⚡ Prod | Cloudflare Turnstile site key — get from [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile |
| `TURNSTILE_SECRET_KEY` | ⚡ Prod | Cloudflare Turnstile secret key (server-side only, **never commit**) |

> **Turnstile keys** are optional in local development — the bot check is skipped gracefully when they are absent.
> In production both must be set together.

---

## Security Architecture

### 1. IP Rate Limiting (Race-Condition Proof)
Uses a single MongoDB `findOneAndUpdate($inc)` atomic upsert. All concurrent bot requests see the incremented counter atomically — no check-then-act window.

### 2. GDPR-Safe IP Storage
Raw IPs are **never** written to the database. Every IP is hashed as `sha256(ip + IP_SALT)` before use. A database breach exposes only irreversible hashes.

### 3. Proxy-Chain IP Extraction
`lib/getClientIp.ts` safely parses the `x-forwarded-for` header — splitting on `,` and taking only the first (real-client) IP. Works correctly behind Vercel, Cloudflare, or any CDN.

### 4. Autofill-Safe Honeypot
A hidden field named `secondary_email_confirm` traps bots. It uses `tabIndex={-1}`, `autoComplete="off"`, and `aria-hidden="true"` to ensure no human browser (or password manager) ever fills it in.

### 5. Cloudflare Turnstile (Bot Challenge)
Server-side verified via `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Tokens are single-use — the client automatically calls `window.turnstile.reset()` on any server error so users can resubmit without a stale token.

---

## Production Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Generate a strong `IP_SALT` with `openssl rand -hex 32`
- [ ] Register a Turnstile site and add both keys to your hosting env vars
- [ ] In Vercel/Netlify — set all env vars in the project dashboard (never commit secrets)
- [ ] Enable MongoDB Atlas IP allowlist for your deployment region

---

## Deploy on Vercel

```bash
npm run build   # verify locally first
```

Then push to GitHub and connect via [vercel.com/new](https://vercel.com/new). Add all environment variables in **Settings → Environment Variables**.
