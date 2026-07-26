## Goal

Add "Download Template" and "Upload Template" actions to the Add Financial Particulars page so users can enter many assets at once via CSV instead of the one-at-a-time form.

## Template format

Five columns, fixed order:

```text
Title, Category, Cash, Invested, Current
```

- Download when the user has no existing entries: headers only, plus one example-free blank row.
- Download when the user already has entries: one row per existing unique title (from the saved titles list), with Title filled and Category / Cash / Invested / Current left empty.
- A second sheet/section is not used — single flat CSV so it opens cleanly anywhere.

## Upload behaviour

- Accepts `.csv` (and `.xlsx`, since the parser already handles both).
- Header validation: the first row must contain exactly the five expected headers (case-insensitive, order-insensitive). If headers are missing, renamed or extra, the upload is rejected with a clear message listing what's wrong — nothing is saved.
- Row validation: Title and Category required; Category must be one of the app's known categories; Cash / Invested / Current must be non-negative numbers (blank = 0).
- Cash-only categories (Bank Account, Cash in Hand, Gold) — if Cash is given and Invested/Current are blank, Current is set to the Cash value and Invested to 0, matching the form's existing behaviour.
- Month and Year come from the Month/Year selectors already on the Add Financial page (per your answer), applied to every row.

## Preview before saving

Upload opens a preview dialog showing the parsed rows in a table with per-row status (valid / error reason). Invalid rows are highlighted and skipped; a Confirm Import button saves the valid ones through the existing `financialAPI.create` path (so encryption and RLS apply unchanged). A summary toast reports how many were added and how many failed.

## Demo account

Both buttons are disabled for the demo/read-only account, consistent with the existing read-only rules on this page.

## Technical notes

- All changes in `src/pages/AddParticulars.tsx`, reusing the `xlsx` library already installed (used by Statistics for its bulk import).
- Template generation with `XLSX.utils.aoa_to_sheet` + `XLSX.writeFile(..., 'AssetsManager_Template.csv')`; existing titles pulled from the `savedTitles` state already fetched on the page.
- Header locking isn't enforceable inside a plain CSV, so protection is done via strict header validation on upload (a note in the UI tells users not to rename the headers).
