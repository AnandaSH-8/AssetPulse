# Admin Settings — Country, single "Last seen", richer visitor details

## What changes on the page

1. **Country column** — shows country name with flag emoji (e.g. "IN India"), or "Unknown" when it can't be determined.
2. **Name column** — the account holder's name when the visitor is signed in (falls back to username, then email); blank for anonymous visitors.
3. **One time column instead of two** — "First seen" and "Last seen" merge into a single **"Last seen"** column (the most recent visit). The first-visit date moves into the row tooltip.
4. **Row tooltip** — hovering a row shows every extra detail we can collect: first seen, city/region, timezone, browser language, operating system + browser, screen size, device type (mobile/tablet/desktop), referrer (where they came from), masked network address, device id, and account id when signed in.
5. **Ordering** — the table always lists the most recent visit first (newest activity at the top), instead of by visit count.

## What we can and cannot know

Extra details are limited to what the browser volunteers and what the network address reveals:

- Available: country, city/region (approximate, from the address), timezone, language, operating system, browser, screen size, device type, referring site, visit counts and times.
- Not available: real name, phone, exact address, or anything personally identifying for someone without an account. Location from a network address is city-level at best and wrong under VPNs or mobile networks.

Raw addresses stay unstored — only the one-way hash and the masked form are kept, as today.

## Technical details

- **Migration** on `public.visitor_events`: add nullable `country_code text`, `country text`, `city text`, `region text`, `timezone text`, `language text`, `platform text`, `screen text`, `device_type text`, `referrer text`. Index on `last_seen desc`.
- **`track-visit` function**: read geo from request headers when present (`cf-ipcountry`, `x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-country-region`); when absent, fall back to a single server-side lookup against a free IP geo endpoint (`https://ipwho.is/<ip>`, no key) guarded by try/catch and skipped for private/localhost addresses. Accept optional client-supplied fields in the POST body — `timezone`, `language`, `screen`, `platform`, `referrer` — validated and length-capped, then persisted on insert/update.
- **`src/lib/visitor.ts`**: send `Intl.DateTimeFormat().resolvedOptions().timeZone`, `navigator.language`, `${screen.width}x${screen.height}`, `navigator.platform`, and `document.referrer` alongside `device_id`.
- **`admin-stats` function**: select the new columns, order by `last_seen desc`, and join `profiles` on `user_id` so each visitor row carries `name`/`username`.
- **`src/pages/AdminSettings.tsx`**: table columns become `# | Identity | Name | Country | Account | Visits | Device | Last seen`; wrap each row in the existing tooltip primitive to show the full detail list; derive device type and flag emoji client-side; drop the separate first-seen column.
- Existing rows keep working — new columns are null and render as "Unknown"/blank until those visitors return.
