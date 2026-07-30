## Goal
After signup, stop showing the "verification link sent" success panel on `/auth`. Instead show a toast that an OTP code was emailed, then send the user straight to the `/confirm-signup` screen with their email pre-filled.

## Changes — `src/pages/Auth.tsx`

1. **Signup handler (`handleEmailAuth`, sign-up branch)**
   - Keep `supabase.auth.signUp(...)` as-is (metadata name/username preserved).
   - On success: toast `"Verification code sent"` / "Enter the code we emailed to {email} to activate your account."
   - Immediately `navigate('/confirm-signup?email=' + encodeURIComponent(email))` instead of setting `signupSuccessEmail`.

2. **Remove the success overlay**
   - Delete the `signupSuccessEmail` state, its conditional block (the "Check your inbox" card with resend + back-to-sign-in), and the now-unneeded `MailCheck` import if unused elsewhere.

3. **Keep the unconfirmed-sign-in path, retarget to OTP**
   - When sign-in fails with `email_not_confirmed`, keep the inline banner but change wording from "verification link" to "verification code", and change its primary action to navigate to `/confirm-signup?email=...` (keeping the resend button, which still triggers a fresh code).

4. `emailRedirectTo` stays set as a harmless fallback; the email template link points at `{{ .SiteURL }}/confirm-signup`.

## Not changed
`src/pages/ConfirmSignup.tsx` already reads `?email=` and verifies via `verifyOtp`, then redirects to `/auth?mode=signin` — no edits needed.
