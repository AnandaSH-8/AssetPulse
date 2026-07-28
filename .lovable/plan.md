# Delete a month's data

Today the only removal options are per-entry delete on Statistics and "Clear All Financial Data" in Settings. Nothing removes one month in one go — which is exactly what you need after a bad "Copy Month".

## What to build

Add a **Delete Month Data** row in the Settings → Danger Zone, above "Clear All Financial Data":

- A dropdown listing the months that actually have entries (e.g. `Jun-2026`, `Jul-2026`), newest first, same month-year identifier format used elsewhere.
- Next to it, a red "Delete Month" button, disabled until a month is picked.
- Confirmation dialog stating the month and the exact number of entries that will be removed, e.g. "This will permanently delete 14 entries from Jul 2026."
- On confirm: delete those entries, toast success, refresh the dropdown (removing the now-empty month).
- Disabled for the demo account, matching the existing demo read-only behaviour.

## Technical notes

- `src/pages/Settings.tsx`: load all particulars once via `financialAPI.getAll()`, derive the unique `month-year` options and per-month counts, and reuse the existing `useIsDemoUser` gate.
- Deletion reuses the existing `financialAPI.delete(id)` endpoint, batched over the ids of the selected month — no new edge function, no migration, and existing RLS/demo server-side guards still apply.
- Reuse the existing `AlertDialog` pattern already in the Danger Zone for consistency.

## Not included

No change to the Statistics page itself (per-entry delete stays as is). Say the word if you also want a "Delete This Month" button next to "Copy Month" there.
