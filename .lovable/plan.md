## Auth Page Redesign — "Compact Emerald"

Refresh `/auth` with a modern dark glassmorphism look matching the selected direction, while preserving every existing behavior (demo prefill, mode query param, verification inbox state, resend cooldown, error banners, forced-mask on demo creds, back-to-home).

### Scope
Frontend/presentation only. No changes to auth logic, Supabase calls, routes, or environment variables.

### Files
- `src/pages/Auth.tsx` — full visual rewrite; logic preserved.

### Visual system
- Background: `#020617` full-screen with two blurred emerald ambient glows (top-left emerald-600/20, bottom-right emerald-900/20).
- Centered column, max-w 440px.
- Brand header above card: 12x12 emerald-500 rounded square with trending-up icon + glow, "AssetPulse" wordmark, "Your wealth, refined." tagline.
- Auth card: `bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl`.
- Segmented Sign In / Sign Up tab toggle (emerald-600 active pill inside `bg-white/5` track) replacing the current bottom text link. Drives existing `mode` state and updates the URL `?mode=` param.
- Inputs: dark translucent (`bg-white/5`, `border-white/10`), rounded-xl, uppercase tracked labels, emerald focus ring. Password field keeps existing show/hide eye toggle (hidden when demo creds match, per existing rule).
- Primary submit: full-width emerald-600 with soft glow shadow, hover scale.
- Back-to-home: keep as a small link in the top-left of the column (above brand block) with ArrowLeft icon, muted slate.
- Footer legal line under card (Terms / Privacy) — links only if routes exist, otherwise plain text.

### Social auth
- Show a single Google button only. Apple button removed as requested.
- The Google button remains decorative unless the existing Google OAuth flow is already wired; no backend changes.

### Preserved behaviors (unchanged logic)
- Demo prefill only in sign-in mode; clears when switching to sign-up.
- `mode=signin|signup` URL param sync on tab switch.
- Signup success → "Check your inbox" panel with email, resend button, 30s cooldown.
- `email_not_confirmed` amber banner with resend.
- Generic error alerts.
- Confirm password field in sign-up mode + strength requirements.
- Forced password masking when input equals demo creds.
- SEO component and semantic `<main>` retained.

### Out of scope
- No changes to Landing, Dashboard, or any other page.
- No new dependencies.

### Verification
- Typecheck.
- Playwright screenshots of `/auth?mode=signin`, `/auth?mode=signup`, and the post-signup inbox state to confirm rendering and that demo prefill + tab switching still work.