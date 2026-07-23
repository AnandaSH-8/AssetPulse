## Goal
Handle Supabase's "Confirm email" requirement in the UI so users understand they must verify before signing in.

## Changes

### 1. `src/pages/Auth.tsx` — post-signup "Check your inbox" screen
- Add local state `signupSuccessEmail: string | null`.
- On successful `supabase.auth.signUp(...)`, instead of just showing a toast, set `signupSuccessEmail` to the submitted email.
- When `signupSuccessEmail` is set, render a dedicated confirmation view inside the existing `GlassCard`:
  - Mail icon + heading "Check your inbox"
  - Body: "We sent a verification link to **{email}**. Click it to activate your account, then come back to sign in."
  - Primary button: **Resend verification email** → calls `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: \`${window.location.origin}${nextPath}\` } })`, with loading state + success/error toast, plus a 30s cooldown to prevent spam.
  - Secondary link: **Back to sign in** → resets `signupSuccessEmail`, switches to sign-in mode.

### 2. `src/pages/Auth.tsx` — friendly error on unconfirmed sign-in
- In the `signInWithPassword` catch block, detect Supabase's unconfirmed-email error (`error.code === 'email_not_confirmed'` or message includes "Email not confirmed").
- Show a specific toast: title "Email not verified", description "Please check your inbox for the verification link before signing in."
- Add an inline banner below the sign-in form (only when this error was the last one) with a **Resend verification email** button that calls the same `supabase.auth.resend` flow.

### 3. Signup toast copy
- Update the existing success toast description to: "We've sent a verification link to your email. Confirm it before signing in." (The main UX is the new inbox screen; toast is fallback.)

## Notes for the user (not code changes)
- **Leaked Password Protection**: not under Auth → Providers. In the current Supabase dashboard it lives under **Authentication → Settings** (search for "leaked" or scroll to the **Password Security / Auth Protection** section) — enable "Prevent use of leaked passwords". Once enabled, the existing `AuthProviderHealth` widget will still show it as "action recommended" until the scanner re-runs.
- No changes needed to the existing auth email templates — Supabase's default confirmation email works; the app just needs to guide users through it.
- No new route required: Supabase's confirmation link auto-signs the user in and redirects to `emailRedirectTo` (`${origin}${nextPath}`, defaulting to `/dashboard`), which is already handled by the existing auth state listener.

## Technical detail
- `supabase.auth.resend` signature: `{ type: 'signup', email, options?: { emailRedirectTo } }`. Returns `{ error }`.
- Cooldown implemented with `useState<number>` + `setInterval` on click.
- No DB or edge function changes.
