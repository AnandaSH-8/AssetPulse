## Problems

1. **Auth page ignores the theme toggle.** `src/pages/Auth.tsx` hardcodes dark-only colors (`bg-slate-950`, `text-white`, `bg-white/[0.03]`, `bg-white/5`, `placeholder:text-slate-600`, `border-white/10`, etc.), so switching to light mode on the landing page has no visual effect once you land on `/auth`.
2. **Sidebar footer looks off.** After removing the theme button from `AppSidebar.tsx`, the footer row contains only a small ghost icon button (Sign Out) aligned to the right of an empty flex row, which looks orphaned.

## Fix plan

### 1. Make the Auth page theme-aware

Rework `src/pages/Auth.tsx` to use semantic Tailwind tokens instead of raw dark colors, so the same layout renders correctly in both light and dark themes:

- Page background: `bg-slate-950` → `bg-background` (with the ambient emerald glows kept — they read well on both themes).
- Card surface: `bg-white/[0.03]` → `bg-card/60 backdrop-blur-2xl border-border`.
- Inputs: `bg-white/5 border-white/10 text-white placeholder:text-slate-600` → `bg-muted/40 border-border text-foreground placeholder:text-muted-foreground`.
- Segmented tab track: `bg-white/5` → `bg-muted`. Active pill keeps the emerald accent.
- Divider label pill: replace `bg-slate-950` with `bg-background`.
- Google button: `bg-white/5 hover:bg-white/10 text-white` → `bg-muted/40 hover:bg-muted text-foreground`.
- Body copy currently forced to `text-white` / `text-slate-*` → `text-foreground` / `text-muted-foreground`.
- Keep emerald brand accents (icon, active tab, focus ring, CTA button) unchanged — they already look correct on both themes.

No logic changes: demo prefill, `mode` sync, "Check your inbox" flow, resend cooldown, password-mask override for demo creds all stay as they are.

### 2. Clean up the sidebar footer

In `src/components/AppSidebar.tsx`, restructure the footer row so the lone Sign Out control looks intentional:

- When expanded: render a single full-width `Button` styled `variant="ghost"` with `<LogOut />` + "Sign out" label, matching the visual weight of the nav items above.
- When collapsed: render just the icon button, centered.
- Drop the now-unneeded outer `motion.div` with `justify-content` animation since there is only one child.

No behaviour changes — same `signOut()` handler, same user-info block above it.

### Verification

- Toggle theme on `/` → navigate to `/auth?mode=signin` and `?mode=signup` in both themes; confirm background, card, inputs, tabs, and divider all follow the theme.
- Sign in as any user, open the sidebar expanded and collapsed; confirm the footer Sign Out row looks balanced in both states and in both themes.
- Typecheck.
