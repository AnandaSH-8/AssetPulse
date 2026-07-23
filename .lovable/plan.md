
## Goal

Make the Auth page (`/auth`) match the rest of the application's color system, and remove the theme toggle from this page (theme control already lives on the landing page header).

## Problems observed

1. `src/pages/Auth.tsx` hardcodes `emerald-*` Tailwind colors for the brand mark, tab toggle, primary buttons, focus rings, ambient glows, and helper links. The rest of the app is themed through semantic tokens (`primary`, `primary-foreground`, `ring`, `accent`, etc.) defined in `src/index.css`, so the auth page reads as a different product.
2. A `ThemeToggle` sits in the top-right of the Auth page even though the same control already exists in the public landing header — duplicating the entry point.

## Changes

### 1. `src/pages/Auth.tsx` — recolor with semantic tokens
Replace all hardcoded `emerald-*` classes with the app's design tokens:

- Brand icon tile: `bg-emerald-500` + emerald glow shadow → `bg-primary` + `shadow-[0_0_20px_hsl(var(--primary)/0.4)]`, icon `text-primary-foreground`.
- Ambient background glows: `bg-emerald-500/15` / `bg-emerald-400/10` → `bg-primary/15` and `bg-primary/10` (drop the dark-mode-specific emerald variants so the same tokens theme both modes).
- Selection color: `selection:bg-emerald-500/30` → `selection:bg-primary/30`.
- Input focus ring: `focus:border-emerald-500/60 focus:ring-emerald-500/10` → `focus:border-ring focus:ring-ring/20`.
- Tab toggle active state: `bg-emerald-600 text-white` → `bg-primary text-primary-foreground`.
- Primary CTA buttons ("Sign In / Create Account", "Resend verification", verify-email banner button): `bg-emerald-600 hover:bg-emerald-500 text-white` → `bg-primary hover:bg-primary/90 text-primary-foreground`.
- Success/info accents (MailCheck circle, "Back to sign in" link, "Use demo?" helper, verify-email banner icon): `text-emerald-500` / `bg-emerald-500/10` / `text-emerald-600 dark:text-emerald-500` → `text-primary` / `bg-primary/10`.
- Any remaining `text-white` on primary surfaces → `text-primary-foreground`.

No structural/layout changes — only class swaps so the page automatically follows both light and dark themes.

### 2. `src/pages/Auth.tsx` — remove theme toggle
- Delete the `import { ThemeToggle } from '@/components/ThemeToggle'` line.
- Remove the `<div className="absolute top-4 right-4 z-20"><ThemeToggle /></div>` block.
- Theme continues to be switched from the landing page header before navigating to `/auth`, and persists via `localStorage`.

## Out of scope

- No changes to `ThemeToggle` component, landing page, or global tokens in `index.css`.
- No copy, layout, validation, or auth-flow changes.
