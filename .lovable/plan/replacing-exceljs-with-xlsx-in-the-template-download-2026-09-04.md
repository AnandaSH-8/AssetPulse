# Replacing ExcelJS with xlsx in the template download

## Short answer

I would not do it. The 938kB chunk is already loaded only when someone clicks "Download Template" — it is not part of what visitors download when they open the app. Removing it would save nothing for normal use, but it would cost the dropdowns inside the template.

## What would actually change

The template download is the only place ExcelJS is used. Everything else (reading an uploaded file, the Statistics export) already uses the lighter library.

If we switched, the downloaded template would lose:

- Category dropdown per row
- Month dropdown per row
- Year dropdown per row
- The "numbers only" and "pick from list" warnings Excel shows while typing
- Bold header row and column widths / number formatting

The free version of the lighter library cannot write those; they are a paid feature there. People would type categories and months by hand, so more uploads would fail validation and bounce back with errors.

## Size effect, realistically

- App start-up bundle today: unchanged either way — ExcelJS is loaded on demand.
- Only the person clicking "Download Template" fetches the extra file, once, then it is cached.
- Real saving for that one click: roughly 900kB, at the cost of the guardrails above.

## Effort if you still want it

Small: one file, about 80 lines rewritten, plus removing the dependency. Under an hour, low risk of breaking anything else.

## Recommended alternative

Keep ExcelJS for the download, and reduce weight where it actually matters instead:

1. Keep the on-demand loading as is (already done).
2. Optionally show a small "Preparing template…" state on the button so the one-time load feels intentional.

## Technical notes

- `src/components/BulkTemplateCard.tsx` line 84 dynamically imports ExcelJS inside `handleDownload`; Vite emits it as a separate async chunk, so it never enters the initial bundle.
- Data validation (`dataValidation` on cells, `Lists` hidden sheet) has no equivalent in SheetJS CE; `xlsx` writes cell values and basic number formats only.
- A swap would also drop `ws.getRow(1).font` and `ws.columns` width settings, which have no CE equivalent either.

## Decision needed

Tell me which you want: keep ExcelJS as-is (recommended), or swap to `xlsx` and accept a plain template without dropdowns.
