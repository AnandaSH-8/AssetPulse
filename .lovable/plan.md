## Goal
Prevent the demo password from being exposed via the "show password" eye icon, while still letting users reveal their own passwords after clearing the field.

## Current behavior
The eye icon is hidden only when **both** email and password match the demo credentials (`isDemoCreds`). If a user removes the default email, the eye icon reappears even though the demo password is still in the field, allowing the demo password to be revealed.

## Proposed change
In `src/pages/Auth.tsx`:

1. Add a new derived flag `isDemoPassword` that is `true` only when:
   - Not in sign-up mode, and
   - The password field exactly matches `DEMO_PASSWORD`.
2. Use `isDemoPassword` (instead of `isDemoCreds`) to control:
   - The password input `type` (always `password` when demo password is present).
   - The right padding of the input (`pr-4` vs `pr-10`).
   - Whether the eye toggle button is rendered.
3. Keep `isDemoCreds` unchanged for the "Use demo?" helper link and any other demo-account UI logic.

## Result
- Default sign-in: demo password is masked and the eye icon is hidden.
- User clears the password field: eye icon appears so they can type and verify their own password.
- User types a custom password: eye icon stays visible.

## Verification
Check the preview on `/auth?mode=signin`:
1. Eye icon is hidden by default.
2. Remove the email — eye icon stays hidden because demo password is still present.
3. Clear the password — eye icon appears.
4. Type a custom password — eye icon remains visible and toggles visibility correctly.