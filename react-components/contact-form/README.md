# Contact Form

## Problem Statement

Build a contact form with three fields — name, email, message — that
validates on submit, shows inline errors next to the specific field
that failed, and replaces itself with a success message once a
simulated submission succeeds.

## Fields

- **Name** — text input, required
- **Email** — text input, required, valid email format
- **Message** — textarea, required, minimum 10 characters
- Submit button

## Behavior

- On submit: validate all fields. Any invalid → show an inline error
  next to that specific field, do not submit.
- All valid → simulate submission (`setTimeout`-wrapped fake async,
  no real backend) → show a success message in place of the form
  (conditional render — form-or-success, never both, no toast).
- Errors clear per keystroke, re-validated: once an error is showing
  for a field, that field's validator re-runs on every subsequent
  keystroke, so the error disappears the moment the field becomes
  valid — not the moment the user starts typing.
- Bonus: Submit is disabled while the fake submission is in flight.

## Concepts Exercised

- Two parallel state objects keyed the same way: `formData` (values)
  and `formErrors` (per-field error strings, empty/undefined when
  valid)
- Per-field validator functions, colocated and unit-testable in
  isolation, called from the submit handler rather than one inline
  validation blob
- A `FormField` sub-component that colocates a label, its input, and
  the field's error display
- Conditional rendering at the top level: fields + submit, or the
  success message — never both

## Structure

```
src/
  App.tsx                    — mounts ContactForm
  types.ts                   — ContactFormData / ContactFormErrors
  components/
    ContactForm.tsx          — owns formData/formErrors state, submit handler,
                                conditional form-or-success render
    FormField.tsx            — label + input/textarea + inline error, presentational
    validators.ts            — validateName / validateEmail / validateMessage
```

`ContactForm`, `FormField`, and `validators` are scaffolded with prop
types and `TODO` markers — the validation and state-management logic
is the exercise.

## Running

```bash
npm install
npm run dev
```

`npm run build` runs `tsc -b` first, so it won't pass until the
`TODO`s are implemented — that's expected on a fresh scaffold.

## Approach

_TBD — fill in after implementing._

## Lessons Learned

_TBD — fill in after implementing._
